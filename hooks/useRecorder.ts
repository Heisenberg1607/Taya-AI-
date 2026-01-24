"use client";

import { useRef, useCallback, useState } from "react";
import type { MemoryResult, RecordState } from "@/types/types";

const RECORDER_CONSTANTS = {
  MIN_BLOB_SIZE_BYTES: 1000,
  CHUNK_INTERVAL_MS: 250,
  SUPPORTED_MIME_TYPES: [
    "audio/mp4",
    "audio/aac",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
  ],
} as const;

interface UseRecorderReturn {
  state: RecordState;
  status: string;
  result: MemoryResult | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

interface ErrorResponse {
  error?: string;
}

function pickMimeType(): string | undefined {
  for (const mimeType of RECORDER_CONSTANTS.SUPPORTED_MIME_TYPES) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported?.(mimeType)
    ) {
      return mimeType;
    }
  }
  return undefined;
}

function getFileExtension(mimeType?: string): string {
  return mimeType?.includes("mp4") ? "recording.mp4" : "recording.webm";
}

export function useRecorder(): UseRecorderReturn {
  const [state, setState] = useState<RecordState>("idle");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<MemoryResult | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const processRecording = useCallback(
    async (blob: Blob, mimeType?: string) => {
      setState("processing");
      setStatus("Uploading → Whisper → Structuring → Saving…");

      if (blob.size < RECORDER_CONSTANTS.MIN_BLOB_SIZE_BYTES) {
        setState("idle");
        setStatus("Error: Audio looks empty/silent. Try again.");
        return;
      }

      const formData = new FormData();
      formData.append("audio", blob, getFileExtension(mimeType));

      try {
        const res = await fetch("/api/memory", {
          method: "POST",
          body: formData,
        });

        const json = (await res.json()) as MemoryResult | ErrorResponse;

        if (!res.ok) {
          const errorMessage =
            "error" in json && json.error
              ? json.error
              : "Something went wrong";
          setState("idle");
          setStatus(`Error: ${errorMessage}`);
          return;
        }

        setResult(json as MemoryResult);
        setState("idle");
        setStatus("Done ✅");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setState("idle");
        setStatus(`Error: ${message}`);
      }
    },
    []
  );

  const start = useCallback(async () => {
    if (state !== "idle") return;

    setStatus("");
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || "application/octet-stream",
        });

        await processRecording(blob, mimeType);
      };

      recorder.start(RECORDER_CONSTANTS.CHUNK_INTERVAL_MS);
      setState("recording");
      setStatus("Recording…");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState("idle");
      setStatus(`Mic error: ${message}`);
    }
  }, [state, processRecording]);

  const stop = useCallback(() => {
    if (state !== "recording") return;

    const recorder = recorderRef.current;
    if (!recorder) return;

    try {
      recorder.requestData?.();
    } catch {
    }

    recorder.stop();
  }, [state]);

  const reset = useCallback(() => {
    setState("idle");
    setStatus("");
    setResult(null);
    chunksRef.current = [];

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  return {
    state,
    status,
    result,
    start,
    stop,
    reset,
  };
}

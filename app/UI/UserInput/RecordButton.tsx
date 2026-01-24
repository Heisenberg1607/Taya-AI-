"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Mic, Loader2, Square } from "lucide-react";
import type { MemoryResult, RecordState } from "@/types/types";

type ErrorResponse = { error?: string };

function pickMimeType(): string | undefined {
  const candidates = [
    "audio/mp4", // Safari
    "audio/aac",
    "audio/webm;codecs=opus", // Chrome/Edge
    "audio/webm",
    "audio/ogg;codecs=opus",
  ];
  for (const t of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported?.(t)
    ) {
      return t;
    }
  }
  return undefined;
}

interface RecordButtonProps {
  state: RecordState;
  onStateChange: (s: RecordState) => void; // single source of truth
  onDone: (result: MemoryResult) => void;
  onStatus: (s: string) => void;
  isDarkMode?: boolean;
}

export function RecordButton({
  state,
  onStateChange,
  onDone,
  onStatus,
  isDarkMode = false,
}: RecordButtonProps) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    if (state !== "idle") return;

    onStatus("");
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
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // stop mic tracks
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        onStateChange("processing");
        onStatus("Uploading → Whisper → Structuring → Saving…");

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || "application/octet-stream",
        });

        if (blob.size < 1000) {
          onStateChange("idle");
          onStatus("Error: Audio looks empty/silent. Try again.");
          return;
        }

        const fd = new FormData();
        fd.append(
          "audio",
          blob,
          mimeType?.includes("mp4") ? "recording.mp4" : "recording.webm"
        );

        try {
          const res = await fetch("/api/memory", { method: "POST", body: fd });
          const json = (await res.json()) as MemoryResult | ErrorResponse;

          if (!res.ok) {
            const msg =
              "error" in json && json.error
                ? json.error
                : "Something went wrong";
            onStateChange("idle");
            onStatus(`Error: ${msg}`);
            return;
          }

          onDone(json as MemoryResult);
          onStateChange("idle");
          onStatus("Done ✅");
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          onStateChange("idle");
          onStatus(`Error: ${msg}`);
        }
      };

      recorder.start(250); // periodic chunks
      onStateChange("recording");
      onStatus("Recording…");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      onStateChange("idle");
      onStatus(`Mic error: ${msg}`);
    }
  };

  const stop = () => {
    if (state !== "recording") return;

    const rec = recorderRef.current;
    if (!rec) return;

    try {
      rec.requestData?.(); // flush
    } catch {}

    rec.stop();
    // state changes to "processing" inside onstop (so UI can show loader)
  };

  const handleClick = () => {
    if (state === "idle") start();
    else if (state === "recording") stop();
  };

  const label =
    state === "idle"
      ? "Start recording"
      : state === "recording"
      ? "Stop recording"
      : "Creating your memory...";

  const Icon =
    state === "processing" ? Loader2 : state === "recording" ? Square : Mic;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {state === "recording" && (
          <>
            <motion.div
              className={`absolute inset-0 rounded-full ${
                isDarkMode ? "bg-indigo-500" : "bg-indigo-400"
              }`}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className={`absolute inset-0 rounded-full ${
                isDarkMode ? "bg-indigo-500" : "bg-indigo-400"
              }`}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.3,
              }}
            />
          </>
        )}

        <motion.button
          onClick={handleClick}
          disabled={state === "processing"}
          className={`relative h-32 w-32 rounded-full flex items-center justify-center transition-all duration-300 ${
            state === "recording"
              ? isDarkMode
                ? "bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/50"
                : "bg-gradient-to-br from-indigo-400 to-purple-400 shadow-2xl shadow-indigo-400/50"
              : isDarkMode
              ? "bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg"
              : "bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          whileHover={{ scale: state === "processing" ? 1 : 1.05 }}
          whileTap={{ scale: state === "processing" ? 1 : 0.95 }}
        >
          <Icon
            className={`h-12 w-12 text-white ${
              state === "processing" ? "animate-spin" : ""
            }`}
          />
        </motion.button>
      </div>

      <p
        className={`text-sm font-medium ${
          isDarkMode ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

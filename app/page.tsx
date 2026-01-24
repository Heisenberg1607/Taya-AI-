"use client";

import { useRef, useState } from "react";

type MemoryResult = {
  id: string;
  created_at: string;
  transcript: string;
  title: string;
  category: string[];
  action_items: string[];
  mood: string;
};

export default function Home() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<MemoryResult | null>(null);

  async function startRecording() {
    setResult(null);
    setStatus("");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });

    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());

      const blob = new Blob(chunksRef.current, { type: "audio/webm" });

      setStatus("Uploading → Whisper → Structuring → Saving…");

      const fd = new FormData();
      fd.append("audio", blob, "recording.webm");

      const res = await fetch("/api/memory", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) {
        setStatus(`Error: ${json.error ?? "Something went wrong"}`);
        return;
      }

      setResult(json);
      setStatus("Done ✅");
    };

    recorder.start();
    setIsRecording(true);
    setStatus("Recording…");
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setIsRecording(false);
  }

  return (
    <div className="p-6">
      <button
        className="border-2 bg-gray-400 px-4 py-2"
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? "Stop recording" : "Start recording"}
      </button>

      {status && <div className="mt-4 text-sm">{status}</div>}

      {result && (
        <pre className="mt-4 rounded bg-black/5 p-3 text-xs overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

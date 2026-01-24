"use client";

import { RecordButton } from "@/app/UI/UserInput/RecordButton";
import { MemoryCard } from "@/app/UI/MemoryCards/MemoryCard";
import { Header } from "@/app/UI/Header/Header";
import { useRecorder } from "@/hooks/useRecorder";

export default function Home() {
  const { state, status, result, start, stop } = useRecorder();

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <Header isDarkMode={false} />

      <div className="py-10 flex justify-center">
        <RecordButton
          state={state}
          onStart={start}
          onStop={stop}
          isDarkMode={false}
        />
      </div>

      {!!status && (
        <div className="text-sm text-slate-600 text-center">{status}</div>
      )}

      {result && <MemoryCard data={result} />}
    </main>
  );
}

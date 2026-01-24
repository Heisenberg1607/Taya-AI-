// app/page.tsx
"use client";

import { useState } from "react";
import { RecordButton } from "@/app/UI/UserInput/RecordButton";
import { MemoryCard } from "@/app/UI/MemoryCards/MemoryCard";
import { MemoryResult, RecordState } from "@/types/types";
import {Header} from "@/app/UI/Header/Header";

export default function Home() {
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<MemoryResult | null>(null);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <Header isDarkMode={false} ></Header>

      <div className="py-10 flex justify-center">
        <RecordButton
          state={recordState}
          onStateChange={setRecordState}
          onStatus={setStatus}
          onDone={setResult} // same thing
          isDarkMode={false}
        />
      </div>

      {!!status && <div className="text-sm text-slate-600">{status}</div>}

      {result && <MemoryCard data={result} />}
    </main>
  );
}

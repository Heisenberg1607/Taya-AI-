"use client";

import { RecordButton } from "@/app/UI/UserInput/RecordButton";
import { MemoryCard } from "@/app/UI/MemoryCards/MemoryCard";
import { Header } from "@/app/UI/Header/Header";
import { useRecorder } from "@/hooks/useRecorder";

export default function Home() {
  const { state, status, result, start, stop } = useRecorder();

  return (
    <main className="min-h-screen bg-slate-50">
      <Header isDarkMode={false} />

      <div className="mx-auto max-w-5xl p-6 lg:h-screen lg:flex lg:items-center lg:justify-center">
        <div className="flex flex-col lg:flex-row items-stretch justify-center lg:align-center gap-6 ">
          <div className="w-full lg:w-[400px] flex flex-col">
            {/* there are three types of states - idle , recording, processing */}
            <RecordButton state={state} onStart={start} onStop={stop} /> 
            {/* {!!status && (
              <div className="text-sm text-slate-600 text-center mt-4">
                {status}
              </div>
            )} */}
          </div>

          {result && (
            <div className="w-full lg:w-[400px]">
              <MemoryCard data={result} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

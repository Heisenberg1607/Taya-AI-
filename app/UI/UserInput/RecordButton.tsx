"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Mic, Loader2, Square, Type } from "lucide-react";
import type { RecordState } from "@/types/types";
import { Card } from "@/components/ui/card";

const PULSE_DURATION_SECONDS = 1.5;
const PULSE_DELAY_SECONDS = 0.3;
const HOVER_SCALE = 1.05;
const TAP_SCALE = 0.95;
const PULSE_SCALE_OUTER = 1.3;
const PULSE_SCALE_INNER = 1.5;

interface RecordButtonProps {
  state: RecordState;
  onStart: () => void;
  onStop: () => void;
  onSwitchToText?: () => void;
}

//record button is passed to pages.tsx. And receiving props from pages.tsx. 
// And then passed to the record button as a prop.

//the only thing the record button operates on is the state of the recording. 

function RecordButtonComponent({
  state,
  onStart,
  onStop,
  onSwitchToText,
}: RecordButtonProps) {
  const handleClick = () => {
    if (state === "idle") {
      onStart();
    } else if (state === "recording") {
      onStop();
    }
  };

  const label =
    state === "idle"
      ? "Hold to speak"
      : state === "recording"
      ? "Release to stop"
      : "Creating your memory...";

  return (
    <Card className="h-full w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50 flex flex-col">
      <h2 className="text-2xl font-semibold text-slate-900 mb-8">
        Create a Memory
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          {state === "recording" && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-violet-400"
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: PULSE_SCALE_OUTER, opacity: 0 }}
                transition={{
                  duration: PULSE_DURATION_SECONDS,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-violet-400"
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: PULSE_SCALE_INNER, opacity: 0 }}
                transition={{
                  duration: PULSE_DURATION_SECONDS,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: PULSE_DELAY_SECONDS,
                }}
              />
            </>
          )}
{/* Styling and changing the state and icons of the record button from here */}
          <motion.button
            onClick={handleClick}
            disabled={state === "processing"}
            className={`
              relative h-36 w-36 rounded-full flex items-center justify-center
              bg-gradient-to-br from-violet-500 to-purple-600
              shadow-xl shadow-violet-500/30
              border-4 border-white/20
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              ${state === "recording" ? "shadow-2xl shadow-violet-500/50" : ""}
            `}
            whileHover={{ scale: state === "processing" ? 1 : HOVER_SCALE }}
            whileTap={{ scale: state === "processing" ? 1 : TAP_SCALE }}
          >
            {state === "idle" && (
              <Mic className="h-14 w-14 text-white" strokeWidth={1.5} />
            )}
            {state === "recording" && (
              <Square className="h-12 w-12 text-white" strokeWidth={1.5} />
            )}
            {state === "processing" && (
              <Loader2 className="h-14 w-14 text-white animate-spin" strokeWidth={1.5} />
            )}
          </motion.button>
        </div>

        <p className="text-base font-medium text-slate-700">{label}</p>

        {onSwitchToText && state === "idle" && (
          <button
            onClick={onSwitchToText}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mt-2"
          >
            <Type className="h-4 w-4" />
            Switch to text
          </button>
        )}

        {!onSwitchToText && state === "idle" && (
          <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
            <Type className="h-4 w-4" />
            Switch to text
          </div>
        )}
      </div>
    </Card>
  );
}

export const RecordButton = memo(RecordButtonComponent);

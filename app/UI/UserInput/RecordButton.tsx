"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Mic, Loader2, Square } from "lucide-react";
import type { RecordState } from "@/types/types";

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
  isDarkMode?: boolean;
}

function RecordButtonComponent({
  state,
  onStart,
  onStop,
  isDarkMode = false,
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
      ? "Start recording"
      : state === "recording"
      ? "Stop recording"
      : "Creating your memory...";

  const baseStyles =
    "relative h-32 w-32 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  const buttonStyles =
    state === "recording"
      ? `${baseStyles} ${
          isDarkMode
            ? "bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/50"
            : "bg-gradient-to-br from-indigo-400 to-purple-400 shadow-2xl shadow-indigo-400/50"
        }`
      : `${baseStyles} ${
          isDarkMode
            ? "bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg"
            : "bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg"
        }`;

  const pulseColor = isDarkMode ? "bg-indigo-500" : "bg-indigo-400";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {state === "recording" && (
          <>
            <motion.div
              className={`absolute inset-0 rounded-full ${pulseColor}`}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: PULSE_SCALE_OUTER, opacity: 0 }}
              transition={{
                duration: PULSE_DURATION_SECONDS,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
            <motion.div
              className={`absolute inset-0 rounded-full ${pulseColor}`}
              initial={{ scale: 1, opacity: 0.5 }}
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

        <motion.button
          onClick={handleClick}
          disabled={state === "processing"}
          className={buttonStyles}
          whileHover={{ scale: state === "processing" ? 1 : HOVER_SCALE }}
          whileTap={{ scale: state === "processing" ? 1 : TAP_SCALE }}
        >
          {state === "idle" && <Mic className="h-12 w-12 text-white" />}
          {state === "recording" && <Square className="h-12 w-12 text-white" />}
          {state === "processing" && (
            <Loader2 className="h-12 w-12 text-white animate-spin" />
          )}
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

export const RecordButton = memo(RecordButtonComponent);

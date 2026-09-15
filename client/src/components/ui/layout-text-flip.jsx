"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const LayoutTextFlip = ({
  text = "",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
  className = "",
  pillClassName = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [duration, words.length]);

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {text ? (
        <motion.span
          layoutId="subtext"
          className="font-bold tracking-tight"
        >
          {text}
        </motion.span>
      ) : null}

      <motion.span
        layout
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-white px-3 py-1 font-mono text-xl sm:text-3xl font-bold tracking-tight text-slate-900 shadow-sm ring-1 ring-slate-900/5",
          pillClassName
        )}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={currentIndex}
            initial={{ y: -40, filter: "blur(10px)" }}
            animate={{
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
            transition={{
              duration: 0.5,
            }}
            className={cn("inline-block whitespace-nowrap")}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  );
};

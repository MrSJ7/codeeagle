"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Cpu,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  RotateCcw,
  ListTree,
  GitBranch,
  Terminal,
  Hash,
} from "lucide-react";

/**
 * Props for the generic BentoGrid container.
 */
export interface BentoGridProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Props for an individual BentoCard slot.
 */
export interface BentoCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2 | 3;
}

// Container animation variants for staggered scroll reveal
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

// Item animation variants with restrained motion
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * Reusable BentoGrid component supporting viewport-triggered reveals.
 */
export const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : containerVariants}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={cn(
        "grid w-full grid-cols-1 gap-4 md:grid-cols-3 auto-rows-[minmax(180px,auto)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Reusable BentoCard slot with warm neutral graphite styling.
 */
export const BentoCard = ({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  ...props
}: BentoCardProps) => {
  const shouldReduceMotion = useReducedMotion();

  const colClasses = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
  };

  const rowClasses = {
    1: "md:row-span-1",
    2: "md:row-span-2",
    3: "md:row-span-3",
  };

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : itemVariants}
      className={cn(
        colClasses[colSpan],
        rowClasses[rowSpan],
        "relative flex flex-col justify-between overflow-hidden rounded-[8px] p-5 sm:p-6",
        "bg-[#0E0E0E] hover:bg-[#121212] transition-colors duration-200",
        "border border-[#222222] hover:border-[#333333]",
        "shadow-[0_1px_3px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.03)_inset]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * CodeEagle-Specific Architecture Bento Showcase
 * 100% grounded in real CodeEagle engine capabilities:
 * - Babel AST Parser
 * - Gemini Contextual Reasoning
 * - Single-Authority SHA-256 Hash Guard
 * - Line-Grounded Findings
 * - Real-Time Automated Re-Auditing
 * - Executable Unified Diffs & Audit History
 */
export function CodeEagleBentoShowcase({ className }: { className?: string }) {
  return (
    <BentoGrid className={className}>
      {/* 1. Tall Card: Babel AST Compiler-Grade Guard (Spans 2 rows on desktop) */}
      <BentoCard colSpan={1} rowSpan={2} className="justify-between bg-gradient-to-b from-[#111111] to-[#0A0A0A]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-brand-500/10 border border-brand-500/20 text-brand-500">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-[4px] bg-[#1A1A1A] text-[#A6A29B] border border-[#2A2A2A]">
              Deterministic Engine
            </span>
          </div>

          <h3 className="text-lg font-bold text-[#F5F3EF] tracking-tight mb-2">
            Babel AST Parser
          </h3>
          <p className="text-xs text-[#A6A29B] leading-relaxed mb-4">
            Directly parses JavaScript and JSX into standard abstract syntax trees. Traverses nodes locally before external calls, ensuring zero false negatives on syntax flaws and hardcoded secrets.
          </p>

          {/* AST Traversal Hierarchy Display */}
          <div className="rounded-[6px] bg-[#070707] border border-[#1E1E1E] p-3 font-mono text-[11px] space-y-1.5 text-[#D4D0C8]">
            <div className="flex items-center gap-1.5 text-brand-400 font-semibold text-[10px] uppercase tracking-wider">
              <Terminal className="h-3 w-3" />
              <span>AST Visitor Pipeline</span>
            </div>
            <div className="text-[10px] text-[#74716C] pl-2 border-l border-[#222222]">
              <div>&gt; Program.body[0]</div>
              <div className="text-brand-300">&gt; VariableDeclaration</div>
              <div className="text-red-400">&gt; Literal (entropy: high)</div>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-[#1C1C1C] flex items-center justify-between text-[11px] font-mono text-[#74716C]">
          <span>Coverage</span>
          <span className="text-brand-400 font-bold">13 Built-in Rules</span>
        </div>
      </BentoCard>

      {/* 2. Top Middle: Gemini Contextual AI Reasoning */}
      <BentoCard colSpan={1} rowSpan={1}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-[#181818] border border-[#282828] text-brand-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-mono text-[10px] uppercase text-[#74716C]">
              Semantic Audit
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#F5F3EF] mb-1">
            Gemini Contextual AI
          </h3>
          <p className="text-xs text-[#A6A29B] leading-relaxed">
            Catches nuanced race conditions, missing input sanitization, and subtle business logic vulnerabilities beyond deterministic syntax rules.
          </p>
        </div>
        <div className="pt-3 border-t border-[#1C1C1C] text-[11px] font-mono text-brand-400">
          Hybrid AST + AI Synergy
        </div>
      </BentoCard>

      {/* 3. Top Right: Single-Authority SHA-256 Guard */}
      <BentoCard colSpan={1} rowSpan={1}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-[#181818] border border-[#282828] text-[#38C793]">
              <Hash className="h-4 w-4" />
            </div>
            <span className="font-mono text-[10px] uppercase text-[#38C793]">
              Cryptographic
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#F5F3EF] mb-1">
            SHA-256 Hash Guard
          </h3>
          <p className="text-xs text-[#A6A29B] leading-relaxed">
            Single-authority checksum calculated directly from raw source. Prevents stale mutations and duplicate patch conflicts.
          </p>
        </div>
        <div className="pt-3 border-t border-[#1C1C1C] text-[10px] font-mono text-[#74716C] truncate">
          checksum: 64-char hex verification
        </div>
      </BentoCard>

      {/* 4. Middle Middle: Line-Grounded Findings */}
      <BentoCard colSpan={1} rowSpan={1}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-[#181818] border border-[#282828] text-brand-500">
              <ListTree className="h-4 w-4" />
            </div>
            <span className="font-mono text-[10px] uppercase text-[#74716C]">
              Precision
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#F5F3EF] mb-1">
            Line-Grounded Findings
          </h3>
          <p className="text-xs text-[#A6A29B] leading-relaxed">
            Pinpoints exact start and end line ranges. Clicking any finding highlights the editor canvas and activates gutter severity markers.
          </p>
        </div>
        <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between text-[11px] font-mono text-[#74716C]">
          <span>Gutter Sync</span>
          <span className="text-[#F5F3EF] font-semibold">1:1 Line Map</span>
        </div>
      </BentoCard>

      {/* 5. Middle Right: Real-Time Re-Auditing Loop */}
      <BentoCard colSpan={1} rowSpan={1}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-[#181818] border border-[#282828] text-brand-400">
              <RotateCcw className="h-4 w-4" />
            </div>
            <span className="font-mono text-[10px] uppercase text-brand-500">
              Instant
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#F5F3EF] mb-1">
            Automated Re-Auditing
          </h3>
          <p className="text-xs text-[#A6A29B] leading-relaxed">
            Applying a fix immediately re-evaluates the code in memory, updating the security score from 50 to 100 without manual restarts.
          </p>
        </div>
        <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between text-[11px] font-mono text-[#38C793]">
          <span>Score Delta</span>
          <span className="font-bold">+25 pts per fix</span>
        </div>
      </BentoCard>

      {/* 6. Wide Bottom Card: Verified Unified Diffs & Persistent History (Spans 3 cols on desktop) */}
      <BentoCard colSpan={3} rowSpan={1} className="bg-gradient-to-r from-[#0E0E0E] via-[#121212] to-[#0E0E0E]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-brand-500/10 border border-brand-500/20 text-brand-500">
                <FileCode className="h-4 w-4" />
              </div>
              <span className="font-mono text-[10px] tracking-wider uppercase text-brand-400 font-semibold">
                Verified Executable Patches & History
              </span>
            </div>
            <h3 className="text-base font-bold text-[#F5F3EF]">
              Senior Staff PR Comments & Verified Unified Diffs
            </h3>
            <p className="text-xs text-[#A6A29B] leading-relaxed">
              Every finding includes rationale, remediation advice, and an executable unified diff. All audits are stored in review history with instant single-click state restoration.
            </p>
          </div>

          <div className="md:col-span-6">
            {/* Real Code Diff Preview */}
            <div className="rounded-[6px] bg-[#070707] border border-[#222222] p-3 font-mono text-[11px] space-y-1">
              <div className="text-[10px] text-[#74716C] mb-1 flex items-center justify-between">
                <span>Unified Diff Preview</span>
                <span className="text-[#38C793] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <div className="px-2 py-1 rounded-[3px] bg-red-950/40 text-red-400 border border-red-900/30 truncate">
                - const JWT_SECRET = &quot;production_super_secret_key_12345&quot;;
              </div>
              <div className="px-2 py-1 rounded-[3px] bg-emerald-950/40 text-emerald-300 border border-emerald-900/30 truncate">
                + const JWT_SECRET = process.env.JWT_SECRET;
              </div>
            </div>
          </div>
        </div>
      </BentoCard>
    </BentoGrid>
  );
}

import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Layers,
  Sparkles,
  GitBranch,
  RefreshCw,
  Clock,
  ExternalLink
} from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { cn } from "@/lib/utils";

/**
 * High-Density Project Overview Screen
 * Provides immediate executive visibility into project health, top priority defects, and files.
 */
export function ProjectOverview({
  project,
  review,
  onSelectFile,
  onSelectFinding,
  onOpenWorkspace,
  onReAnalyze,
  isAnalyzing = false,
}) {
  const { isLight } = useTheme();

  if (!review) return null;

  const score = review.score ?? 100;
  const severityCounts = review.severityCounts || { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
  const topPriorities = review.topPriorities || [];
  const files = review.files || [];

  const filesWithIssues = files.filter((f) => (f.findingCount || 0) > 0);
  const cleanFiles = files.filter((f) => f.status === "SUCCESS" && (f.findingCount || 0) === 0);
  const skippedFiles = files.filter((f) => f.status === "SKIPPED");

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Project Identity & Action Bar */}
      <div className={cn(
        "p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm",
        isLight ? "bg-white border-slate-200" : "bg-[#0E0E0E] border-[#222222]"
      )}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className={cn(
              "px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider border",
              isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-[#181818] border-[#2E2E2E] text-obsidian-300"
            )}>
              {review.sourceType || "Project"}
            </span>
            <h1 className="text-2xl font-bold tracking-tight">{review.projectName || project?.name || "Code Project"}</h1>
          </div>
          <div className={cn("flex flex-wrap items-center gap-4 text-xs font-sans", isLight ? "text-slate-500" : "text-obsidian-400")}>
            <span>{review.filesAnalyzed} JavaScript/JSX files analyzed</span>
            <span>·</span>
            <span>{review.filesSkipped} files skipped</span>
            <span>·</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {new Date(review.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onReAnalyze && (
            <Button
              variant="secondary"
              size="md"
              onClick={onReAnalyze}
              disabled={isAnalyzing}
              isLoading={isAnalyzing}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Re-analyze
            </Button>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={onOpenWorkspace}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Review All Findings ({review.findings?.length || 0})
          </Button>
        </div>
      </div>

      {/* 2. Health Score & Severity Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Overall Project Health Score */}
        <div className={cn(
          "md:col-span-4 p-6 rounded-2xl border flex flex-col justify-between shadow-sm",
          isLight ? "bg-white border-slate-200" : "bg-[#0E0E0E] border-[#222222]"
        )}>
          <span className={cn("text-xs font-semibold uppercase tracking-wider", isLight ? "text-slate-500" : "text-obsidian-400")}>
            Project Health Score
          </span>

          <div className="my-4 flex items-baseline gap-3">
            <span className="text-6xl font-black font-mono tracking-tight">{score}</span>
            <span className={cn("text-xl font-medium", isLight ? "text-slate-400" : "text-obsidian-500")}>/ 100</span>
          </div>

          <div>
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border",
              score >= 85
                ? isLight ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-emerald-950/30 text-emerald-400 border-emerald-900/40"
                : score >= 60
                ? isLight ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-amber-950/30 text-amber-400 border-amber-900/40"
                : isLight ? "bg-red-50 text-red-700 border-red-200" : "bg-red-950/30 text-red-400 border-red-900/40"
            )}>
              {score >= 85 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{review.healthStatusLabel || (score >= 85 ? "Healthy Codebase" : score >= 60 ? "Needs Attention" : "Critical Risk")}</span>
            </div>
            <p className={cn("text-xs mt-2 leading-relaxed", isLight ? "text-slate-600" : "text-obsidian-400")}>
              {severityCounts.critical > 0
                ? `${severityCounts.critical} critical security or reliability defects require immediate resolution.`
                : severityCounts.total > 0
                ? `${severityCounts.total} total findings detected across ${filesWithIssues.length} files.`
                : "Zero defects detected across all reviewed files."}
            </p>
          </div>
        </div>

        {/* Severity Counters & Scope Summary */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={cn(
            "p-5 rounded-xl border flex flex-col justify-between shadow-xs",
            isLight ? "bg-white border-slate-200" : "bg-[#0E0E0E] border-[#222222]"
          )}>
            <div className="flex items-center justify-between text-red-500">
              <span className="text-xs font-bold uppercase">Critical</span>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black font-mono my-2">{severityCounts.critical || 0}</div>
            <p className={cn("text-[11px]", isLight ? "text-slate-500" : "text-obsidian-400")}>Blockers / Secrets</p>
          </div>

          <div className={cn(
            "p-5 rounded-xl border flex flex-col justify-between shadow-xs",
            isLight ? "bg-white border-slate-200" : "bg-[#0E0E0E] border-[#222222]"
          )}>
            <div className="flex items-center justify-between text-brand-500">
              <span className="text-xs font-bold uppercase">High</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black font-mono my-2">{severityCounts.high || 0}</div>
            <p className={cn("text-[11px]", isLight ? "text-slate-500" : "text-obsidian-400")}>Security / Memory</p>
          </div>

          <div className={cn(
            "p-5 rounded-xl border flex flex-col justify-between shadow-xs",
            isLight ? "bg-white border-slate-200" : "bg-[#0E0E0E] border-[#222222]"
          )}>
            <div className="flex items-center justify-between text-amber-500">
              <span className="text-xs font-bold uppercase">Medium</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black font-mono my-2">{severityCounts.medium || 0}</div>
            <p className={cn("text-[11px]", isLight ? "text-slate-500" : "text-obsidian-400")}>Quality / Hooks</p>
          </div>

          <div className={cn(
            "p-5 rounded-xl border flex flex-col justify-between shadow-xs",
            isLight ? "bg-white border-slate-200" : "bg-[#0E0E0E] border-[#222222]"
          )}>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase">Low</span>
              <Info className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black font-mono my-2">{severityCounts.low || 0}</div>
            <p className={cn("text-[11px]", isLight ? "text-slate-500" : "text-obsidian-400")}>Style / Linters</p>
          </div>
        </div>
      </div>

      {/* 3. Top Priority Findings */}
      {topPriorities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Top Priority Defects</h2>
            <span className={cn("text-xs font-medium", isLight ? "text-slate-500" : "text-obsidian-400")}>
              Ranked deterministically by severity and confidence
            </span>
          </div>

          <div className="space-y-3">
            {topPriorities.map((finding, idx) => (
              <div
                key={finding.id || idx}
                onClick={() => onSelectFinding(finding)}
                className={cn(
                  "p-4 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all hover:scale-[1.005] group",
                  isLight
                    ? "bg-white border-slate-200 hover:border-blue-500/50 hover:shadow-md"
                    : "bg-[#0E0E0E] border-[#222222] hover:border-brand-500/40 hover:bg-[#121212]"
                )}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5",
                    finding.severity === "CRITICAL"
                      ? "bg-red-500/10 text-red-500 border border-red-500/20"
                      : finding.severity === "HIGH"
                      ? "bg-brand-500/10 text-brand-500 border border-brand-500/20"
                      : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  )}>
                    {idx + 1}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold truncate group-hover:text-brand-400 transition-colors">
                        {finding.title}
                      </h4>
                      <span className={cn(
                        "px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase",
                        finding.severity === "CRITICAL"
                          ? "bg-red-500/15 text-red-500"
                          : finding.severity === "HIGH"
                          ? "bg-brand-500/15 text-brand-500"
                          : "bg-amber-500/15 text-amber-500"
                      )}>
                        {finding.severity}
                      </span>
                    </div>

                    <p className={cn("text-xs line-clamp-1", isLight ? "text-slate-600" : "text-obsidian-400")}>
                      {finding.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground pt-0.5">
                      <span className="font-semibold text-slate-800 dark:text-obsidian-200">{finding.path}</span>
                      <span>:</span>
                      <span>Line {finding.line}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="xs"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="shrink-0"
                >
                  Jump to Line
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Files Breakdown Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Project File Breakdown</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => {
            const hasIssues = (file.findingCount || 0) > 0;
            const isSkipped = file.status === "SKIPPED";

            return (
              <div
                key={file.id}
                onClick={() => !isSkipped && onSelectFile(file)}
                className={cn(
                  "p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all",
                  isSkipped
                    ? isLight ? "bg-slate-50 border-slate-200 opacity-65" : "bg-[#111111] border-[#222222] opacity-60"
                    : isLight
                    ? "bg-white border-slate-200 hover:border-blue-500/40 hover:shadow-sm cursor-pointer"
                    : "bg-[#0E0E0E] border-[#222222] hover:border-brand-500/40 hover:bg-[#121212] cursor-pointer"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode className={cn("w-4 h-4 shrink-0", hasIssues ? "text-brand-500" : "text-muted-foreground")} />
                    <span className="text-xs font-mono font-semibold truncate" title={file.path}>
                      {file.path}
                    </span>
                  </div>

                  {hasIssues ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/15 text-brand-500 shrink-0">
                      {file.findingCount} {file.findingCount === 1 ? "issue" : "issues"}
                    </span>
                  ) : isSkipped ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-muted-foreground border shrink-0">
                      Skipped
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Clean
                    </span>
                  )}
                </div>

                <div className={cn("flex items-center justify-between text-[11px]", isLight ? "text-slate-500" : "text-obsidian-400")}>
                  <span>{file.language}</span>
                  <span>{file.lineCount ? `${file.lineCount} lines` : `${Math.round(file.size / 1024)} KB`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

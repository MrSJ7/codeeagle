import React, { useState, useMemo } from "react";
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
  ExternalLink,
  Lightbulb,
  Search,
  X
} from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { cn } from "@/lib/utils";

function getFileBadge(filename = "") {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
      return { label: "TS", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
    case "tsx":
      return { label: "TSX", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" };
    case "js":
    case "mjs":
    case "cjs":
      return { label: "JS", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    case "jsx":
      return { label: "JSX", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" };
    case "json":
      return { label: "JSON", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
    case "css":
    case "scss":
      return { label: "CSS", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" };
    default:
      return { label: ext?.toUpperCase() || "FILE", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" };
  }
}

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

  const [fileSearch, setFileSearch] = useState("");
  const [fileFilterTab, setFileFilterTab] = useState("all");

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      if (fileFilterTab === "issues" && (file.findingCount || 0) === 0) return false;
      if (fileFilterTab === "clean" && (file.status !== "SUCCESS" || (file.findingCount || 0) > 0)) return false;
      if (fileFilterTab === "skipped" && file.status !== "SKIPPED") return false;

      if (!fileSearch.trim()) return true;
      const q = fileSearch.toLowerCase().trim();
      return (file.path || "").toLowerCase().includes(q) || (file.filename || "").toLowerCase().includes(q);
    });
  }, [files, fileSearch, fileFilterTab]);

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
            <span>{review.filesAnalyzed} code files analyzed</span>
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
            {topPriorities.map((finding, idx) => {
              const lineDisplay = finding.endLine && finding.endLine !== finding.line
                ? `Lines ${finding.line}–${finding.endLine}`
                : `Line ${finding.line}`;

              return (
                <div
                  key={finding.id || idx}
                  onClick={() => onSelectFinding(finding)}
                  className={cn(
                    "p-4 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer transition-all hover:scale-[1.003] group",
                    isLight
                      ? "bg-white border-slate-200 hover:border-blue-500/50 hover:shadow-md"
                      : "bg-[#0E0E0E] border-[#222222] hover:border-brand-500/40 hover:bg-[#121212]"
                  )}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
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

                    <div className="min-w-0 space-y-2 flex-1">
                      {/* Header: Title, Severity, Rule, Category */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold group-hover:text-brand-400 transition-colors">
                          {finding.title}
                        </h4>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                          finding.severity === "CRITICAL"
                            ? "bg-red-500/15 text-red-500"
                            : finding.severity === "HIGH"
                            ? "bg-brand-500/15 text-brand-500"
                            : "bg-amber-500/15 text-amber-500"
                        )}>
                          {finding.severity}
                        </span>
                        {finding.rule && (
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border",
                            isLight
                              ? "bg-slate-100 border-slate-200 text-slate-700"
                              : "bg-[#181818] border-[#2E2E2E] text-obsidian-300"
                          )}>
                            {finding.rule}
                          </span>
                        )}
                        {finding.category && (
                          <span className={cn(
                            "text-[10px] font-mono uppercase tracking-wider font-semibold",
                            isLight ? "text-slate-500" : "text-obsidian-400"
                          )}>
                            {finding.category}
                          </span>
                        )}
                      </div>

                      {/* Exact Defect Description (Unclamped) */}
                      <p className={cn("text-xs leading-relaxed font-sans", isLight ? "text-slate-600" : "text-obsidian-300")}>
                        {finding.description}
                      </p>

                      {/* Actionable Recommendation Callout */}
                      {finding.recommendation && (
                        <div className={cn(
                          "p-2.5 rounded-lg border text-xs flex items-start gap-2.5",
                          isLight
                            ? "bg-amber-50/70 border-amber-200/80 text-amber-900"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                        )}>
                          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-semibold block text-[10px] uppercase tracking-wider">
                              Recommended Fix
                            </span>
                            <span className={cn("leading-relaxed block", isLight ? "text-amber-800" : "text-amber-200/90")}>
                              {finding.recommendation}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* File Path & Line Location */}
                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground pt-0.5 flex-wrap">
                        <span className="font-semibold text-slate-800 dark:text-obsidian-200">{finding.path}</span>
                        <span>:</span>
                        <span className="text-slate-600 dark:text-obsidian-400">{lineDisplay}</span>
                        {typeof finding.confidence === 'number' && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 dark:text-obsidian-500">{Math.round(finding.confidence * 100)}% confidence</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="xs"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="shrink-0 self-start sm:self-center"
                  >
                    Jump to Line
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Files Breakdown Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Project File Breakdown</h2>
            <p className={cn("text-xs", isLight ? "text-slate-500" : "text-obsidian-400")}>
              Showing {filteredFiles.length} of {files.length} files
            </p>
          </div>

          {/* Search Bar & Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files..."
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                className={cn(
                  "w-44 sm:w-52 pl-8 pr-7 py-1 rounded-md text-xs font-mono outline-none border transition-all",
                  isLight
                    ? "bg-white border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                    : "bg-[#141414] border-[#262626] focus:border-brand-500 text-obsidian-100 placeholder:text-obsidian-500"
                )}
              />
              {fileSearch && (
                <button
                  type="button"
                  onClick={() => setFileSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 p-0.5 rounded-lg border bg-slate-100/60 dark:bg-[#141414] dark:border-[#262626]">
              <button
                type="button"
                onClick={() => setFileFilterTab("all")}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                  fileFilterTab === "all"
                    ? isLight ? "bg-white text-slate-900 shadow-xs font-bold" : "bg-[#202020] text-white shadow-xs font-bold"
                    : isLight ? "text-slate-600 hover:text-slate-900" : "text-obsidian-400 hover:text-obsidian-200"
                )}
              >
                All ({files.length})
              </button>
              <button
                type="button"
                onClick={() => setFileFilterTab("issues")}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                  fileFilterTab === "issues"
                    ? isLight ? "bg-white text-brand-600 shadow-xs font-bold" : "bg-[#202020] text-brand-400 shadow-xs font-bold"
                    : isLight ? "text-slate-600 hover:text-slate-900" : "text-obsidian-400 hover:text-obsidian-200"
                )}
              >
                Issues ({filesWithIssues.length})
              </button>
              <button
                type="button"
                onClick={() => setFileFilterTab("clean")}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                  fileFilterTab === "clean"
                    ? isLight ? "bg-white text-emerald-600 shadow-xs font-bold" : "bg-[#202020] text-emerald-400 shadow-xs font-bold"
                    : isLight ? "text-slate-600 hover:text-slate-900" : "text-obsidian-400 hover:text-obsidian-200"
                )}
              >
                Clean ({cleanFiles.length})
              </button>
              {skippedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFileFilterTab("skipped")}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                    fileFilterTab === "skipped"
                      ? isLight ? "bg-white text-slate-900 shadow-xs font-bold" : "bg-[#202020] text-white shadow-xs font-bold"
                      : isLight ? "text-slate-600 hover:text-slate-900" : "text-obsidian-400 hover:text-obsidian-200"
                  )}
                >
                  Filtered ({skippedFiles.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className={cn(
            "p-12 text-center rounded-2xl border flex flex-col items-center justify-center gap-2",
            isLight ? "bg-slate-50 border-slate-200" : "bg-[#0E0E0E] border-[#222222]"
          )}>
            <Search className="w-6 h-6 text-muted-foreground opacity-40" />
            <p className="text-sm font-semibold">No matching files found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search query or filter tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => {
              const hasIssues = (file.findingCount || 0) > 0;
              const isSkipped = file.status === "SKIPPED";
              const badge = getFileBadge(file.filename || file.path);
              const dirPath = file.path?.includes("/") ? file.path.substring(0, file.path.lastIndexOf("/")) : "";

              return (
                <div
                  key={file.id}
                  onClick={() => !isSkipped && onSelectFile(file)}
                  className={cn(
                    "p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all",
                    isSkipped
                      ? isLight ? "bg-slate-50 border-slate-200 opacity-60" : "bg-[#111111] border-[#222222] opacity-50"
                      : isLight
                      ? "bg-white border-slate-200 hover:border-blue-500/50 hover:shadow-md cursor-pointer group"
                      : "bg-[#0E0E0E] border-[#222222] hover:border-brand-500/50 hover:bg-[#121212] cursor-pointer group"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className={cn(
                        "px-1 py-0.2 rounded text-[9px] font-mono font-bold border shrink-0 mt-0.5",
                        badge.color
                      )}>
                        {badge.label}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-brand-400 transition-colors" title={file.path}>
                          {file.filename || file.path.split("/").pop()}
                        </div>
                        {dirPath && (
                          <div className="text-[10px] font-mono text-muted-foreground truncate" title={dirPath}>
                            {dirPath}
                          </div>
                        )}
                      </div>
                    </div>

                    {hasIssues ? (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 font-mono",
                        file.severityCounts?.critical > 0
                          ? "bg-red-500/15 text-red-500"
                          : file.severityCounts?.high > 0
                          ? "bg-brand-500/15 text-brand-500"
                          : "bg-amber-500/15 text-amber-500"
                      )}>
                        {file.findingCount} {file.findingCount === 1 ? "issue" : "issues"}
                      </span>
                    ) : isSkipped ? (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono text-muted-foreground border shrink-0"
                        title={file.skipMessage || "Skipped from review"}
                      >
                        {file.skipReason === "CONFIG_FILE"
                          ? "Config"
                          : file.skipReason === "DECLARATION_FILE"
                          ? "Types"
                          : file.skipReason === "MINIFIED_FILE"
                          ? "Bundle"
                          : file.skipReason === "TEST_FILE"
                          ? "Test"
                          : "Skipped"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Clean
                      </span>
                    )}
                  </div>

                  <div className={cn("flex items-center justify-between text-[11px]", isLight ? "text-slate-500" : "text-obsidian-400")}>
                    <span className="font-mono text-[10px]">{file.language}</span>
                    <span>{file.lineCount ? `${file.lineCount} lines` : `${Math.round((file.size || 0) / 1024)} KB`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

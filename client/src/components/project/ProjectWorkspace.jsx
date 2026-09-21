import React, { useState, useEffect } from "react";
import {
  FileCode,
  Layers,
  ListTree,
  GitBranch,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FolderTree,
  Copy,
  Check,
  AlertTriangle
} from "lucide-react";
import { ProjectFileTree } from "./ProjectFileTree.jsx";
import { CodeEditor } from "../CodeEditor.jsx";
import { IssuePanel } from "../IssuePanel.jsx";
import { IssueDetails } from "../IssueDetails.jsx";
import { PatchPreview } from "../PatchPreview.jsx";
import { PatchDiffBanner } from "../PatchDiffBanner.jsx";
import { Button } from "../ui/Button.jsx";
import { SeverityBadge } from "../SeverityBadge.jsx";
import {
  getProjectFileApi,
  applyProjectPatchApi,
  generateProjectFindingRefactorApi,
} from "../../services/projectApi.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import { cn } from "@/lib/utils";

/**
 * Project Review Workspace (3-Panel Precision Cockpit)
 * Panel 1: Project File Tree Explorer
 * Panel 2: Line-Indexed Source Code Editor with Gutter Markers
 * Panel 3: Finding Inspector, Commentary, and Patch Engine
 */
export function ProjectWorkspace({
  project,
  review,
  onUpdateReview,
  onNavigateOverview,
  initialFileId = null,
  initialFindingId = null,
  showToast = null,
}) {
  const { isLight } = useTheme();

  // Active state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isPatchModalOpen, setIsPatchModalOpen] = useState(false);
  const [isPatching, setIsPatching] = useState(false);
  const [patchDiff, setPatchDiff] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hasCopiedPath, setHasCopiedPath] = useState(false);

  const handleCopyPath = async () => {
    if (!selectedFile?.path) return;
    try {
      await navigator.clipboard.writeText(selectedFile.path);
      setHasCopiedPath(true);
      setTimeout(() => setHasCopiedPath(false), 2000);
    } catch {}
  };

  // Initialize selected file
  useEffect(() => {
    const files = review?.files || [];
    if (files.length === 0) return;

    let target = null;
    if (initialFileId) {
      target = files.find((f) => f.id === initialFileId || f.path === initialFileId);
    }
    if (!target) {
      // Pick first file with issues, or first eligible file
      target = files.find((f) => (f.findingCount || 0) > 0) || files.find((f) => f.status === "SUCCESS") || files[0];
    }

    if (target) {
      handleSelectFile(target);
    }
  }, [review?.id, initialFileId]);

  // Load file content when file is selected
  async function handleSelectFile(file) {
    if (!file || file.status === "SKIPPED") return;

    setSelectedFile(file);
    setIsLoadingFile(true);
    setPatchDiff(null);

    try {
      const data = await getProjectFileApi(project.id, file.id);
      setFileContent(data.file?.content || "");

      // If initial finding provided for this file, select it
      const fileIssues = file.issues || [];
      if (initialFindingId && fileIssues.some((i) => i.id === initialFindingId)) {
        setSelectedIssueId(initialFindingId);
      } else if (fileIssues.length > 0) {
        setSelectedIssueId(fileIssues[0].id);
      } else {
        setSelectedIssueId(null);
      }
    } catch (err) {
      console.error("Failed to load file content:", err);
    } finally {
      setIsLoadingFile(false);
    }
  }

  const [isGeneratingRefactor, setIsGeneratingRefactor] = useState(false);
  const [refactorCandidate, setRefactorCandidate] = useState(null);

  const currentIssues = selectedFile?.issues || [];
  const selectedIssue = currentIssues.find((i) => i.id === selectedIssueId) || null;

  // Generate automated refactoring candidate for a finding
  async function handleGenerateRefactor(finding) {
    const targetFinding = finding || selectedIssue;
    if (!targetFinding || !selectedFile) return;

    setIsGeneratingRefactor(true);
    try {
      const outcome = await generateProjectFindingRefactorApi({
        projectId: project.id,
        fileId: selectedFile.id,
        findingId: targetFinding.id,
        issue: targetFinding,
      });

      if (outcome.success) {
        const candidate = {
          ...targetFinding,
          fix: {
            original: outcome.original,
            replacement: outcome.replacement,
          },
          explanation: outcome.explanation,
        };
        setRefactorCandidate(candidate);
        setIsPatchModalOpen(true);
      }
    } catch (err) {
      if (showToast) {
        showToast(err.message || "Failed to generate refactor.", "error");
      } else {
        alert(err.message || "Failed to generate refactor.");
      }
    } finally {
      setIsGeneratingRefactor(false);
    }
  }

  // Apply patch to active file in project
  async function handleApplyPatch(candidate = null) {
    const issueToApply = candidate?.fix ? candidate : refactorCandidate || selectedIssue;
    if (!selectedFile || !issueToApply || isPatching) return;

    setIsPatching(true);

    try {
      const outcome = await applyProjectPatchApi({
        projectId: project.id,
        fileId: selectedFile.id,
        findingId: issueToApply.id,
        reviewId: review.id,
        expectedHash: selectedFile.contentHash,
        patch: issueToApply.fix,
      });

      if (outcome.success) {
        setFileContent(outcome.patchedCode);
        setPatchDiff(outcome.diff);
        setIsPatchModalOpen(false);
        setRefactorCandidate(null);

        if (showToast) {
          showToast("Fix applied and re-analyzed your code.");
        }

        // Update overall project review snapshot in parent
        if (onUpdateReview) {
          onUpdateReview(outcome.review);
        }

        // Update local file selection
        const updatedFile = outcome.review.files.find((f) => f.id === selectedFile.id);
        if (updatedFile) {
          setSelectedFile(updatedFile);
          setSelectedIssueId(updatedFile.issues?.[0]?.id || null);
        }
      }
    } catch (err) {
      if (showToast) {
        showToast(err.message || "Failed to apply fix to file.", "error");
      } else {
        alert(err.message || "Failed to apply fix to file.");
      }
    } finally {
      setIsPatching(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Workspace Sub-Header / Breadcrumb */}
      <div className={cn(
        "h-10 px-4 border-b flex items-center justify-between shrink-0 text-xs select-none",
        isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-[#101010] border-[#222222] text-obsidian-300"
      )}>
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="xs"
            onClick={onNavigateOverview}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Overview
          </Button>

          <span className="text-muted-foreground">/</span>

          <span className="font-bold truncate max-w-[120px]">{project?.name || "Project"}</span>

          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

          <div className="flex items-center gap-1.5 font-mono min-w-0">
            <FileCode className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="font-semibold text-foreground truncate">{selectedFile?.path || "Select a file"}</span>
            {selectedFile?.path && (
              <button
                type="button"
                onClick={handleCopyPath}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#202020] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Copy relative path"
              >
                {hasCopiedPath ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>

          {selectedFile?.language && (
            <span className="hidden lg:inline px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-slate-200/60 dark:bg-[#1E1E1E] text-muted-foreground border border-slate-300/60 dark:border-[#2A2A2A]">
              {selectedFile.language}
            </span>
          )}

          {selectedFile?.hasCycle && (
            <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1 shrink-0">
              <AlertTriangle className="w-3 h-3" /> Cycle
            </span>
          )}

          {selectedFile?.findingCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-brand-500/15 text-brand-500 shrink-0">
              {selectedFile.findingCount} {selectedFile.findingCount === 1 ? "issue" : "issues"}
            </span>
          ) : selectedFile ? (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 shrink-0">
              <CheckCircle2 className="w-3 h-3" /> Clean
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "px-2 py-1 rounded transition-colors flex items-center gap-1 text-xs cursor-pointer",
              sidebarOpen
                ? isLight ? "bg-slate-200 text-slate-800" : "bg-[#1F1F1F] text-obsidian-100"
                : isLight ? "text-slate-500 hover:bg-slate-100" : "text-obsidian-400 hover:bg-[#161616]"
            )}
            title="Toggle File Explorer Sidebar"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Files</span>
          </button>
        </div>
      </div>

      {/* Review Diff Banner if patch applied */}
      {patchDiff && (
        <PatchDiffBanner
          diff={patchDiff}
          onDismiss={() => setPatchDiff(null)}
        />
      )}

      {/* Main 3-Panel Grid Workspace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
        {/* Panel 1: File Tree (collapsible) */}
        {sidebarOpen && (
          <div className={cn(
            "md:col-span-3 lg:col-span-2 border-r h-full overflow-hidden flex flex-col shrink-0",
            isLight ? "bg-slate-50/50 border-slate-200" : "bg-[#0C0C0C] border-[#222222]"
          )}>
            <ProjectFileTree
              files={review?.files || []}
              activeFileId={selectedFile?.id}
              onSelectFile={handleSelectFile}
            />
          </div>
        )}

        {/* Panel 2: Code Editor */}
        <div className={cn(
          sidebarOpen ? "md:col-span-5 lg:col-span-6" : "md:col-span-7 lg:col-span-8",
          "h-full overflow-hidden flex flex-col border-r",
          isLight ? "border-slate-200" : "border-[#222222]"
        )}>
          {isLoadingFile ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
              <span className="text-xs">Loading {selectedFile?.filename}...</span>
            </div>
          ) : selectedFile ? (
            <CodeEditor
              code={fileContent}
              onChange={() => {}}
              readOnly={true}
              language={selectedFile.language || "javascript"}
              filename={selectedFile.filename}
              issues={currentIssues}
              highlightedIssue={selectedIssue}
              onSelectIssue={(issueId) => {
                const id = typeof issueId === "string" ? issueId : issueId?.id;
                setSelectedIssueId(id);
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
              Select a file from the explorer to view source code.
            </div>
          )}
        </div>

        {/* Panel 3: Findings List & Issue Details */}
        <div className="md:col-span-4 h-full overflow-hidden flex flex-col min-h-0">
          {currentIssues.length > 0 ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Problem List Selector for Current File */}
              <div className={cn(
                "p-3 border-b flex flex-col gap-2 shrink-0",
                isLight ? "bg-slate-50 border-slate-200" : "bg-[#111111] border-[#222222]"
              )}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">File Findings ({currentIssues.length})</span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {selectedFile?.filename}
                  </span>
                </div>

                {/* Category filter tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0 cursor-pointer",
                      activeCategory === "all"
                        ? isLight ? "bg-slate-900 text-white font-bold" : "bg-white text-black font-bold"
                        : isLight ? "bg-slate-200/70 text-slate-600 hover:bg-slate-200" : "bg-[#1E1E1E] text-obsidian-300 hover:bg-[#252525]"
                    )}
                  >
                    All ({currentIssues.length})
                  </button>
                  {currentIssues.some(i => i.category === 'SECURITY') && (
                    <button
                      type="button"
                      onClick={() => setActiveCategory("SECURITY")}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0 cursor-pointer",
                        activeCategory === "SECURITY"
                          ? "bg-red-500 text-white font-bold"
                          : isLight ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-red-950/40 text-red-400 hover:bg-red-900/50"
                      )}
                    >
                      Security ({currentIssues.filter(i => i.category === 'SECURITY').length})
                    </button>
                  )}
                  {currentIssues.some(i => i.category === 'QUALITY') && (
                    <button
                      type="button"
                      onClick={() => setActiveCategory("QUALITY")}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0 cursor-pointer",
                        activeCategory === "QUALITY"
                          ? "bg-amber-500 text-white font-bold"
                          : isLight ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-amber-950/40 text-amber-400 hover:bg-amber-900/50"
                      )}
                    >
                      Quality ({currentIssues.filter(i => i.category === 'QUALITY').length})
                    </button>
                  )}
                  {currentIssues.some(i => i.category === 'COMPLEXITY') && (
                    <button
                      type="button"
                      onClick={() => setActiveCategory("COMPLEXITY")}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0 cursor-pointer",
                        activeCategory === "COMPLEXITY"
                          ? "bg-purple-500 text-white font-bold"
                          : isLight ? "bg-purple-50 text-purple-700 hover:bg-purple-100" : "bg-purple-950/40 text-purple-400 hover:bg-purple-900/50"
                      )}
                    >
                      Complexity ({currentIssues.filter(i => i.category === 'COMPLEXITY').length})
                    </button>
                  )}
                </div>

                {/* List of problems in this file */}
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
                  {currentIssues.filter(i => activeCategory === 'all' || i.category === activeCategory).map((iss) => {
                    const isSelected = iss.id === selectedIssueId;
                    return (
                      <button
                        key={iss.id}
                        type="button"
                        onClick={() => setSelectedIssueId(iss.id)}
                        className={cn(
                          "w-full text-left p-2 rounded-[5px] border text-xs flex items-start gap-2.5 transition-all cursor-pointer",
                          isSelected
                            ? isLight
                              ? "bg-blue-50/80 border-blue-300 text-blue-950 shadow-xs"
                              : "bg-brand-500/15 border-brand-500/40 text-brand-200 shadow-xs"
                            : isLight
                              ? "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                              : "bg-[#161616] border-[#242424] text-obsidian-300 hover:border-[#333333]"
                        )}
                      >
                        <div className="shrink-0 mt-0.5">
                          <SeverityBadge severity={iss.severity} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground mb-0.5">
                            <span className="font-semibold text-foreground">
                              Line {iss.line}{iss.endLine && iss.endLine !== iss.line ? `–${iss.endLine}` : ''}
                            </span>
                            <span>•</span>
                            <span className="text-blue-600 dark:text-brand-400 font-bold">{iss.rule}</span>
                          </div>
                          <div className="font-medium text-xs truncate leading-snug">
                            {iss.title}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Finding Details Card */}
              {selectedIssue ? (
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <IssueDetails
                    issue={selectedIssue}
                    code={fileContent}
                    filename={selectedFile?.filename || selectedFile?.path}
                    codeHash={selectedFile?.contentHash}
                    onApplyPatch={() => handleApplyPatch(selectedIssue)}
                    onApplyFix={() => handleApplyPatch(selectedIssue)}
                    onGenerateRefactor={handleGenerateRefactor}
                    isGeneratingRefactor={isGeneratingRefactor}
                    onPreviewAiPatch={() => {
                      setRefactorCandidate(null);
                      setIsPatchModalOpen(true);
                    }}
                    onPreviewPatch={() => {
                      setRefactorCandidate(null);
                      setIsPatchModalOpen(true);
                    }}
                    isApplyingPatch={isPatching}
                    isApplying={isPatching}
                  />
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Select a finding to inspect recommendations and unified diff fix.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <h4 className="font-bold text-sm">No issues detected</h4>
              <p className="text-muted-foreground max-w-xs">
                Static AST checks found zero security, quality, or performance defects in {selectedFile?.filename || "this file"}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Patch Preview Modal */}
      {isPatchModalOpen && (refactorCandidate || selectedIssue) && (
        <PatchPreview
          isOpen={isPatchModalOpen}
          onClose={() => {
            setIsPatchModalOpen(false);
            setRefactorCandidate(null);
          }}
          onConfirmApply={() => handleApplyPatch(refactorCandidate || selectedIssue)}
          onApply={() => handleApplyPatch(refactorCandidate || selectedIssue)}
          issue={refactorCandidate || selectedIssue}
          previewData={refactorCandidate?.fix}
          code={fileContent}
          codeHash={selectedFile?.contentHash}
          isApplying={isPatching}
        />
      )}
    </div>
  );
}

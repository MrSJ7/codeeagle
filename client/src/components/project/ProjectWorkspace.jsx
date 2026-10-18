import React, { useState, useEffect, useCallback } from "react";
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
  projectSnapshotForReview,
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
  isAiConfigured = false,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState("findings");
  const [hasCopiedPath, setHasCopiedPath] = useState(false);

  const handleCopyPath = async () => {
    if (!selectedFile?.path) return;
    try {
      await navigator.clipboard.writeText(selectedFile.path);
      setHasCopiedPath(true);
      setTimeout(() => setHasCopiedPath(false), 2000);
    } catch {}
  };

  // Load file content when file is selected
  const handleSelectFile = useCallback(async (file) => {
    if (!file || file.status === "SKIPPED") return;

    setSelectedFile(file);
    setIsLoadingFile(true);
    setPatchDiff(null);

    try {
      const localContent = file.content ?? project.files?.find((entry) => entry.id === file.id)?.content;
      const data = localContent === undefined ? await getProjectFileApi(project.id, file.id) : null;
      setFileContent(localContent ?? data?.file?.content ?? "");

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
  }, [project, initialFindingId]);

  // Keep the selected file aligned with the latest review snapshot.
  useEffect(() => {
    const files = review?.files || [];
    if (files.length === 0) return;
    const target = files.find((file) => file.id === initialFileId || file.path === initialFileId) ||
      files.find((file) => (file.findingCount || 0) > 0) ||
      files.find((file) => file.status === "SUCCESS") || files[0];
    if (target) handleSelectFile(target);
  }, [review, initialFileId, handleSelectFile]);

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
        code: fileContent,
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
        projectSnapshot: projectSnapshotForReview(project, review),
        reviewSnapshot: review,
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
    <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden bg-white dark:bg-[#10100f]">
      <div className="shrink-0 px-4 py-3 flex items-center gap-3 border-b border-slate-200 dark:border-[#33312b] bg-slate-50 dark:bg-[#191916]">
        <button type="button" onClick={onNavigateOverview} className="text-sm font-medium text-slate-600 dark:text-[#bcb5aa] hover:text-orange-600 dark:hover:text-orange-400 focus-visible:outline-2 focus-visible:outline-orange-500">← Project overview</button>
        <span className="text-slate-300 dark:text-[#514d45]">/</span>
        <button type="button" onClick={() => setSidebarOpen((open) => !open)} aria-expanded={sidebarOpen} className="min-w-0 flex-1 text-left text-sm font-semibold text-slate-950 dark:text-[#f7f1e7] truncate hover:text-orange-600 dark:hover:text-orange-400 focus-visible:outline-2 focus-visible:outline-orange-500">{selectedFile?.path || 'Choose a file'} ▾</button>
        <span className="hidden sm:inline text-xs text-slate-500 dark:text-[#aaa49a]">{currentIssues.length} findings · {review?.filesAnalyzed || 0} files reviewed</span>
      </div>
      {patchDiff && <PatchDiffBanner diff={patchDiff} onDismiss={() => setPatchDiff(null)} />}
      {sidebarOpen && <div className="absolute z-30 top-[52px] left-0 bottom-0 w-[min(20rem,85vw)] bg-white dark:bg-[#141411] border-r border-slate-200 dark:border-[#33312b] shadow-2xl flex flex-col">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-[#33312b]"><span className="text-sm font-semibold">Project files</span><button type="button" onClick={() => setSidebarOpen(false)} className="text-sm text-orange-600 dark:text-orange-400">Close</button></div>
        <ProjectFileTree files={review?.files || []} activeFileId={selectedFile?.id} onSelectFile={(file) => { handleSelectFile(file); setSidebarOpen(false); setMobilePane('findings'); }} />
      </div>}
      <nav aria-label="Project review panels" className="lg:hidden shrink-0 flex p-1 gap-1 bg-[#171714]">
        {['findings', 'code', 'details'].map((pane) => <button key={pane} type="button" onClick={() => setMobilePane(pane)} aria-pressed={mobilePane === pane} className={`flex-1 min-h-10 rounded-md capitalize text-sm font-semibold ${mobilePane === pane ? 'bg-orange-500 text-[#1c150d]' : 'text-[#b8b1a5]'}`}>{pane}</button>)}
      </nav>
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <IssuePanel issues={currentIssues} selectedIssueId={selectedIssueId} onSelectIssue={(id) => { setSelectedIssueId(id); setMobilePane('details'); }} reviewStatus="SUCCESS" filename={selectedFile?.path || 'source.js'} className={`w-full lg:w-80 xl:w-[350px] shrink-0 border-r border-slate-200 dark:border-[#33312b] ${mobilePane === 'findings' ? '' : 'hidden lg:flex'}`} />
        <section className={`flex-1 min-w-0 min-h-0 ${mobilePane === 'code' ? '' : 'hidden lg:flex'}`}>
          {isLoadingFile ? <div className="flex-1 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-[#aaa49a]"><Loader2 className="animate-spin" size={18}/>Loading source…</div> : selectedFile ? <CodeEditor code={fileContent} onChange={() => {}} readOnly={true} language={selectedFile.language || 'javascript'} filename={selectedFile.path} issues={currentIssues} highlightedIssue={selectedIssue} onSelectIssue={(id) => { setSelectedIssueId(typeof id === 'string' ? id : id?.id); setMobilePane('details'); }} /> : <div className="flex-1 flex items-center justify-center text-sm text-slate-500">Choose a file to review.</div>}
        </section>
        <IssueDetails issue={selectedIssue} code={fileContent} filename={selectedFile?.path || 'source.js'} onGenerateRefactor={handleGenerateRefactor} isAiConfigured={isAiConfigured} isGeneratingRefactor={isGeneratingRefactor} onPreviewAiPatch={() => { setRefactorCandidate(null); setIsPatchModalOpen(true); }} isApplyingPatch={isPatching} className={`w-full lg:w-80 xl:w-[380px] shrink-0 border-l border-slate-200 dark:border-[#33312b] ${mobilePane === 'details' ? '' : 'hidden lg:flex'}`} />
      </div>
      {isPatchModalOpen && (refactorCandidate || selectedIssue) && <PatchPreview isOpen={isPatchModalOpen} onClose={() => { setIsPatchModalOpen(false); setRefactorCandidate(null); }} onConfirmApply={() => handleApplyPatch(refactorCandidate || selectedIssue)} issue={refactorCandidate || selectedIssue} previewData={refactorCandidate?.fix} isApplying={isPatching} />}
    </div>
  );
}

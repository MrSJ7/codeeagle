import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { ReviewSummary } from './components/ReviewSummary.jsx';
import { CodeEditor } from './components/CodeEditor.jsx';
import { IssuePanel } from './components/IssuePanel.jsx';
import { IssueDetails } from './components/IssueDetails.jsx';
import { PatchDiffBanner } from './components/PatchDiffBanner.jsx';
import { ReviewHistoryDrawer } from './components/ReviewHistoryDrawer.jsx';
import { PatchPreview } from './components/PatchPreview.jsx';
import { PRESETS } from './data/mockReviews.js';
import {
  runReview,
  applyPatchApi,
  getHealthApi,
  getReviewByIdApi,
  verifyAiPatchApi,
  applyAiPatchApi,
  buildApiUrl,
} from './services/reviewApi.js';
import { AlertTriangle, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { LandingPage } from './components/LandingPage.jsx';
import { ReviewOverview } from './components/ReviewOverview.jsx';
import { ArchitectureFlow } from './components/ArchitectureFlow.jsx';
import { HowItWorksModal } from './components/HowItWorksModal.jsx';
import { ProjectImportModal } from './components/project/ProjectImportModal.jsx';
import { ProjectOverview } from './components/project/ProjectOverview.jsx';
import { ProjectWorkspace } from './components/project/ProjectWorkspace.jsx';
import { startProjectReviewApi } from './services/projectApi.js';

export default function App() {
  const getInitialRoute = () => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/review')) {
      return 'review';
    }
    return 'landing';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Review Scope: 'single' (file mode) | 'project' (full project codebase mode)
  const [reviewScope, setReviewScope] = useState('single');
  const [isProjectImportOpen, setIsProjectImportOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [activeProjectReview, setActiveProjectReview] = useState(null);
  const [projectNavView, setProjectNavView] = useState('overview'); // 'overview' | 'workspace'
  const [initialWorkspaceFileId, setInitialWorkspaceFileId] = useState(null);
  const [initialWorkspaceFindingId, setInitialWorkspaceFindingId] = useState(null);
  const [isProjectAnalyzing, setIsProjectAnalyzing] = useState(false);

  const [selectedPresetId, setSelectedPresetId] = useState(PRESETS[0].id);
  const [code, setCode] = useState(PRESETS[0].code);

  // Review Lifecycle: 'IDLE' | 'ANALYZING' | 'SUCCESS' | 'STALE' | 'ERROR'
  const [reviewStatus, setReviewStatus] = useState('IDLE');
  const [reviewData, setReviewData] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
  const [activeLens, setActiveLens] = useState('overview'); // 'overview' | 'findings' | 'architecture'
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState(null);
  const [patchDiff, setPatchDiff] = useState(null);
  const [isApplyingPatch, setIsApplyingPatch] = useState(false);

  // AI Patch Preview & Application State
  const [previewAiIssue, setPreviewAiIssue] = useState(null);
  const [aiPreviewData, setAiPreviewData] = useState(null);
  const [isVerifyingAiPatch, setIsVerifyingAiPatch] = useState(false);
  const [isApplyingAiPatch, setIsApplyingAiPatch] = useState(false);

  // Review History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoricalView, setIsHistoricalView] = useState(false);
  const [historicalCreatedAt, setHistoricalCreatedAt] = useState(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [persistenceMode, setPersistenceMode] = useState('memory');
  const [isAiConfigured, setIsAiConfigured] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Active filename based on selected sample
  const currentPreset = PRESETS.find((p) => p.id === selectedPresetId);
  const currentFilename =
    currentPreset?.id === 'insecure-login'
      ? 'auth.js'
      : currentPreset?.id === 'buggy-react'
      ? 'ActivityFeed.jsx'
      : currentPreset?.id === 'complex-function'
      ? 'shippingFee.js'
      : 'source.js';

  // Detect server persistence and AI configuration on mount
  useEffect(() => {
    let isMounted = true;
    getHealthApi()
      .then((health) => {
        if (isMounted) {
          if (health?.persistence) setPersistenceMode(health.persistence);
          if (health?.ai === 'configured') setIsAiConfigured(true);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = typeof window !== 'undefined' ? window.location.pathname : '/';
      if (path.startsWith('/review')) {
        setCurrentRoute('review');
      } else {
        setCurrentRoute('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Run Review execution
  const executeReview = useCallback(async (sourceCode, filenameToUse) => {
    if (!sourceCode.trim()) {
      showToast('Source code cannot be empty.', 'error');
      return;
    }

    setReviewStatus('ANALYZING');
    setErrorMessage(null);
    setPatchDiff(null);
    setPreviewAiIssue(null);
    setAiPreviewData(null);

    try {
      const result = await runReview(sourceCode, 'javascript', filenameToUse);
      setReviewData(result);
      setReviewStatus('SUCCESS');
      setActiveLens('findings');
      setSelectedIssueId(result.issues[0]?.id || null);
      setCurrentReviewId(result.reviewId || null);
      setIsHistoricalView(false);
      setHistoricalCreatedAt(null);
      setHistoryRefreshTrigger((prev) => prev + 1);

      if (result.issues.length === 0) {
        showToast('Review complete. No issues found in code!');
      } else {
        showToast(`Review complete. ${result.issues.length} ${result.issues.length === 1 ? 'issue' : 'issues'} found.`);
      }
    } catch (err) {
      console.error('Review execution error:', err);
      setReviewStatus('ERROR');
      setErrorMessage(err.message || 'Could not analyze this code right now.');
      showToast('Review failed.', 'error');
    }
  }, []);

  const handleRunReview = () => {
    executeReview(code, currentFilename);
  };

  const navigateTo = (route, presetIdToLoad = null, autoRun = false) => {
    let newCodeToRun = null;
    let newFilename = currentFilename;

    if (presetIdToLoad) {
      const preset = PRESETS.find((p) => p.id === presetIdToLoad);
      if (preset) {
        setSelectedPresetId(preset.id);
        setCode(preset.code);
        newCodeToRun = preset.code;
        newFilename =
          preset.id === 'insecure-login'
            ? 'auth.js'
            : preset.id === 'buggy-react'
            ? 'ActivityFeed.jsx'
            : preset.id === 'complex-function'
            ? 'shippingFee.js'
            : 'source.js';
        setReviewStatus('IDLE');
        setReviewData(null);
        setSelectedIssueId(null);
        setCurrentReviewId(null);
        setIsHistoricalView(false);
        setHistoricalCreatedAt(null);
        setErrorMessage(null);
        setPatchDiff(null);
        setPreviewAiIssue(null);
        setAiPreviewData(null);
      }
    }

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentRoute(route);
      const targetPath = route === 'review' ? '/review' : '/';
      if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
      window.scrollTo(0, 0);
      setIsTransitioning(false);

      if (autoRun && newCodeToRun) {
        executeReview(newCodeToRun, newFilename);
      }
    }, 200);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape closes modals/drawers first
      if (e.key === 'Escape') {
        if (isHowItWorksOpen) {
          e.preventDefault();
          setIsHowItWorksOpen(false);
          return;
        }
        if (previewAiIssue) {
          e.preventDefault();
          setPreviewAiIssue(null);
          setAiPreviewData(null);
          return;
        }
        if (isHistoryOpen) {
          e.preventDefault();
          setIsHistoryOpen(false);
          return;
        }
      }

      // ⌘+Enter to Run Review
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (currentRoute === 'review' && reviewStatus !== 'ANALYZING') {
          e.preventDefault();
          handleRunReview();
          return;
        }
      }

      // Ignore single key shortcuts if user is typing in an input, textarea, or contentEditable
      const targetTag = e.target?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || e.target?.isContentEditable) {
        return;
      }

      if (currentRoute === 'review') {
        // Lens navigation: 1 (Overview), 2 (Findings), 3 (Architecture)
        if (e.key === '1' && reviewStatus !== 'IDLE') {
          e.preventDefault();
          setActiveLens('overview');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveLens('findings');
        } else if (e.key === '3' && reviewStatus !== 'IDLE') {
          e.preventDefault();
          setActiveLens('architecture');
        }

        // Issue navigation: J (next), K (prev)
        if (activeLens === 'findings' && reviewData?.issues?.length > 0) {
          const issues = reviewData.issues;
          const currentIndex = issues.findIndex((i) => i.id === selectedIssueId);
          if (e.key === 'j' || e.key === 'J') {
            e.preventDefault();
            const nextIndex = currentIndex < issues.length - 1 ? currentIndex + 1 : 0;
            setSelectedIssueId(issues[nextIndex].id);
          } else if (e.key === 'k' || e.key === 'K') {
            e.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : issues.length - 1;
            setSelectedIssueId(issues[prevIndex].id);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentRoute,
    reviewStatus,
    code,
    currentFilename,
    activeLens,
    reviewData,
    selectedIssueId,
    isHistoryOpen,
    previewAiIssue,
  ]);

  // 1. Preset change from dropdown
  const handleSelectPreset = (presetId) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    setCode(preset.code);
    setReviewStatus('IDLE');
    setReviewData(null);
    setSelectedIssueId(null);
    setCurrentReviewId(null);
    setIsHistoricalView(false);
    setHistoricalCreatedAt(null);
    setErrorMessage(null);
    setPatchDiff(null);
    setPreviewAiIssue(null);
    setAiPreviewData(null);
    showToast(`Loaded ${preset.name}. Click Run Review to analyze.`);
  };

  // 2. Manual code edit invalidates existing review
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (patchDiff) setPatchDiff(null);
    if (previewAiIssue) {
      setPreviewAiIssue(null);
      setAiPreviewData(null);
    }
    if (isHistoricalView) {
      setIsHistoricalView(false);
      setHistoricalCreatedAt(null);
    }
    if (reviewStatus === 'SUCCESS') {
      setReviewStatus('STALE');
    }
  };

  // 3. Historical review restoration flow
  const handleSelectHistoricalAudit = async (reviewId) => {
    try {
      const data = await getReviewByIdApi(reviewId);
      if (!data) return;

      setCode(data.code || '');
      setReviewData(data);
      setReviewStatus('SUCCESS');
      setActiveLens('overview');
      setSelectedIssueId(data.issues?.[0]?.id || null);
      setCurrentReviewId(data.reviewId);
      setIsHistoricalView(true);
      setHistoricalCreatedAt(data.createdAt);
      setErrorMessage(null);
      setPatchDiff(null);
      setPreviewAiIssue(null);
      setAiPreviewData(null);
      setIsHistoryOpen(false);
      showToast(`Restored historical audit from ${new Date(data.createdAt).toLocaleTimeString()}.`);
    } catch (err) {
      console.error('Failed to load historical audit:', err);
      showToast('Could not restore audit.', 'error');
    }
  };

  // 4. One-Click Patch Application for Static Issues
  const handleApplyPatch = async (issue) => {
    if (!issue || !issue.fix) return;

    setIsApplyingPatch(true);
    try {
      const response = await applyPatchApi({
        code,
        codeHash: reviewData?.metadata?.codeHash,
        issue,
        language: 'JavaScript',
        filename: currentFilename,
        beforeReview: reviewData,
      });

      if (response && response.patchedCode) {
        setCode(response.patchedCode);

        const updatedReview = response.review || response.afterReview;
        if (updatedReview) {
          setReviewData(updatedReview);
          setReviewStatus('SUCCESS');
          setSelectedIssueId(updatedReview.issues?.[0]?.id || null);
          setCurrentReviewId(updatedReview.reviewId || null);
          setIsHistoricalView(false);
          setHistoricalCreatedAt(null);
          setHistoryRefreshTrigger((prev) => prev + 1);
        }

        if (response.diff) {
          setPatchDiff(response.diff);
        }

        showToast('Fix applied and re-analyzed your code.');
      }
    } catch (err) {
      console.error('Patch error:', err);
      showToast(err.message || 'Patch application failed.', 'error');
    } finally {
      setIsApplyingPatch(false);
    }
  };

  const [isGeneratingRefactor, setIsGeneratingRefactor] = useState(false);

  // Generate automated refactor for issues without static 1-line fixes
  const handleGenerateRefactor = async (issue) => {
    if (!issue) return;
    setIsGeneratingRefactor(true);
    try {
      const response = await fetch(buildApiUrl('/api/review/refactor'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, issue, filename: currentFilename }),
      });
      const data = await response.json();
      if (data.success) {
        const previewIssue = {
          ...issue,
          fix: {
            original: data.original,
            replacement: data.replacement,
          },
          explanation: data.explanation,
        };
        setPreviewAiIssue(previewIssue);
        setAiPreviewData({
          applicable: true,
          original: data.original,
          replacement: data.replacement,
          startLine: issue.line,
          endLine: issue.endLine || issue.line,
        });
      } else {
        showToast(data.error?.message || 'Failed to generate refactor candidate.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error generating refactor.', 'error');
    } finally {
      setIsGeneratingRefactor(false);
    }
  };

  // 5. AI Patch Verification & Preview flow
  const handlePreviewAiPatch = async (issue) => {
    if (!issue) return;

    if (issue.source !== 'AI') {
      // Direct preview for static issues
      setPreviewAiIssue(issue);
      setAiPreviewData({
        applicable: true,
        original: issue.fix?.original,
        replacement: issue.fix?.replacement,
        startLine: issue.line,
        endLine: issue.endLine || issue.line,
      });
      return;
    }

    setIsVerifyingAiPatch(true);
    try {
      const verified = await verifyAiPatchApi({
        code,
        codeHash: reviewData?.metadata?.codeHash,
        issue,
      });
      if (verified && verified.applicable) {
        setPreviewAiIssue(issue);
        setAiPreviewData(verified);
      } else {
        showToast(`Fix cannot be safely applied: ${verified?.reason || 'Verification check failed'}.`, 'error');
      }
    } catch (err) {
      console.error('AI Patch verification error:', err);
      showToast('Could not verify AI patch safety against current source.', 'error');
    } finally {
      setIsVerifyingAiPatch(false);
    }
  };

  // 6. Confirmed AI / Refactor Patch Application
  const handleApplyAiPatch = async () => {
    if (!previewAiIssue) return;

    setIsApplyingAiPatch(true);
    try {
      const apiFn = previewAiIssue.source === 'AI' ? applyAiPatchApi : applyPatchApi;
      const response = await apiFn({
        code,
        codeHash: reviewData?.metadata?.codeHash,
        issue: previewAiIssue,
        language: 'JavaScript',
        filename: currentFilename,
        beforeReview: reviewData,
      });

      if (response && response.patchedCode) {
        setCode(response.patchedCode);

        const updatedReview = response.review || response.afterReview;
        if (updatedReview) {
          setReviewData(updatedReview);
          setReviewStatus('SUCCESS');
          setSelectedIssueId(updatedReview.issues?.[0]?.id || null);
          setCurrentReviewId(updatedReview.reviewId || null);
          setIsHistoricalView(false);
          setHistoricalCreatedAt(null);
          setHistoryRefreshTrigger((prev) => prev + 1);
        }

        if (response.diff) {
          setPatchDiff(response.diff);
        }

        setPreviewAiIssue(null);
        setAiPreviewData(null);
        showToast('Fix applied and re-analyzed your code.');
      }
    } catch (err) {
      console.error('Apply patch error:', err);
      showToast(err.message || 'Failed to apply patch.', 'error');
    } finally {
      setIsApplyingAiPatch(false);
    }
  };

  // Handle project imported & ready
  const handleProjectReady = ({ project, review }) => {
    setActiveProject(project);
    setActiveProjectReview(review);
    setReviewScope('project');
    setProjectNavView('overview');
    setInitialWorkspaceFileId(null);
    setInitialWorkspaceFindingId(null);
    navigateTo('review');
    showToast(`Imported project "${project.name}" with ${review.filesAnalyzed} analyzed files.`);
  };

  // Re-run project analysis
  const handleReAnalyzeProject = async () => {
    if (!activeProject) return;
    setIsProjectAnalyzing(true);
    try {
      const outcome = await startProjectReviewApi(activeProject.id);
      setActiveProjectReview(outcome.review);
      showToast('Project re-analyzed successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to re-analyze project.', 'error');
    } finally {
      setIsProjectAnalyzing(false);
    }
  };

  const currentSelectedIssue = reviewData?.issues?.find((i) => i.id === selectedIssueId) || null;
  const isStale = reviewStatus === 'STALE';
  const isReviewing = reviewStatus === 'ANALYZING';

  return (
    <div
      className={`min-h-screen ${
        currentRoute === 'review' ? 'h-screen flex flex-col overflow-hidden' : 'flex flex-col'
      } bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-[#F5F3EF] font-sans transition-opacity duration-200 ${
        isTransitioning ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {currentRoute === 'landing' ? (
        <LandingPage
          onStartReviewing={() => {
            setReviewScope('single');
            navigateTo('review', 'insecure-login', true);
          }}
          onOpenProjectImport={() => setIsProjectImportOpen(true)}
          onSelectScenarioAndStart={(presetId) => {
            setReviewScope('single');
            navigateTo('review', presetId, true);
          }}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          historyCount={historyRefreshTrigger}
        />
      ) : reviewScope === 'project' && activeProjectReview ? (
        /* PROJECT REVIEW MODE */
        <>
          <Navbar
            variant="app"
            mode="workspace"
            score={activeProjectReview.score}
            onRunReview={handleReAnalyzeProject}
            onRunAudit={handleReAnalyzeProject}
            isReviewing={isProjectAnalyzing}
            isAuditing={isProjectAnalyzing}
            onOpenProjectImport={() => setIsProjectImportOpen(true)}
            onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
            isHistoryOpen={isHistoryOpen}
            historyCount={historyRefreshTrigger}
            onNavigateHome={() => navigateTo('landing')}
            onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
            filename={activeProject?.name || 'Project'}
            language="Project Scope"
            lineCount={activeProjectReview.filesAnalyzed}
            issueCount={activeProjectReview.findings?.length || 0}
            reviewStatus={isProjectAnalyzing ? 'ANALYZING' : 'SUCCESS'}
            activeLens={projectNavView === 'overview' ? 'overview' : 'findings'}
            onSelectLens={(lens) => setProjectNavView(lens === 'overview' ? 'overview' : 'workspace')}
          />

          {projectNavView === 'overview' ? (
            <main className="flex-1 min-h-0 overflow-y-auto bg-slate-50 dark:bg-[#080808]">
              <ProjectOverview
                project={activeProject}
                review={activeProjectReview}
                onOpenWorkspace={() => setProjectNavView('workspace')}
                onSelectFile={(file) => {
                  setInitialWorkspaceFileId(file.id);
                  setProjectNavView('workspace');
                }}
                onSelectFinding={(finding) => {
                  setInitialWorkspaceFileId(finding.fileId);
                  setInitialWorkspaceFindingId(finding.id);
                  setProjectNavView('workspace');
                }}
                onReAnalyze={handleReAnalyzeProject}
                isAnalyzing={isProjectAnalyzing}
              />
            </main>
          ) : (
            <ProjectWorkspace
              project={activeProject}
              review={activeProjectReview}
              onUpdateReview={(newReview) => {
                setActiveProjectReview(newReview);
                setHistoryRefreshTrigger((prev) => prev + 1);
              }}
              onNavigateOverview={() => setProjectNavView('overview')}
              initialFileId={initialWorkspaceFileId}
              initialFindingId={initialWorkspaceFindingId}
              showToast={showToast}
            />
          )}
        </>
      ) : (
        /* SINGLE FILE REVIEW MODE (100% PRESERVED) */
        <>
          {/* Primary Workspace Header */}
          <Navbar
            variant="app"
            mode="workspace"
            score={reviewData?.score}
            presets={PRESETS}
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectPreset}
            onRunReview={handleRunReview}
            onRunAudit={handleRunReview}
            isReviewing={isReviewing}
            isAuditing={isReviewing}
            isStale={isStale}
            onOpenProjectImport={() => setIsProjectImportOpen(true)}
            onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
            isHistoryOpen={isHistoryOpen}
            historyCount={historyRefreshTrigger}
            persistenceMode={persistenceMode}
            isAiConfigured={isAiConfigured}
            onNavigateHome={() => navigateTo('landing')}
            onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
            filename={currentFilename}
            language="JavaScript"
            lineCount={code.split('\n').length}
            issueCount={reviewData?.issues?.length || 0}
            reviewStatus={reviewStatus}
            activeLens={activeLens}
            onSelectLens={setActiveLens}
          />

          {/* Review Summary Bar - visible in findings mode or when diff is present */}
          {(activeLens === 'findings' || reviewStatus !== 'SUCCESS' || patchDiff) && (
            <ReviewSummary
              reviewData={reviewData}
              reviewStatus={reviewStatus}
              isStale={isStale}
              isHistorical={isHistoricalView}
              historicalCreatedAt={historicalCreatedAt}
              filename={currentFilename}
              language="JavaScript"
              lineCount={code.split('\n').length}
              activeCategory={activeCategoryFilter}
              onSelectCategory={(cat) =>
                setActiveCategoryFilter((prev) => (prev === cat ? null : cat))
              }
              onRunReview={handleRunReview}
              patchDiff={patchDiff}
              onDismissDiff={() => setPatchDiff(null)}
            />
          )}

          {/* Review in Progress Banner */}
          {isReviewing && (
            <div className="px-6 py-2 bg-blue-50 dark:bg-brand-500/10 border-b border-blue-200 dark:border-brand-500/30 flex items-center justify-between text-xs font-mono text-blue-700 dark:text-brand-300 select-none shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-brand-500" />
                <span>Analyzing your code...</span>
              </div>
              <span className="text-blue-700 dark:text-brand-400 text-[11px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-brand-500/20 px-2 py-0.5 rounded-[4px] border border-blue-300 dark:border-brand-500/40">Analyzing</span>
            </div>
          )}

          {/* Error Notice Banner */}
          {reviewStatus === 'ERROR' && (
            <div className="px-6 py-2.5 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800/60 flex items-center justify-between text-xs text-red-700 dark:text-red-300 select-none shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>Review failed: {errorMessage || 'Could not analyze this code right now.'}</span>
              </div>
              <button
                onClick={handleRunReview}
                className="flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-white dark:bg-obsidian-850 hover:bg-slate-100 dark:hover:bg-obsidian-800 text-slate-800 dark:text-obsidian-200 border border-slate-300 dark:border-obsidian-750 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* Main Content Area based on Active Lens */}
          {reviewStatus === 'SUCCESS' && activeLens === 'overview' ? (
            <main className="flex-1 min-h-0 overflow-hidden bg-slate-50 dark:bg-obsidian-950">
              <ReviewOverview
                reviewData={reviewData}
                filename={currentFilename}
                language="JavaScript"
                lineCount={code.split('\n').length}
                onNavigateFindings={() => setActiveLens('findings')}
                onSelectIssue={(issueId) => {
                  setSelectedIssueId(issueId);
                  setActiveLens('findings');
                }}
              />
            </main>
          ) : reviewStatus === 'SUCCESS' && activeLens === 'architecture' ? (
            <main className="flex-1 min-h-0 overflow-hidden bg-slate-50 dark:bg-obsidian-950">
              <ArchitectureFlow
                code={code}
                issues={reviewData?.issues || []}
                filename={currentFilename}
                onSelectIssue={(issueId) => {
                  setSelectedIssueId(issueId);
                  setActiveLens('findings');
                }}
                onNavigateFindings={() => setActiveLens('findings')}
              />
            </main>
          ) : (
            /* Findings Lens / Code Workspace (Three-Column Layout) */
            <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-obsidian-950">
              {/* Left Column: Review findings / Findings Queue */}
              <IssuePanel
                issues={reviewData?.issues || []}
                selectedIssueId={selectedIssueId}
                onSelectIssue={setSelectedIssueId}
                reviewStatus={reviewStatus}
                onRunReview={handleRunReview}
                isStale={isStale}
                filename={currentFilename}
                externalCategoryFilter={activeCategoryFilter}
                onClearCategoryFilter={() => setActiveCategoryFilter(null)}
                className="w-full lg:w-72 xl:w-80 shrink-0 h-48 lg:h-full border-b lg:border-b-0 border-r border-slate-200 dark:border-obsidian-800"
              />

              {/* Center Column: Code Editor */}
              <section className="flex-1 h-full flex flex-col overflow-hidden min-w-0">
                <CodeEditor
                  code={code}
                  onChange={handleCodeChange}
                  issues={reviewData?.issues || []}
                  highlightedIssue={currentSelectedIssue}
                  filename={currentFilename}
                  language="JavaScript"
                  reviewStatus={reviewStatus}
                  isStale={isStale}
                  presets={PRESETS}
                  selectedPresetId={selectedPresetId}
                  onSelectPreset={handleSelectPreset}
                  onSelectIssue={setSelectedIssueId}
                />
              </section>

              {/* Right Column: Selected Finding Details / Remediation */}
              <IssueDetails
                issue={currentSelectedIssue}
                onApplyPatch={handleApplyPatch}
                onApplyFix={handleApplyPatch}
                onPreviewAiPatch={handlePreviewAiPatch}
                onPreviewPatch={handlePreviewAiPatch}
                onGenerateRefactor={handleGenerateRefactor}
                isGeneratingRefactor={isGeneratingRefactor}
                reviewStatus={reviewStatus}
                isStale={isStale}
                isApplyingPatch={isApplyingPatch || isApplyingAiPatch}
                isVerifyingAiPatch={isVerifyingAiPatch}
                filename={currentFilename}
                className="w-full lg:w-80 xl:w-96 shrink-0 h-64 lg:h-full border-t lg:border-t-0 border-l border-slate-200 dark:border-obsidian-800"
              />
            </main>
          )}
        </>
      )}

      {/* Project Import Modal */}
      <ProjectImportModal
        isOpen={isProjectImportOpen}
        onClose={() => setIsProjectImportOpen(false)}
        onProjectReady={handleProjectReady}
      />

      {/* AI Patch Preview Modal */}
      <PatchPreview
        isOpen={Boolean(previewAiIssue)}
        onClose={() => {
          setPreviewAiIssue(null);
          setAiPreviewData(null);
        }}
        issue={previewAiIssue}
        previewData={aiPreviewData}
        onConfirmApply={handleApplyAiPatch}
        isApplying={isApplyingAiPatch}
      />

      {/* Review History Slide-out Drawer */}
      <ReviewHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectAudit={handleSelectHistoricalAudit}
        currentReviewId={currentReviewId}
        hasUnsavedChanges={reviewStatus === 'STALE'}
        persistenceMode={persistenceMode}
        refreshTrigger={historyRefreshTrigger}
      />

      {/* How It Works Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onStartReview={() => {
          setIsHowItWorksOpen(false);
          navigateTo('review', 'insecure-login', true);
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 left-5 z-60 select-none">
          <div
            role="status"
            aria-live="polite"
            className={`px-4 py-2.5 rounded-[6px] border shadow-2xl flex items-center gap-2.5 text-xs font-sans ${
              toast.type === 'error'
                ? 'bg-red-50 dark:bg-obsidian-900 border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300'
                : 'bg-emerald-50 dark:bg-obsidian-900 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

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
} from './services/reviewApi.js';
import { AlertTriangle, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { LandingPage } from './components/LandingPage.jsx';
import { ReviewOverview } from './components/ReviewOverview.jsx';
import { ArchitectureFlow } from './components/ArchitectureFlow.jsx';

export default function App() {
  const getInitialRoute = () => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/review')) {
      return 'review';
    }
    return 'landing';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
      setActiveLens('overview');
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
      const response = await applyPatchApi(code, issue.id);

      if (response && response.patchedCode) {
        setCode(response.patchedCode);

        if (response.afterReview) {
          setReviewData(response.afterReview);
          setReviewStatus('SUCCESS');
          setSelectedIssueId(response.afterReview.issues?.[0]?.id || null);
          setCurrentReviewId(response.afterReview.reviewId || null);
          setIsHistoricalView(false);
          setHistoricalCreatedAt(null);
          setHistoryRefreshTrigger((prev) => prev + 1);
        }

        if (response.diff) {
          setPatchDiff(response.diff);
        }

        showToast('Fix applied & verified with automated re-analysis.');
      }
    } catch (err) {
      console.error('Patch error:', err);
      showToast(err.message || 'Patch application failed.', 'error');
    } finally {
      setIsApplyingPatch(false);
    }
  };

  // 5. AI Patch Verification & Preview flow
  const handlePreviewAiPatch = async (issue) => {
    if (!issue || issue.source !== 'AI') return;

    setIsVerifyingAiPatch(true);
    try {
      const verified = await verifyAiPatchApi(code, issue.id);
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

  // 6. Confirmed AI Patch Application
  const handleApplyAiPatch = async () => {
    if (!previewAiIssue) return;

    setIsApplyingAiPatch(true);
    try {
      const response = await applyAiPatchApi(code, previewAiIssue.id);

      if (response && response.patchedCode) {
        setCode(response.patchedCode);

        if (response.afterReview) {
          setReviewData(response.afterReview);
          setReviewStatus('SUCCESS');
          setSelectedIssueId(response.afterReview.issues?.[0]?.id || null);
          setCurrentReviewId(response.afterReview.reviewId || null);
          setIsHistoricalView(false);
          setHistoricalCreatedAt(null);
          setHistoryRefreshTrigger((prev) => prev + 1);
        }

        if (response.diff) {
          setPatchDiff(response.diff);
        }

        setPreviewAiIssue(null);
        setAiPreviewData(null);
        showToast('AI Patch applied & verified with automated re-analysis.');
      }
    } catch (err) {
      console.error('Apply AI patch error:', err);
      showToast(err.message || 'Failed to apply AI patch.', 'error');
    } finally {
      setIsApplyingAiPatch(false);
    }
  };

  const currentSelectedIssue = reviewData?.issues?.find((i) => i.id === selectedIssueId) || null;
  const isStale = reviewStatus === 'STALE';
  const isReviewing = reviewStatus === 'ANALYZING';

  return (
    <div
      className={`min-h-screen ${
        currentRoute === 'review' ? 'h-screen flex flex-col overflow-hidden' : 'flex flex-col'
      } bg-graphite-950 text-graphite-100 font-sans transition-opacity duration-200 ${
        isTransitioning ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {currentRoute === 'landing' ? (
        <LandingPage
          onStartReviewing={() => navigateTo('review', 'insecure-login', false)}
          onSelectScenarioAndStart={(presetId) => navigateTo('review', presetId, false)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={historyRefreshTrigger}
        />
      ) : (
        <>
          {/* Primary Workspace Header */}
          <Navbar
            mode="workspace"
            presets={PRESETS}
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectPreset}
            onRunReview={handleRunReview}
            onRunAudit={handleRunReview}
            isReviewing={isReviewing}
            isAuditing={isReviewing}
            isStale={isStale}
            onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
            isHistoryOpen={isHistoryOpen}
            persistenceMode={persistenceMode}
            isAiConfigured={isAiConfigured}
            onNavigateHome={() => navigateTo('landing')}
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
            <div className="px-6 py-2 bg-brand-950/80 border-b border-brand-800/80 flex items-center justify-between text-xs font-mono text-brand-300 select-none shrink-0 shadow-dev-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                <span>Reviewing code... AST static analysis: Complete · Gemini semantic reasoning: Running...</span>
              </div>
              <span className="text-brand-400 text-[11px] font-semibold uppercase tracking-wider">Analyzing</span>
            </div>
          )}

          {/* Error Notice Banner */}
          {reviewStatus === 'ERROR' && (
            <div className="px-6 py-2.5 bg-red-950/80 border-b border-red-800/80 flex items-center justify-between text-xs text-red-200 select-none shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Review failed: {errorMessage || 'Could not analyze this code right now.'}</span>
              </div>
              <button
                onClick={handleRunReview}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-graphite-900 hover:bg-graphite-800 text-graphite-200 border border-graphite-700 text-xs font-semibold transition-colors shadow-dev-sm cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* Main Content Area based on Active Lens */}
          {reviewStatus === 'SUCCESS' && activeLens === 'overview' ? (
            <main className="flex-1 h-full overflow-hidden bg-graphite-950">
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
            <main className="flex-1 h-full overflow-hidden bg-graphite-950">
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
            <main className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-graphite-950">
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
                className="w-full lg:w-72 xl:w-80 shrink-0 h-48 lg:h-full border-b lg:border-b-0 border-r border-graphite-800"
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
                onPreviewAiPatch={handlePreviewAiPatch}
                reviewStatus={reviewStatus}
                isStale={isStale}
                isApplyingPatch={isApplyingPatch || isApplyingAiPatch}
                isVerifyingAiPatch={isVerifyingAiPatch}
                filename={currentFilename}
                className="w-full lg:w-80 xl:w-96 shrink-0 h-64 lg:h-full border-t lg:border-t-0 border-l border-graphite-800"
              />
            </main>
          )}
        </>
      )}

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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-60 select-none">
          <div
            role="status"
            aria-live="polite"
            className={`px-4 py-2.5 rounded-lg border shadow-dev-lg flex items-center gap-2.5 text-xs font-sans ${
              toast.type === 'error'
                ? 'bg-graphite-900 border-red-800/80 text-red-300'
                : 'bg-graphite-900 border-brand-500/50 text-graphite-100'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

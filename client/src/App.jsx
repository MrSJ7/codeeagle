import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { ReviewSummary } from './components/ReviewSummary.jsx';
import { CodeEditor } from './components/CodeEditor.jsx';
import { IssuePanel } from './components/IssuePanel.jsx';
import { IssueDetails } from './components/IssueDetails.jsx';
import { PatchDiffBanner } from './components/PatchDiffBanner.jsx';
import { ReviewHistoryDrawer } from './components/ReviewHistoryDrawer.jsx';
import { PatchPreview } from './components/PatchPreview.jsx';
import { CodeEagleLogo } from './components/CodeEagleLogo.jsx';
import { PRESETS } from './data/mockReviews.js';
import {
  runReview,
  applyPatchApi,
  getHealthApi,
  getReviewByIdApi,
  verifyAiPatchApi,
  applyAiPatchApi,
} from './services/reviewApi.js';
import { AlertTriangle, Loader2, Sparkles, Play, RefreshCw } from 'lucide-react';
import { LandingPage } from './components/LandingPage.jsx';

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

  const navigateTo = (route, presetIdToLoad = null) => {
    if (route === currentRoute && !presetIdToLoad) return;

    if (presetIdToLoad) {
      const preset = PRESETS.find((p) => p.id === presetIdToLoad);
      if (preset) {
        setSelectedPresetId(preset.id);
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
    }, 180);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Preset change
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

  // 3. Run Review flow
  const handleRunReview = async () => {
    if (!code.trim()) {
      showToast('Source code cannot be empty.', 'error');
      return;
    }

    setReviewStatus('ANALYZING');
    setErrorMessage(null);
    setPatchDiff(null);
    setPreviewAiIssue(null);
    setAiPreviewData(null);

    try {
      const result = await runReview(code, 'javascript', currentFilename);
      setReviewData(result);
      setReviewStatus('SUCCESS');
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
  };

  // 4. Historical review restoration flow
  const handleSelectHistoricalAudit = async (reviewId) => {
    try {
      const data = await getReviewByIdApi(reviewId);
      if (!data) return;

      // Pure text replacement into editor (never executed)
      setCode(data.code || '');
      setReviewData(data);
      setReviewStatus('SUCCESS');
      setSelectedIssueId(data.issues?.[0]?.id || null);
      setCurrentReviewId(data.reviewId || reviewId);
      setIsHistoricalView(true);
      setHistoricalCreatedAt(data.createdAt || null);
      setPatchDiff(null);
      setErrorMessage(null);
      setIsHistoryOpen(false);

      // If user was viewing landing page, transition directly to the review workbench
      if (currentRoute !== 'review') {
        setCurrentRoute('review');
        if (typeof window !== 'undefined' && window.location.pathname !== '/review') {
          window.history.pushState(null, '', '/review');
        }
      }

      showToast('Restored historical review.');
    } catch (err) {
      console.error('Failed to load historical review:', err);
      showToast(err.message || 'Could not load historical review.', 'error');
    }
  };

  // 5. Safe Apply Patch flow: applies verified patch and loads authoritative re-analysis
  const handleApplyPatch = async (issue) => {
    if (reviewStatus === 'STALE') {
      showToast('Review is stale. Run review again to verify current code.', 'error');
      return;
    }

    if (!issue?.fix?.original || !issue?.fix?.replacement) {
      showToast('No valid patch available for this issue.', 'error');
      return;
    }

    setIsApplyingPatch(true);
    try {
      const result = await applyPatchApi({
        code,
        codeHash: reviewData?.metadata?.codeHash,
        issue,
        language: 'javascript',
        filename: currentFilename,
        beforeReview: reviewData,
      });

      if (result.success) {
        setCode(result.patchedCode);
        setReviewData(result.review);
        setReviewStatus('SUCCESS');
        setPatchDiff(result.diff);

        setIsHistoricalView(false);
        setHistoricalCreatedAt(null);
        setHistoryRefreshTrigger((prev) => prev + 1);

        const nextIssue = result.review.issues.find((i) => i.id !== issue.id);
        setSelectedIssueId(nextIssue?.id || null);
        setCurrentReviewId(result.reviewId || result.review?.reviewId || null);

        const delta = result.diff.scoreAfter - result.diff.scoreBefore;
        const deltaText = delta > 0 ? ` (+${delta} pts)` : '';
        showToast(`Patch applied safely. Score: ${result.diff.scoreBefore} → ${result.diff.scoreAfter}${deltaText}`);
      }
    } catch (err) {
      console.error('Safe patch application failed:', err);
      if (err.code === 'STALE_SOURCE' || err.status === 409) {
        setReviewStatus('STALE');
        showToast('The review is stale. Re-run review before applying this patch.', 'error');
      } else {
        showToast(err.message || 'Could not apply patch safely.', 'error');
      }
    } finally {
      setIsApplyingPatch(false);
    }
  };

  // 6. Preview AI patch flow
  const handlePreviewAiPatch = async (issue) => {
    if (reviewStatus === 'STALE') {
      showToast('Review is stale. Re-run review before previewing fixes.', 'error');
      return;
    }

    setIsVerifyingAiPatch(true);
    try {
      const result = await verifyAiPatchApi({
        code,
        expectedCodeHash: reviewData?.metadata?.codeHash,
        issue,
      });

      if (result.applicable) {
        setPreviewAiIssue(issue);
        setAiPreviewData(result);
      } else {
        showToast(result.message || 'AI patch cannot be applied safely to current source.', 'error');
      }
    } catch (err) {
      console.error('AI patch verification failed:', err);
      showToast(err.message || 'Failed to verify AI patch.', 'error');
    } finally {
      setIsVerifyingAiPatch(false);
    }
  };

  // 7. Apply confirmed AI patch flow
  const handleApplyAiPatch = async (issue) => {
    setIsApplyingAiPatch(true);
    try {
      const result = await applyAiPatchApi({
        code,
        expectedCodeHash: reviewData?.metadata?.codeHash,
        issue,
        language: 'javascript',
        filename: currentFilename,
        beforeReview: reviewData,
      });

      if (result.success) {
        setCode(result.patchedCode);
        setReviewData(result.review);
        setReviewStatus('SUCCESS');
        setPatchDiff(result.diff);
        setPreviewAiIssue(null);
        setAiPreviewData(null);

        setIsHistoricalView(false);
        setHistoricalCreatedAt(null);
        setHistoryRefreshTrigger((prev) => prev + 1);

        const nextIssue = result.review.issues.find((i) => i.id !== issue.id);
        setSelectedIssueId(nextIssue?.id || null);
        setCurrentReviewId(result.reviewId || result.review?.reviewId || null);

        const delta = result.diff.scoreAfter - result.diff.scoreBefore;
        const deltaText = delta > 0 ? ` (+${delta} pts)` : '';
        showToast(`AI patch applied safely. Score: ${result.diff.scoreBefore} → ${result.diff.scoreAfter}${deltaText}`);
      }
    } catch (err) {
      console.error('Safe AI patch application failed:', err);
      if (err.code === 'STALE_SOURCE' || err.status === 409) {
        setReviewStatus('STALE');
        showToast('The review is stale. Re-run review before applying this patch.', 'error');
      } else {
        showToast(err.message || 'Could not apply AI patch safely.', 'error');
      }
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
      } bg-[#F5F7F6] text-stone-900 font-sans transition-opacity duration-200 ${
        isTransitioning ? 'opacity-30' : 'opacity-100'
      }`}
    >
      {currentRoute === 'landing' ? (
        <LandingPage
          onStartReviewing={() => navigateTo('review')}
          onSelectScenarioAndStart={(presetId) => navigateTo('review', presetId)}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      ) : (
        <>
          {/* Primary Header */}
          <Navbar
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
          />

          {/* Review Outcome Banner (Before/After Resolution Diff) */}
          {patchDiff && (
            <PatchDiffBanner
              diff={patchDiff}
              onDismiss={() => setPatchDiff(null)}
            />
          )}

          {/* Review Summary Bar (Visible when review data exists) */}
          {reviewData && reviewStatus !== 'IDLE' && (
            <ReviewSummary
              reviewData={reviewData}
              isStale={isStale}
              isHistorical={isHistoricalView}
              historicalCreatedAt={historicalCreatedAt}
              filename={currentFilename}
              language="JavaScript"
            />
          )}

          {/* Review in Progress Banner */}
          {isReviewing && (
            <div className="px-6 py-2 bg-[#DDF7EC]/60 border-b border-[#0F9F6E]/30 flex items-center justify-between text-xs font-mono text-[#087A54] select-none shrink-0">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0F9F6E]" />
                <span>Reviewing code... Static AST analysis: Complete · Semantic AI reasoning: Running...</span>
              </div>
              <span className="text-[#0F9F6E] text-[10px] font-semibold uppercase tracking-wider">Analyzing</span>
            </div>
          )}

          {/* Error Notice Banner */}
          {reviewStatus === 'ERROR' && (
            <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 flex items-center justify-between text-xs text-red-900 select-none shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Review failed: {errorMessage || 'Could not analyze this code right now.'}</span>
              </div>
              <button
                onClick={handleRunReview}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs font-semibold transition-colors shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* IDLE State Hero Banner (Visible before first review) */}
          {reviewStatus === 'IDLE' && (
            <div className="bg-white border-b border-stone-200/90 px-6 py-4 select-none shrink-0">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Left: Headline & Subtitle */}
                <div className="text-left space-y-1">
                  <h1 className="text-sm sm:text-base font-semibold text-stone-900 tracking-tight font-sans flex items-center gap-2">
                    <span>Review your code. Catch issues before shipping.</span>
                  </h1>
                  <p className="text-xs text-stone-500 leading-relaxed max-w-lg">
                    Deterministic AST static analysis paired with Gemini semantic reasoning. Select a sample scenario or paste your code to run a review.
                  </p>
                </div>

                {/* Right: Presets Cards + CTA */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    const categoryTag =
                      preset.id === 'insecure-login'
                        ? { label: 'SECURITY', color: 'text-[#D92D20] bg-red-50 border-red-200' }
                        : preset.id === 'buggy-react'
                        ? { label: 'REACT', color: 'text-[#4D78A8] bg-blue-50 border-blue-200' }
                        : { label: 'COMPLEXITY', color: 'text-[#C58B00] bg-amber-50 border-amber-200' };

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.id)}
                        className={`px-3 py-2 rounded border text-left transition-all ${
                          isSelected
                            ? 'bg-[#DDF7EC]/30 border-[#0F9F6E] shadow-2xs ring-1 ring-[#0F9F6E]/40'
                            : 'bg-stone-50/70 border-stone-200 hover:bg-stone-100/80 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[9px] font-mono uppercase font-semibold px-1 py-0.2 rounded border ${categoryTag.color}`}>
                            {categoryTag.label}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-stone-900 font-sans whitespace-nowrap">
                          {preset.name}
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleRunReview}
                    className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#0F9F6E] hover:bg-[#087A54] text-white text-xs font-semibold shadow-2xs transition-all whitespace-nowrap ml-1 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Review →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Primary Three-Column Workspace Layout */}
          <main className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#F5F7F6]">
            {/* Left Column: Review findings / Needs Attention */}
            <IssuePanel
              issues={reviewData?.issues || []}
              selectedIssueId={selectedIssueId}
              onSelectIssue={setSelectedIssueId}
              isStale={isStale}
              filename={currentFilename}
              className="w-full lg:w-72 xl:w-80 shrink-0 h-48 lg:h-full border-b lg:border-b-0 border-r border-stone-200/90"
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
              isStale={isStale}
              isApplyingPatch={isApplyingPatch || isApplyingAiPatch}
              isVerifyingAiPatch={isVerifyingAiPatch}
              filename={currentFilename}
              className="w-full lg:w-80 xl:w-96 shrink-0 h-64 lg:h-full border-t lg:border-t-0 border-l border-stone-200/90"
            />
          </main>
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
    </div>
  );
}

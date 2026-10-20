import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Shield, Layers, GitPullRequest, Search, CheckCircle2, AlertTriangle, ArrowRight, Bot } from 'lucide-react';
import { EagleEmblem } from './CodeEagleLogo';
import ChangeStackPill from './ChangeStackPill';

export default function HeroFeatureCards({ onExploreFeature }) {
  const [activeTab, setActiveTab] = useState(0); // 0: REVIEW, 1: TRIAGE, 2: CHANGE STACK, 3: SECURITY
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  const pillars = [
    {
      id: 'review',
      number: '01',
      kicker: '01 REVIEW',
      title: 'Industry-Leading Reviews',
      subtitle: 'Line-by-line actionable comments & committable fixes',
    },
    {
      id: 'triage',
      number: '02',
      kicker: '02 TRIAGE',
      title: 'Prioritize Your PR Flood',
      subtitle: 'Rank blocker PRs in Now vs Next queues',
    },
    {
      id: 'change-stack',
      number: '03',
      kicker: '03 CHANGE STACK',
      title: 'Code Explainability',
      subtitle: 'Mermaid sequence diagrams & executive walkthroughs',
    },
    {
      id: 'security',
      number: '04',
      kicker: '04 SECURITY',
      title: 'Agentic Code Security',
      subtitle: 'Continuous CVE scanning & verified SHA-256 patches',
    },
  ];

  // Auto-advance every 6 seconds if playing and not hovered
  useEffect(() => {
    if (!isPlaying || isHovered) return;

    timerRef.current = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % pillars.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered]);

  return (
    <div
      className="w-full relative select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Playback Controls & Progress Indicators */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            className="w-8 h-8 rounded-md border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900 hover:bg-slate-50 dark:hover:bg-obsidian-850 text-slate-600 dark:text-obsidian-300 flex items-center justify-center transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          <span className="text-[11px] font-mono text-slate-500 dark:text-obsidian-400">
            {isPlaying && !isHovered ? 'Auto-advancing (6s)' : isHovered ? 'Paused on hover' : 'Paused'}
          </span>
        </div>

        {/* Quick Tab Selector for Mobile / Small Screens */}
        <div className="flex items-center gap-1.5 md:hidden">
          {pillars.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActiveTab(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeTab === idx ? 'w-6 bg-orange-500' : 'w-2 bg-slate-300 dark:bg-obsidian-750'
              }`}
              aria-label={`Tab ${p.number}`}
            />
          ))}
        </div>
      </div>

      {/* Main Accordion Container */}
      <div className="flex flex-col md:flex-row gap-0 w-full min-w-0 md:h-[32rem] rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-[#0c0c0e] shadow-xl overflow-hidden">
        {pillars.map((p, idx) => {
          const isActive = activeTab === idx;

          return (
            <div
              key={p.id}
              onClick={() => setActiveTab(idx)}
              style={{
                flexGrow: isActive ? (p.id === 'triage' ? 6.5 : 5) : 1,
              }}
              className={`relative cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-obsidian-800 last:border-b-0 md:last:border-r-0 ${
                isActive
                  ? 'bg-slate-50/50 dark:bg-[#0e0e11] cursor-default'
                  : 'bg-white dark:bg-[#0c0c0e] hover:bg-slate-50/80 dark:hover:bg-[#121216] md:min-w-[8.5rem]'
              }`}
            >
              {/* Header Tab Strip */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-obsidian-800 bg-white/60 dark:bg-[#0c0c0e]/60 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isActive ? 'text-orange-500' : 'text-slate-400 dark:text-obsidian-500'
                    }`}
                  >
                    {p.number}
                  </span>
                  <span
                    className={`text-xs uppercase tracking-wider font-semibold truncate ${
                      isActive
                        ? 'text-slate-900 dark:text-obsidian-100'
                        : 'text-slate-600 dark:text-obsidian-400'
                    }`}
                  >
                    {p.id.replace('-', ' ')}
                  </span>
                </div>

                {isActive && (
                  <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-mono font-medium">
                    ACTIVE
                  </span>
                )}
              </div>

              {/* Linear Progress Bar for active card */}
              {isActive && (
                <div className="w-full h-[2px] bg-slate-100 dark:bg-obsidian-800 overflow-hidden relative">
                  <div
                    key={`progress-${activeTab}`}
                    style={{
                      animationDuration: '6000ms',
                      animationPlayState: isPlaying && !isHovered ? 'running' : 'paused',
                    }}
                    className="h-full bg-orange-500 animate-[progress_6s_linear_forwards] origin-left"
                  />
                </div>
              )}

              {/* Card Body */}
              {isActive ? (
                <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col justify-between animate-fadeIn">
                  {/* Pillar Specific Interactive View */}
                  {idx === 0 && <ReviewPillarMock onExplore={onExploreFeature} />}
                  {idx === 1 && <TriagePillarMock onExplore={onExploreFeature} />}
                  {idx === 2 && <ChangeStackPillarMock onExplore={onExploreFeature} />}
                  {idx === 3 && <SecurityPillarMock onExplore={onExploreFeature} />}
                </div>
              ) : (
                /* Collapsed Vertical State on Desktop */
                <div className="hidden md:flex flex-1 flex-col items-center justify-center p-4 text-center">
                  <div className="[writing-mode:vertical-rl] rotate-180 flex items-center gap-3 text-slate-400 dark:text-obsidian-500 font-mono text-xs font-medium tracking-widest uppercase">
                    <span>{p.title}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-obsidian-700" />
                    <span className="text-orange-500 font-bold">{p.number}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 01 REVIEW: Interactive GitHub PR Diff & Committable Suggestion Drawer
 */
function ReviewPillarMock({ onExplore }) {
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-obsidian-100">
              01 REVIEW · Agentic Line-by-Line Review
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-obsidian-400 mt-0.5">
            Analyzes PR diffs with Quiet, Chill, and Assertive review styles.
          </p>
        </div>
        <button
          onClick={onExplore}
          className="text-xs text-orange-500 hover:text-orange-600 font-mono flex items-center gap-1 font-semibold"
        >
          Open Workbench <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* GitHub Diff Mock */}
      <div className="rounded-lg border border-slate-200 dark:border-obsidian-800 bg-[#0d1117] text-slate-200 font-mono text-xs overflow-hidden shadow-inner">
        {/* Diff Hunk Header */}
        <div className="bg-[#161b22] px-4 py-1.5 text-slate-400 border-b border-slate-800 flex items-center justify-between">
          <span>auth/sessionManager.js</span>
          <span className="text-blue-400 text-[11px]">@@ -42,2 +42,3 @@ export async function createSession</span>
        </div>

        {/* Diff Lines */}
        <div className="p-2 space-y-0.5 font-mono text-[11px] leading-relaxed">
          <div className="px-3 py-0.5 text-slate-400">
            {'  '}const payload = verifyToken(token);
          </div>
          {!suggestionApplied ? (
            <div className="px-3 py-0.5 bg-red-950/40 text-red-300 border-l-2 border-red-500">
              - return issueSession(payload.userId);
            </div>
          ) : null}
          <div className="px-3 py-0.5 bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500">
            + if (payload.expiresAt &lt;= Date.now()) return null;
          </div>
          <div className="px-3 py-0.5 bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500">
            + return issueSession(payload.userId);
          </div>
        </div>

        {/* CodeEagle Bot Review Comment Box */}
        <div className="m-3 p-3 rounded-md bg-[#161b22] border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
                <EagleEmblem size={12} animate={false} />
              </span>
              <span className="font-semibold text-slate-200 text-xs">codeeagle</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 font-medium">bot</span>
              <span className="text-slate-500 text-[11px]">commented just now</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
              CRITICAL BLOCKER
            </span>
          </div>

          <p className="text-slate-300 text-xs font-sans leading-relaxed">
            Expired refresh tokens allow unauthenticated replay sessions if timestamp validation is omitted before calling <code className="text-orange-400 font-mono">issueSession()</code>.
          </p>

          {/* Committable Suggestion Drawer */}
          <div className="rounded border border-slate-700 bg-[#0d1117] p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-sans font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Committable suggestion
              </span>
              <button
                type="button"
                onClick={() => setSuggestionApplied(!suggestionApplied)}
                className={`px-2 py-1 rounded text-[11px] font-sans font-semibold transition-colors ${
                  suggestionApplied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {suggestionApplied ? 'Applied ✓' : 'Apply suggestion'}
              </button>
            </div>
            <pre className="text-emerald-400 font-mono text-[11px] bg-black/40 p-2 rounded">
              {suggestionApplied
                ? '// Fix applied to workspace'
                : 'if (payload.expiresAt <= Date.now()) return null;\nreturn issueSession(payload.userId);'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 02 TRIAGE: Live PR Priority Kanban Board (Now vs Next)
 */
function TriagePillarMock({ onExplore }) {
  const cardsNow = [
    {
      priority: 'P0',
      title: 'Skip bot-authored comment review tasks',
      reason: 'Review this early because it resolves circular agent assumptions and stops PR queue drift.',
      tags: ['Critical Blocker', 'Maintenance', 'Deep review'],
      repo: 'lop #21102',
      author: '@ezrapike[bot]',
    },
    {
      priority: 'P1',
      title: 'feat(agents): extend per-run prompt_cache_key to mcp-research',
      reason: 'Review this early to prevent token exhaustion across adjacent multi-agent pull requests.',
      tags: ['High Impact', 'Feature', 'Deep review'],
      repo: 'rex #21194',
      author: '@arlopike',
    },
  ];

  const cardsNext = [
    {
      priority: 'P1',
      title: 'fix(dashboard): scope PR details authors by org',
      reason: 'Keep visible for async review; useful refinement without an immediate production stop signal.',
      tags: ['Low risk', 'Bug fix', 'Standard'],
      repo: 'havana #21189',
      author: '@ezrapike[bot]',
    },
    {
      priority: 'P2',
      title: '[codex] Lean path instruction metrics insert',
      reason: 'Hold behind refresh cycle; work is draft state with upstream merge conflicts pending.',
      tags: ['Draft', 'Needs author action'],
      repo: 'silver #21153',
      author: '@miravale',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-obsidian-100">
              02 TRIAGE · PR Triage & Blocker Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-obsidian-400 mt-0.5">
            Sorts massive PR queues into immediate focus (Now) and async queue (Next).
          </p>
        </div>
        <button
          onClick={onExplore}
          className="text-xs text-orange-500 hover:text-orange-600 font-mono flex items-center gap-1 font-semibold"
        >
          View Board <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
        {/* NOW Column */}
        <div className="p-3 rounded-lg border border-orange-500/20 bg-orange-500/[0.02] dark:bg-orange-950/[0.05] space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-2">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-obsidian-100">Now</span>
              <span className="text-[10px] text-slate-500 dark:text-obsidian-400 block">Within today's capacity</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono text-xs font-bold">
              14 PRs
            </span>
          </div>

          {cardsNow.map((c, i) => (
            <div
              key={i}
              className="p-3 rounded-md border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-[#121216] shadow-sm space-y-2 hover:border-orange-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                  {c.priority}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-obsidian-100 flex-1 leading-snug">
                  {c.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-obsidian-400 leading-relaxed">
                {c.reason}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-obsidian-850">
                {c.tags.map((t, ti) => (
                  <span key={ti} className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-obsidian-800 text-[10px] text-slate-600 dark:text-obsidian-400 font-mono">
                    {t}
                  </span>
                ))}
                <span className="ml-auto text-[10px] font-mono text-slate-400">{c.repo}</span>
              </div>
            </div>
          ))}
        </div>

        {/* NEXT Column */}
        <div className="p-3 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-900/20 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-2">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-obsidian-100">Next</span>
              <span className="text-[10px] text-slate-500 dark:text-obsidian-400 block">All remaining reviews</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-obsidian-800 text-slate-600 dark:text-obsidian-400 font-mono text-xs font-bold">
              66 PRs
            </span>
          </div>

          {cardsNext.map((c, i) => (
            <div
              key={i}
              className="p-3 rounded-md border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-[#121216] shadow-sm space-y-2 opacity-85 hover:opacity-100 transition-opacity"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {c.priority}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-obsidian-100 flex-1 leading-snug">
                  {c.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-obsidian-400 leading-relaxed">
                {c.reason}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-obsidian-850">
                {c.tags.map((t, ti) => (
                  <span key={ti} className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-obsidian-800 text-[10px] text-slate-600 dark:text-obsidian-400 font-mono">
                    {t}
                  </span>
                ))}
                <span className="ml-auto text-[10px] font-mono text-slate-400">{c.repo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 03 CHANGE STACK: Code Explainability, Mermaid Sequence Flow & Whimsical Poem
 */
function ChangeStackPillarMock({ onExplore }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-obsidian-100">
              03 CHANGE STACK · Code Explainability
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-obsidian-400 mt-0.5">
            Converts complex multi-commit PRs into sequence diagrams, cohorts, and poems.
          </p>
        </div>
        <ChangeStackPill onClick={onExplore} tone="primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Sequence Flow */}
        <div className="md:col-span-2 p-3.5 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-[#0d1117] text-slate-200 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
            <span className="font-semibold text-orange-400">Mermaid Execution Flow</span>
            <span>autonumber sequence</span>
          </div>

          <div className="space-y-2 font-sans text-xs">
            <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-[11px] flex items-center justify-center">1</span>
              <span><strong>Client</strong> calls <code className="text-orange-300 font-mono">POST /api/auth/token</code></span>
            </div>
            <div className="p-2 rounded bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold text-[11px] flex items-center justify-center">2</span>
              <span><strong>Gateway</strong> validates JWT payload timestamp expiry</span>
            </div>
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-700/60 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[11px] flex items-center justify-center">3</span>
              <span><strong>Session Store</strong> issues signed credential cookie</span>
            </div>
          </div>
        </div>

        {/* Developer Poem & Risk Score */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-[#121216] shadow-sm space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-orange-500 font-bold">
              Whimsical PR Poem
            </div>
            <p className="text-xs italic text-slate-600 dark:text-obsidian-300 font-serif leading-relaxed">
              &quot;The eagle watches through the night,<br />
              No leaked keys escape its sight.<br />
              Clean commits and tests that pass,<br />
              Production-grade in every class.&quot;
            </p>
          </div>

          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">PR Health Score</span>
              <div className="text-lg font-bold text-slate-900 dark:text-obsidian-100">94 / 100</div>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-500 text-white font-mono text-xs font-bold">
              Low Risk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 04 SECURITY: Real-time Codebase Health, Live Radar, Segmented Health Bar & CVE Audit
 */
function SecurityPillarMock({ onExplore }) {
  return (
    <div className="space-y-4">
      {/* Codebase Health Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-3">
        <div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-obsidian-400 uppercase tracking-wider">
            Real-time codebase health
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-obsidian-100 flex items-center gap-2">
            Mostly healthy
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-obsidian-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            Scanning every PR
          </span>
          <span>·</span>
          <span>Last scan now</span>
          <span>·</span>
          <span className="text-emerald-500 font-bold">0 critical</span>
        </div>
      </div>

      {/* Segmented Health Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-obsidian-800 flex overflow-hidden">
          <div style={{ width: '86%' }} className="h-full bg-emerald-500" title="Healthy 86%" />
          <div style={{ width: '12%' }} className="h-full bg-amber-500" title="High 12%" />
          <div style={{ width: '2%' }} className="h-full bg-red-500" title="Critical 2%" />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>86% Healthy</span>
          <span>12% High</span>
          <span>2% Critical</span>
        </div>
      </div>

      {/* Security Findings & Doughnut Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Finding Card */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-[#121216] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-obsidian-100">
              Dependency vulnerability
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              High
            </span>
          </div>
          <div className="text-xs font-mono text-slate-500 dark:text-obsidian-400">
            axios · GHSA-4w2v-q235-vp99
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-obsidian-850 text-xs">
            <span className="text-slate-400 text-[11px]">Detected on PR #482</span>
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-semibold">
              Fix ready
            </span>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-[#121216] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-obsidian-100">
              Severity distribution
            </div>
            <div className="text-[11px] text-slate-500 dark:text-obsidian-400 mt-0.5">
              AI Deep Scan & Dependencies
            </div>
            <div className="flex items-center gap-3 mt-2 text-[11px] font-mono">
              <span className="text-red-500">Critical 2%</span>
              <span className="text-amber-500">High 12%</span>
              <span className="text-blue-500">Med 38%</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-obsidian-100">1,999</div>
            <div className="text-[10px] font-mono text-slate-400">findings</div>
          </div>
        </div>
      </div>
    </div>
  );
}

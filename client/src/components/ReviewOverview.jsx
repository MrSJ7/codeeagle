import React, { useState } from 'react';
import {
  FileCode,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  GitBranch,
  Copy,
  Check,
  Feather,
  MessageSquare,
  FileDiff,
  Terminal,
  GitPullRequest,
} from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { SeverityBadge } from './SeverityBadge.jsx';
import { EagleEmblem } from './CodeEagleLogo.jsx';
import { useTheme } from '@/context/ThemeContext.jsx';
import { cn } from '@/lib/utils';

export function ReviewOverview({
  reviewData,
  filename = 'auth.js',
  language = 'JavaScript',
  lineCount = 27,
  onNavigateFindings,
  onSelectIssue,
  onNavigateDiff,
  onNavigateChat,
  onNavigateTriage,
  onNavigateSecurity,
  className = '',
}) {
  const { isLight, isDark } = useTheme();
  const [prCopied, setPrCopied] = useState(false);
  const [diagramCopied, setDiagramCopied] = useState(false);
  const [showDiagramCode, setShowDiagramCode] = useState(false);

  if (!reviewData) return null;

  const {
    score = 100,
    breakdown = {},
    issues = [],
    summary = {},
    walkthrough = null,
  } = reviewData;

  const normScore = Math.max(0, Math.min(100, Math.round(score)));
  const totalFindings = issues.length;
  const criticalIssues = issues.filter((i) => i.severity === 'CRITICAL');
  const highIssues = issues.filter((i) => i.severity === 'HIGH');
  const otherIssues = issues.filter(
    (i) => i.severity !== 'CRITICAL' && i.severity !== 'HIGH'
  );

  const getVerdict = (s) => {
    if (s === 100) return 'Ready to ship';
    if (s >= 90) return 'Minor issues';
    if (s >= 70) return 'Needs attention';
    if (s >= 50) return 'Significant issues';
    return 'High risk';
  };

  const verdict = walkthrough?.verdict || getVerdict(normScore);
  const riskLevel = walkthrough?.riskLevel || (normScore >= 80 ? 'LOW' : normScore >= 50 ? 'HIGH' : 'CRITICAL');
  const blockers = [...criticalIssues, ...highIssues, ...otherIssues];
  const topBlocker = blockers[0] || null;

  // Mermaid diagram fallback or generated
  const sequenceDiagram = walkthrough?.diagram || `sequenceDiagram
  autonumber
  actor Client as User / Client
  participant Module as ${filename}
  participant Core as Core Engine
  Client->>Module: invoke()
  Module->>Core: execute()
  Core-->>Client: response`;

  // Whimsical poem
  const poem = walkthrough?.poem || `An eagle's eye scanned every line,
Ensuring patterns clean and fine.
With bugs defused and logic tight,
Your codebase takes to stellar flight!`;

  // Generate GitHub PR Markdown summary
  const generateGitHubPrMarkdown = () => {
    return `<!-- CodeEagle Pull Request Review -->
## 🦅 CodeEagle Review Summary

### 📊 Assessment: **${verdict}** (Score: ${normScore}/100)
- **File**: \`${filename}\` (${lineCount} lines, ${language})
- **Findings**: ${totalFindings} (${criticalIssues.length} critical, ${highIssues.length} high, ${otherIssues.length} minor)

---

### 📋 Executive Walkthrough
${walkthrough?.executiveSummary || `CodeEagle analyzed \`${filename}\` for logic flaws, security vulnerabilities, and code complexity.`}

#### Key Observations:
${(walkthrough?.keyObservations || ['Clean execution paths detected.']).map((obs) => `- ${obs}`).join('\n')}

---

### 📐 Execution Sequence Flow
\`\`\`mermaid
${sequenceDiagram}
\`\`\`

---

### 🎯 Actionable Findings (${totalFindings})
${issues.length === 0 ? '- ✅ No issues detected. Clean execution verified.' : issues.map((i, idx) => `**${idx + 1}. [${i.severity}] ${i.rule} (Line ${i.line})**: ${i.title}\n   - *Recommendation*: ${i.recommendation}`).join('\n\n')}

---

### 🦅 Eagle's Whimsical Poem
> *${poem.split('\n').join('\n> *')}*

*Reviewed with pride by [CodeEagle](https://github.com/MrSJ7/codeeagle)*`;
  };

  const handleCopyPrSummary = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(generateGitHubPrMarkdown());
        setPrCopied(true);
        setTimeout(() => setPrCopied(false), 2200);
      }
    } catch (err) {}
  };

  const handleCopyDiagram = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(sequenceDiagram);
        setDiagramCopied(true);
        setTimeout(() => setDiagramCopied(false), 2000);
      }
    } catch (err) {}
  };

  return (
    <div
      className={cn(
        "h-full overflow-y-auto p-4 sm:p-8 font-sans select-none",
        isLight ? "bg-slate-50 text-slate-900" : "bg-obsidian-950 text-obsidian-50",
        className
      )}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 1. Header & Actions Bar */}
        <div className={cn(
          "p-6 rounded-[10px] border shadow-xs space-y-4",
          isLight ? "bg-white border-slate-200" : "bg-obsidian-900 border-obsidian-800"
        )}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <EagleEmblem size={28} dark={isDark} />
              <div className="flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-obsidian-400">
                <span className="font-bold text-slate-900 dark:text-obsidian-100 text-sm">{filename}</span>
                <span className="text-slate-300 dark:text-obsidian-600">•</span>
                <span>{language}</span>
                <span className="text-slate-300 dark:text-obsidian-600">•</span>
                <span>{lineCount} lines</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {onNavigateTriage && (
                <button
                  type="button"
                  onClick={onNavigateTriage}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border text-xs font-mono transition-colors cursor-pointer",
                    isLight
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      : "bg-obsidian-950 hover:bg-obsidian-850 border-obsidian-750 text-obsidian-300"
                  )}
                  title="Open PR Triage Board"
                >
                  <GitPullRequest className="w-3.5 h-3.5 text-orange-500" />
                  <span>Triage</span>
                </button>
              )}

              {onNavigateSecurity && (
                <button
                  type="button"
                  onClick={onNavigateSecurity}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border text-xs font-mono transition-colors cursor-pointer",
                    isLight
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      : "bg-obsidian-950 hover:bg-obsidian-850 border-obsidian-750 text-obsidian-300"
                  )}
                  title="Audit Code Security"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Security</span>
                </button>
              )}

              {onNavigateDiff && (
                <button
                  type="button"
                  onClick={onNavigateDiff}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border text-xs font-mono transition-colors cursor-pointer",
                    isLight
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      : "bg-obsidian-950 hover:bg-obsidian-850 border-obsidian-750 text-obsidian-300"
                  )}
                  title="View Git Diff"
                >
                  <FileDiff className="w-3.5 h-3.5 text-blue-500" />
                  <span>View Diff</span>
                </button>
              )}

              {onNavigateChat && (
                <button
                  type="button"
                  onClick={onNavigateChat}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border text-xs font-mono transition-colors cursor-pointer",
                    isLight
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      : "bg-obsidian-950 hover:bg-obsidian-850 border-obsidian-750 text-obsidian-300"
                  )}
                  title="Ask CodeEagle"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                  <span>Ask Eagle</span>
                </button>
              )}

              {/* Copy for GitHub PR Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyPrSummary}
                leftIcon={prCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                <span>{prCopied ? 'PR Summary Copied!' : 'Copy for GitHub PR'}</span>
              </Button>
            </div>
          </div>

          {/* Assessment Score Banner */}
          <div className="flex items-baseline gap-4 flex-wrap pt-2 border-t border-slate-100 dark:border-obsidian-800">
            <div className="flex items-baseline gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-slate-50 dark:bg-obsidian-950 border border-slate-200 dark:border-obsidian-750 font-mono shadow-xs">
              <span
                className={`text-2xl font-black ${
                  normScore >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : normScore >= 50
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {normScore}
              </span>
              <span className="text-xs text-slate-400 dark:text-obsidian-500 font-normal">/ 100</span>
            </div>

            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-obsidian-50">
                  {verdict}
                </h2>
                <span className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase",
                  riskLevel === 'CRITICAL'
                    ? "bg-red-500/10 text-red-500 border border-red-500/30"
                    : riskLevel === 'HIGH'
                    ? "bg-orange-500/10 text-orange-500 border border-orange-500/30"
                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                )}>
                  {riskLevel} RISK
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-obsidian-400 font-normal mt-0.5">
                {totalFindings === 0
                  ? 'Zero vulnerabilities or regressions detected.'
                  : `${totalFindings} ${totalFindings === 1 ? 'finding needs' : 'findings need'} review prior to production merge.`}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Walkthrough & Semantic Change Stack */}
        <div className={cn(
          "p-6 rounded-[10px] border shadow-xs space-y-4",
          isLight ? "bg-white border-slate-200" : "bg-obsidian-900 border-obsidian-800"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-brand-400">
              <Layers className="w-4 h-4" />
              <span>Walkthrough & Change Stack</span>
            </div>
            {walkthrough?.fileRole && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-brand-500/10 text-blue-700 dark:text-brand-400 border border-blue-200 dark:border-brand-500/20 font-semibold">
                Cohort: {walkthrough.fileRole}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-700 dark:text-obsidian-200 leading-relaxed font-sans">
            {walkthrough?.executiveSummary ||
              `CodeEagle completed a full AST inspection of \`${filename}\`. Found ${totalFindings} actionable items across ${Array.from(new Set(issues.map((i) => i.category))).join(', ') || 'clean branches'}.`}
          </p>

          {/* Observations */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-obsidian-400 font-semibold">
              Key Insights
            </div>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-obsidian-300">
              {(walkthrough?.keyObservations || [
                'Syntax validated against ES2024 spec.',
                'Cyclomatic complexity within bounds.',
              ]).map((obs, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 dark:text-brand-500 font-bold mt-0.5">•</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. Sequence Flow / Architecture Diagram */}
        <div className={cn(
          "p-6 rounded-[10px] border shadow-xs space-y-4",
          isLight ? "bg-white border-slate-200" : "bg-obsidian-900 border-obsidian-800"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-brand-400">
              <GitBranch className="w-4 h-4" />
              <span>Architecture Sequence Flow</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDiagramCode(!showDiagramCode)}
                className="text-[11px] font-mono text-slate-500 dark:text-obsidian-400 hover:text-slate-800 dark:hover:text-obsidian-200 transition-colors cursor-pointer"
              >
                {showDiagramCode ? 'Show Visual' : 'Show Mermaid'}
              </button>

              <button
                type="button"
                onClick={handleCopyDiagram}
                className="text-[11px] font-mono text-slate-500 dark:text-obsidian-400 hover:text-slate-800 dark:hover:text-obsidian-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy Mermaid Code"
              >
                {diagramCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {showDiagramCode ? (
            <div className="p-3.5 rounded-[6px] bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              <pre>{sequenceDiagram}</pre>
            </div>
          ) : (
            /* Visual Flow Representation */
            <div className="p-4 rounded-[8px] bg-slate-50 dark:bg-obsidian-950 border border-slate-200 dark:border-obsidian-800 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-obsidian-800 text-[11px] text-slate-500 dark:text-obsidian-400">
                <span>Sequence Flow Steps</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Mermaid Ready</span>
              </div>
              <div className="space-y-2 pt-1 font-mono text-xs">
                {sequenceDiagram.split('\n')
                  .filter((l) => l.includes('->>') || l.includes('-->>') || l.includes('Note over'))
                  .map((step, idx) => {
                    const isWarning = step.includes('⚠️');
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-[5px] text-xs transition-colors",
                          isWarning
                            ? "bg-red-500/10 text-red-400 border border-red-500/20 font-bold"
                            : "bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 text-slate-700 dark:text-obsidian-300"
                        )}
                      >
                        <span className="w-5 text-right font-bold text-slate-400 dark:text-obsidian-500 text-[10px]">
                          {idx + 1}.
                        </span>
                        <span className="truncate">{step.trim()}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* 4. Whimsical Developer Poem (CodeRabbit Signature Easter Egg) */}
        <div className={cn(
          "p-5 rounded-[10px] border shadow-xs relative overflow-hidden",
          isLight
            ? "bg-gradient-to-r from-amber-50/70 to-orange-50/70 border-amber-200 text-amber-950"
            : "bg-gradient-to-r from-brand-950/20 via-obsidian-900 to-amber-950/20 border-brand-500/30 text-obsidian-200"
        )}>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-brand-500 mb-2">
            <Feather className="w-4 h-4 text-brand-500" />
            <span>Eagle's Whimsical Poem</span>
          </div>

          <div className="italic font-serif text-sm leading-relaxed pl-3 border-l-2 border-brand-500">
            {poem.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        {/* 5. What's Stopping This Code (Blocker Checklist) */}
        {totalFindings > 0 ? (
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-mono font-bold text-slate-700 dark:text-obsidian-300">
                Actionable Items Ranked by Risk
              </h3>
              <span className="text-xs text-slate-400 dark:text-obsidian-500 font-mono">
                {totalFindings} findings
              </span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-obsidian-800 rounded-[8px] border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900 shadow-xs overflow-hidden">
              {blockers.map((issue, idx) => (
                <div
                  key={issue.id}
                  onClick={() => {
                    if (onSelectIssue) onSelectIssue(issue.id);
                    if (onNavigateFindings) onNavigateFindings();
                  }}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-obsidian-850 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-obsidian-500 mt-0.5 w-4 shrink-0">
                      0{idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            issue.severity === 'CRITICAL'
                              ? 'bg-red-500'
                              : issue.severity === 'HIGH'
                              ? 'bg-orange-500'
                              : issue.severity === 'MEDIUM'
                              ? 'bg-amber-500'
                              : 'bg-slate-400 dark:bg-obsidian-400'
                          }`}
                        />
                        <span className="text-sm font-semibold text-slate-900 dark:text-obsidian-100 group-hover:text-blue-600 dark:group-hover:text-brand-400 transition-colors truncate">
                          {issue.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[3px] bg-slate-100 dark:bg-obsidian-800 text-slate-700 dark:text-obsidian-300 border border-slate-200 dark:border-obsidian-700">
                          {issue.category}
                        </span>
                      </div>

                      <div className="text-sm text-slate-600 dark:text-obsidian-400 truncate max-w-xl font-sans">
                        {issue.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-slate-500 dark:text-obsidian-400">
                      line {issue.line}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-obsidian-500 group-hover:text-blue-600 dark:group-hover:text-brand-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-[8px] border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900 text-center shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-obsidian-100 mb-1">
              Code is ready to ship
            </h3>
            <p className="text-xs text-slate-500 dark:text-obsidian-400 max-w-sm mx-auto leading-relaxed">
              No security vulnerabilities, credential leaks, or performance bottlenecks were detected.
            </p>
          </div>
        )}

        {/* 6. Score Breakdown */}
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-700 dark:text-obsidian-300 mb-3">
            Score breakdown
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-[6px] bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-xs">
              <div className="text-slate-500 dark:text-obsidian-400 text-[11px] font-medium mb-1">
                Security
              </div>
              <div
                className={`text-lg font-bold ${
                  (breakdown.security ?? 100) >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : (breakdown.security ?? 100) >= 50
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {breakdown.security ?? 100}
                <span className="text-xs text-slate-400 dark:text-obsidian-500 font-normal"> / 100</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[6px] bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-xs">
              <div className="text-slate-500 dark:text-obsidian-400 text-[11px] font-medium mb-1">
                Quality
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-obsidian-100">
                {breakdown.quality ?? 100}
                <span className="text-xs text-slate-400 dark:text-obsidian-500 font-normal"> / 100</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[6px] bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-xs">
              <div className="text-slate-500 dark:text-obsidian-400 text-[11px] font-medium mb-1">
                Performance
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-obsidian-100">
                {breakdown.performance ?? 100}
                <span className="text-xs text-slate-400 dark:text-obsidian-500 font-normal"> / 100</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[6px] bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-800 shadow-xs">
              <div className="text-slate-500 dark:text-obsidian-400 text-[11px] font-medium mb-1">
                Complexity
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-obsidian-100">
                {breakdown.complexity ?? 100}
                <span className="text-xs text-slate-400 dark:text-obsidian-500 font-normal"> / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Action Footer */}
        {totalFindings > 0 && (
          <div className="pt-4 flex items-center justify-between gap-4 flex-wrap border-t border-slate-200 dark:border-obsidian-800">
            <div className="text-xs text-slate-500 dark:text-obsidian-400 font-sans">
              Inspect findings in the editor or view git diff:
            </div>
            <div className="flex items-center gap-2">
              {onNavigateTriage && (
                <button
                  type="button"
                  onClick={onNavigateTriage}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border text-xs font-mono transition-colors cursor-pointer",
                    isLight
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      : "bg-obsidian-950 hover:bg-obsidian-850 border-obsidian-750 text-obsidian-300"
                  )}
                  title="Open PR Triage Board"
                >
                  <GitPullRequest className="w-3.5 h-3.5 text-orange-500" />
                  <span>Triage</span>
                </button>
              )}

              {onNavigateSecurity && (
                <button
                  type="button"
                  onClick={onNavigateSecurity}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border text-xs font-mono transition-colors cursor-pointer",
                    isLight
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      : "bg-obsidian-950 hover:bg-obsidian-850 border-obsidian-750 text-obsidian-300"
                  )}
                  title="Audit Code Security"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Security</span>
                </button>
              )}

              {onNavigateDiff && (
                <Button variant="secondary" size="lg" onClick={onNavigateDiff} leftIcon={<FileDiff className="w-4 h-4" />}>
                  Review Diff
                </Button>
              )}
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (topBlocker && onSelectIssue) onSelectIssue(topBlocker.id);
                  if (onNavigateFindings) onNavigateFindings();
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Inspect Findings ({totalFindings})
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

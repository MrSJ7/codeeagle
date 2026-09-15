import React from 'react';
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
} from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';

export function ReviewOverview({
  reviewData,
  filename = 'auth.js',
  language = 'JavaScript',
  lineCount = 27,
  onNavigateFindings,
  onSelectIssue,
  className = '',
}) {
  if (!reviewData) return null;

  const { score = 100, breakdown = {}, issues = [], metadata = {} } = reviewData;
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

  const verdict = getVerdict(normScore);

  // Top blockers to show in "What's stopping this"
  const blockers = [...criticalIssues, ...highIssues, ...otherIssues];
  const topBlocker = blockers[0] || null;

  return (
    <div
      className={`h-full overflow-y-auto bg-graphite-950 p-6 sm:p-10 font-sans select-none ${className}`}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 1. Review Header Briefing */}
        <div className="border-b border-graphite-800 pb-6">
          <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
            <div className="flex items-center gap-2 font-mono text-xs text-graphite-300">
              <FileCode className="w-4 h-4 text-brand-400" />
              <span className="font-bold text-graphite-100 text-sm">{filename}</span>
              <span className="text-graphite-600 font-sans">•</span>
              <span>{language}</span>
              <span className="text-graphite-600 font-sans">•</span>
              <span>{lineCount} lines</span>
            </div>

            <Badge variant={totalFindings === 0 ? 'success' : 'critical'}>
              {totalFindings === 0 ? 'ALL CHECKS PASSED' : 'REVIEW COMPLETE'}
            </Badge>
          </div>

          <div className="flex items-baseline gap-4 flex-wrap mt-2">
            <div className="flex items-baseline gap-1.5 px-3 py-1 rounded-lg bg-graphite-900 border border-graphite-750 font-mono shadow-dev-sm">
              <span
                className={`text-2xl font-black ${
                  normScore >= 80
                    ? 'text-brand-400'
                    : normScore >= 50
                    ? 'text-orange-400'
                    : 'text-red-400'
                }`}
              >
                {normScore}
              </span>
              <span className="text-xs text-graphite-500 font-normal">/ 100</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-graphite-100 tracking-tight">
                {verdict}
              </h2>
              <p className="text-xs text-graphite-400 font-medium">
                {totalFindings === 0
                  ? 'Zero vulnerabilities or regressions detected.'
                  : `${totalFindings} ${
                      totalFindings === 1 ? 'finding needs' : 'findings need'
                    } attention before merging.`}
              </p>
            </div>
          </div>
        </div>

        {/* 2. What's Stopping This (The Blocker Checklist) */}
        {totalFindings > 0 ? (
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-graphite-400">
                What's Stopping This Code
              </h3>
              <span className="text-xs text-graphite-500 font-mono">
                {totalFindings} issues ranked by risk
              </span>
            </div>

            <div className="divide-y divide-graphite-800 rounded-xl border border-graphite-800 bg-graphite-900 shadow-dev-sm overflow-hidden">
              {blockers.map((issue, idx) => (
                <div
                  key={issue.id}
                  onClick={() => {
                    if (onSelectIssue) onSelectIssue(issue.id);
                    if (onNavigateFindings) onNavigateFindings();
                  }}
                  className="p-4 hover:bg-graphite-850/80 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-graphite-500 mt-0.5 w-4 shrink-0">
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
                              : 'bg-cyan-400'
                          }`}
                        />
                        <span className="text-sm font-semibold text-graphite-100 group-hover:text-brand-300 transition-colors truncate">
                          {issue.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-graphite-800 text-graphite-400 border border-graphite-700">
                          {issue.category}
                        </span>
                      </div>

                      <div className="text-xs text-graphite-400 truncate max-w-xl font-sans">
                        {issue.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-graphite-400">
                      line {issue.line}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-graphite-500 group-hover:text-brand-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-graphite-800 bg-graphite-900 text-center shadow-dev-sm">
            <CheckCircle2 className="w-8 h-8 text-brand-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-graphite-100 mb-1">
              Code is ready to ship
            </h3>
            <p className="text-xs text-graphite-400 max-w-sm mx-auto leading-relaxed">
              No security vulnerabilities, credential leaks, or performance bottlenecks were detected.
            </p>
          </div>
        )}

        {/* 3. Review Signals (Quality Breakdown) */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-graphite-400 mb-3">
            Review Signals
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-graphite-900 border border-graphite-800 shadow-dev-sm">
              <div className="text-graphite-400 text-[11px] uppercase tracking-wider mb-1">
                Security
              </div>
              <div
                className={`text-lg font-bold ${
                  (breakdown.security ?? 100) >= 80
                    ? 'text-brand-400'
                    : (breakdown.security ?? 100) >= 50
                    ? 'text-orange-400'
                    : 'text-red-400'
                }`}
              >
                {breakdown.security ?? 100}
                <span className="text-xs text-graphite-500 font-normal"> / 100</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-graphite-900 border border-graphite-800 shadow-dev-sm">
              <div className="text-graphite-400 text-[11px] uppercase tracking-wider mb-1">
                Quality
              </div>
              <div className="text-lg font-bold text-graphite-100">
                {breakdown.quality ?? 100}
                <span className="text-xs text-graphite-500 font-normal"> / 100</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-graphite-900 border border-graphite-800 shadow-dev-sm">
              <div className="text-graphite-400 text-[11px] uppercase tracking-wider mb-1">
                Performance
              </div>
              <div className="text-lg font-bold text-graphite-100">
                {breakdown.performance ?? 100}
                <span className="text-xs text-graphite-500 font-normal"> / 100</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-graphite-900 border border-graphite-800 shadow-dev-sm">
              <div className="text-graphite-400 text-[11px] uppercase tracking-wider mb-1">
                Complexity
              </div>
              <div className="text-lg font-bold text-graphite-100">
                {breakdown.complexity ?? 100}
                <span className="text-xs text-graphite-500 font-normal"> / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Obvious Primary Action */}
        {totalFindings > 0 && (
          <div className="pt-4 flex items-center justify-between gap-4 flex-wrap border-t border-graphite-800">
            <div className="text-xs text-graphite-400 font-sans">
              Proceed to inspect line-anchored findings and apply verified fixes:
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (topBlocker && onSelectIssue) onSelectIssue(topBlocker.id);
                if (onNavigateFindings) onNavigateFindings();
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View Findings ({totalFindings})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

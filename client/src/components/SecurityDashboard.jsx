import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, Lock, Key, Terminal, Code2, ArrowRight } from 'lucide-react';

/**
 * 04 SECURITY: Agentic Code Security & CVE Audit Component.
 * Reverse-engineered from CodeRabbit's Security Pillar (source-25).
 * Features:
 * - Real-time codebase health with live scanning radar pulse
 * - Segmented health bar (Healthy, Unscanned, High, Critical)
 * - Security audit vulnerability cards with CWE classification
 * - One-click verified SHA-256 patch application
 * - Severity distribution metrics
 */
export default function SecurityDashboard({
  issues = [],
  filename = 'source.js',
  onSelectIssue,
  onApplyFix,
}) {
  const securityIssues = issues.filter((i) => i.category === 'SECURITY' || i.rule?.startsWith('SEC-'));
  const criticalCount = securityIssues.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = securityIssues.filter((i) => i.severity === 'HIGH').length;
  const mediumCount = securityIssues.filter((i) => i.severity === 'MEDIUM').length;
  const lowCount = securityIssues.filter((i) => i.severity === 'LOW').length;

  const isHealthy = criticalCount === 0 && highCount === 0;
  const healthLabel = criticalCount > 0 ? 'Critical vulnerabilities detected' : highCount > 0 ? 'High risks present' : 'Mostly healthy';

  // Compute percentages for segmented health bar
  const totalWeight = Math.max(1, criticalCount * 4 + highCount * 2 + mediumCount + 10);
  const criticalPct = Math.round((criticalCount * 4 / totalWeight) * 100);
  const highPct = Math.round((highCount * 2 / totalWeight) * 100);
  const healthyPct = Math.max(0, 100 - criticalPct - highPct);

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 dark:bg-obsidian-950 p-4 sm:p-6 space-y-6">
      {/* Real-Time Codebase Health Header */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                04 SECURITY
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-obsidian-100">
                Agentic Code Security
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-slate-800 dark:text-obsidian-200">
                {healthLabel}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-ping'
                }`}
              />
            </div>
          </div>

          {/* Live Scanner Radar Status */}
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-obsidian-400 bg-slate-50 dark:bg-obsidian-850 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-obsidian-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              Scanning every commit
            </span>
            <span>·</span>
            <span>Last audit now</span>
            <span>·</span>
            <span className={criticalCount > 0 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>
              {criticalCount} critical
            </span>
          </div>
        </div>

        {/* Segmented Health Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-obsidian-800 flex overflow-hidden shadow-inner">
            <div
              style={{ width: `${healthyPct}%` }}
              className="h-full bg-emerald-500 transition-all duration-500"
              title={`Healthy ${healthyPct}%`}
            />
            <div
              style={{ width: `${highPct}%` }}
              className="h-full bg-amber-500 transition-all duration-500"
              title={`High ${highPct}%`}
            />
            <div
              style={{ width: `${criticalPct}%` }}
              className="h-full bg-red-500 transition-all duration-500"
              title={`Critical ${criticalPct}%`}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{healthyPct}% Healthy</span>
            {highPct > 0 && <span className="text-amber-500 font-semibold">{highPct}% High</span>}
            {criticalPct > 0 && <span className="text-red-500 font-semibold">{criticalPct}% Critical</span>}
          </div>
        </div>
      </div>

      {/* Security Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900">
          <span className="text-[11px] font-mono text-slate-400">Critical Leaks (CWE-798)</span>
          <div className="text-xl font-bold font-mono text-red-500 mt-1">{criticalCount}</div>
        </div>
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900">
          <span className="text-[11px] font-mono text-slate-400">Injection Vectors (CWE-89/95)</span>
          <div className="text-xl font-bold font-mono text-amber-500 mt-1">{highCount}</div>
        </div>
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900">
          <span className="text-[11px] font-mono text-slate-400">State / XSS Warnings</span>
          <div className="text-xl font-bold font-mono text-blue-500 mt-1">{mediumCount}</div>
        </div>
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900">
          <span className="text-[11px] font-mono text-slate-400">Verified Fixes Ready</span>
          <div className="text-xl font-bold font-mono text-emerald-500 mt-1">
            {securityIssues.filter((i) => i.fix).length}
          </div>
        </div>
      </div>

      {/* Security Findings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-obsidian-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-500" />
            Vulnerability Audit Findings ({securityIssues.length})
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Auditing {filename}
          </span>
        </div>

        {securityIssues.length === 0 ? (
          <div className="p-10 text-center rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/[0.02]">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <div className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              Zero Security Vulnerabilities Detected
            </div>
            <p className="text-xs text-slate-500 dark:text-obsidian-400 max-w-md mx-auto mt-1">
              Static AST security passes and semantic taint analysis confirmed no credential leaks, eval calls, unescaped HTML, or SQL injection vectors.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {securityIssues.map((issue) => {
              const isCrit = issue.severity === 'CRITICAL';

              return (
                <div
                  key={issue.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900 shadow-sm space-y-3 hover:border-orange-500/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isCrit
                            ? 'bg-red-500 text-white'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="font-mono text-xs text-slate-500 dark:text-obsidian-400">
                        {issue.rule}
                      </span>
                      {issue.rule === 'SEC-SECRET' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          CWE-798
                        </span>
                      )}
                      {issue.rule === 'SEC-SQLI' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          CWE-89
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      Line {issue.line}{issue.endLine && issue.endLine !== issue.line ? `-${issue.endLine}` : ''}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-obsidian-100">
                    {issue.title || issue.message}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-obsidian-400 leading-relaxed font-sans">
                    {issue.explanation || issue.recommendation || issue.message}
                  </p>

                  {/* Fix Box */}
                  {issue.fix && (
                    <div className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs space-y-2 border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified SHA-256 Patch
                        </span>
                        {issue.fix.patchSha256 && (
                          <span className="text-[10px] font-mono text-slate-500">
                            {issue.fix.patchSha256.slice(0, 12)}...
                          </span>
                        )}
                      </div>
                      <pre className="text-emerald-400 bg-black/40 p-2 rounded text-[11px] overflow-x-auto">
                        {issue.fix.replacement}
                      </pre>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-obsidian-850">
                    {issue.fix && onApplyFix && (
                      <button
                        type="button"
                        onClick={() => onApplyFix(issue)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Apply Verified Fix
                      </button>
                    )}
                    {onSelectIssue && (
                      <button
                        type="button"
                        onClick={() => onSelectIssue(issue.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-obsidian-800 hover:bg-slate-50 dark:hover:bg-obsidian-800 text-slate-700 dark:text-obsidian-200 font-semibold text-xs transition-colors flex items-center gap-1"
                      >
                        Inspect Line <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
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

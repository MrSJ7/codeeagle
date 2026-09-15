import React from 'react';
import {
  GitBranch,
  ArrowRight,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Shield,
  Layers,
  Database,
  Send,
  Cpu,
} from 'lucide-react';
import { Button } from './ui/Button.jsx';

export function ArchitectureFlow({
  code = '',
  issues = [],
  filename = 'auth.js',
  onSelectIssue,
  onNavigateFindings,
  className = '',
}) {
  // Infer execution flow based on file type and patterns in code
  const inferFlow = () => {
    const isReact = filename.endsWith('.jsx') || code.includes('useState') || code.includes('useEffect');
    const isAlgo = filename.includes('Fee') || filename.includes('shipping') || code.includes('calculate');

    if (isReact) {
      return [
        {
          id: 'mount',
          title: '1. Component Mount',
          subtitle: 'Initial render & props intake',
          category: 'LIFECYCLE',
          icon: <Layers className="w-4 h-4 text-blue-600" />,
          matchedIssue: issues.find((i) => i.title.toLowerCase().includes('mount') || i.line <= 10) || null,
          lines: '1-8',
        },
        {
          id: 'state',
          title: '2. State Initialization',
          subtitle: 'React state & hook bindings',
          category: 'STATE',
          icon: <Cpu className="w-4 h-4 text-teal-600" />,
          matchedIssue: issues.find((i) => i.title.toLowerCase().includes('state')) || null,
          lines: '9-14',
        },
        {
          id: 'effect',
          title: '3. Side Effect Synchronization',
          subtitle: 'Data fetching & async subscriptions',
          category: 'EFFECT',
          icon: <GitBranch className="w-4 h-4 text-amber-600" />,
          matchedIssue: issues.find((i) => i.title.toLowerCase().includes('hook') || i.title.toLowerCase().includes('effect')) || null,
          lines: '15-22',
        },
        {
          id: 'render',
          title: '4. Virtual DOM Output',
          subtitle: 'Template mapping & event handlers',
          category: 'RENDER',
          icon: <Send className="w-4 h-4 text-brand-600" />,
          matchedIssue: issues.find((i) => i.title.toLowerCase().includes('key') || i.line > 22) || null,
          lines: '23-35',
        },
      ];
    }

    if (isAlgo) {
      return [
        {
          id: 'input',
          title: '1. Parameter Intake',
          subtitle: 'Argument validation & type normalization',
          category: 'INPUT',
          icon: <FileCode className="w-4 h-4 text-blue-600" />,
          matchedIssue: issues.find((i) => i.line <= 10) || null,
          lines: '1-6',
        },
        {
          id: 'branching',
          title: '2. Decision Tree & Bounds',
          subtitle: 'Nested conditional logic & tier checks',
          category: 'COMPLEXITY',
          icon: <GitBranch className="w-4 h-4 text-amber-600" />,
          matchedIssue: issues.find((i) => i.title.toLowerCase().includes('complexity') || i.title.toLowerCase().includes('nest')) || null,
          lines: '7-20',
        },
        {
          id: 'computation',
          title: '3. Fee Calculation',
          subtitle: 'Distance multiplier & surcharge formula',
          category: 'LOGIC',
          icon: <Cpu className="w-4 h-4 text-teal-600" />,
          matchedIssue: issues.find((i) => i.line > 20) || null,
          lines: '21-30',
        },
        {
          id: 'return',
          title: '4. Return Payload',
          subtitle: 'Sanitized result value',
          category: 'OUTPUT',
          icon: <Send className="w-4 h-4 text-brand-600" />,
          matchedIssue: null,
          lines: '31-34',
        },
      ];
    }

    // Default: Express / Node.js Authentication & Controller Flow
    return [
      {
        id: 'req',
        title: '1. Inbound Request',
        subtitle: 'Express route handler invocation',
        category: 'INGRESS',
        icon: <Send className="w-4 h-4 text-blue-600" />,
        matchedIssue: null,
        lines: '1-5',
      },
      {
        id: 'auth-config',
        title: '2. Secret & Session Config',
        subtitle: 'Cryptographic key resolution',
        category: 'SECURITY',
        icon: <Shield className="w-4 h-4 text-red-600" />,
        matchedIssue: issues.find((i) => i.title.toLowerCase().includes('secret') || i.line === 6) || null,
        lines: '6-7',
      },
      {
        id: 'payload-validation',
        title: '3. Controller Body Handler',
        subtitle: 'Extract credentials & prepare query',
        category: 'CONTROLLER',
        icon: <Cpu className="w-4 h-4 text-teal-600" />,
        matchedIssue: issues.find((i) => i.line > 7 && i.line < 11) || null,
        lines: '8-10',
      },
      {
        id: 'db-query',
        title: '4. Persistence Query',
        subtitle: 'Database read / write execution',
        category: 'DATA LAYER',
        icon: <Database className="w-4 h-4 text-amber-600" />,
        matchedIssue: issues.find((i) => i.title.toLowerCase().includes('sql') || i.line >= 11) || null,
        lines: '11-14',
      },
      {
        id: 'response',
        title: '5. Signed Token Response',
        subtitle: 'Client response dispatch',
        category: 'EGRESS',
        icon: <CheckCircle2 className="w-4 h-4 text-brand-600" />,
        matchedIssue: null,
        lines: '15-18',
      },
    ];
  };

  const steps = inferFlow();

  return (
    <div className={`h-full overflow-y-auto bg-slate-50 p-6 sm:p-10 font-sans select-none ${className}`}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between gap-4 mb-1">
            <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
              Inferred Execution Architecture
            </h2>
            <span className="text-xs font-mono text-slate-500">
              {filename}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inferred control flow mapped from source code. Red nodes denote where detected vulnerabilities break the execution chain.
          </p>
        </div>

        {/* Step Flow Nodes */}
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const hasFlaw = Boolean(step.matchedIssue);
            const issue = step.matchedIssue;

            return (
              <React.Fragment key={step.id}>
                {/* Flow Node Card */}
                <div
                  onClick={() => {
                    if (issue && onSelectIssue) onSelectIssue(issue.id);
                    if (issue && onNavigateFindings) onNavigateFindings();
                  }}
                  className={`p-4 rounded-xl border transition-all duration-150 shadow-dev-sm ${
                    hasFlaw
                      ? 'bg-red-50/70 border-red-300 hover:bg-red-50 cursor-pointer'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          hasFlaw
                            ? 'bg-red-100 border-red-200 text-red-600'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {step.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {step.title}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {step.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            lines {step.lines}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 font-sans">
                          {step.subtitle}
                        </div>

                        {/* Issue Callout if node is implicated */}
                        {hasFlaw && (
                          <div className="mt-2.5 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-red-200 text-red-700 text-xs font-mono shadow-dev-sm">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span className="font-bold">{issue.severity}:</span>
                            <span className="truncate">{issue.title}</span>
                            <span className="text-red-700 font-bold underline ml-1">
                              View finding →
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 font-mono text-[11px]">
                      {hasFlaw ? (
                        <span className="text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded border border-red-200">
                          Flagged
                        </span>
                      ) : (
                        <span className="text-brand-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Pass
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connecting Arrow */}
                {idx < steps.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Footnote guidance */}
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 font-sans flex items-center justify-between gap-4 shadow-dev-sm">
          <span>Click on any flagged node to jump directly to its code context and verified fix.</span>
          {onNavigateFindings && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onNavigateFindings}
              rightIcon={<ArrowRight className="w-3 h-3" />}
            >
              Go to Findings
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import {
  ArrowRight,
  Braces,
  Check,
  ChevronRight,
  FileCode2,
  GitCompareArrows,
  LockKeyhole,
  SearchCheck,
  ShieldAlert,
} from 'lucide-react';
import { Navbar } from './Navbar.jsx';
import { CodeEagleLogo } from './CodeEagleLogo.jsx';
import { useTheme } from '@/context/ThemeContext.jsx';

const examples = [
  { id: 'insecure-login', file: 'auth.js', label: 'Exposed secret', severity: 'Critical' },
  { id: 'buggy-react', file: 'ActivityFeed.jsx', label: 'React key', severity: 'Low' },
  { id: 'complex-function', file: 'shippingFee.js', label: 'Logic edge case', severity: 'Review' },
];

const steps = [
  {
    number: '01',
    icon: SearchCheck,
    title: 'Findings grounded in code',
    description: 'AST checks point to the relevant line and explain the evidence. AI analysis is available when configured.',
  },
  {
    number: '02',
    icon: ShieldAlert,
    title: 'A useful next step',
    description: 'Read the risk and remediation in context. Sensitive fixes, such as exposed credentials, call for human action.',
  },
  {
    number: '03',
    icon: GitCompareArrows,
    title: 'Preview before editing',
    description: 'Suggested edits are checked against the current source, shown as a diff, and reviewed again after application.',
  },
];

function PreviewFinding({ number, title, location, tone }) {
  return (
    <div className="flex items-start gap-3 border-t border-[#292826] px-4 py-3.5 sm:px-5">
      <span className="font-mono text-[11px] text-[#8D8881] pt-0.5">{number}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-[#F4F0E9]">{title}</span>
        <span className="mt-1 block font-mono text-[11px] text-[#9E9890]">{location}</span>
      </span>
      <span className={tone === 'critical'
        ? 'rounded-sm border border-red-500/30 bg-red-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-red-300'
        : 'rounded-sm border border-amber-500/30 bg-amber-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-amber-300'}>
        {tone}
      </span>
    </div>
  );
}

export function LandingPage({
  onStartReviewing,
  onOpenProjectImport,
  onSelectScenarioAndStart,
  onOpenHistory,
  onOpenHowItWorks,
  historyCount = 0,
}) {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-[#F6F4F0] text-[#22201D] dark:bg-[#0B0B0A] dark:text-[#F4F0E9]">
      <Navbar
        variant="marketing"
        mode="landing"
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateReview={onStartReviewing}
        onOpenProjectImport={onOpenProjectImport}
        onToggleHistory={onOpenHistory}
        onOpenHowItWorks={onOpenHowItWorks}
        historyCount={historyCount}
      />

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(430px,0.93fr)] lg:items-center lg:gap-16 lg:pb-28 lg:pt-24">
          <div>
            <div className="mb-8 flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A6501A] dark:text-[#FF9B59]">
              <span className="h-px w-8 bg-current" />
              Code review with evidence
            </div>
            <h1 className="max-w-3xl text-[clamp(3.1rem,6vw,6.5rem)] font-semibold leading-[0.99] tracking-[-0.065em]">
              Find the issue.
              <br />
              <span className="text-[#9A938B] dark:text-[#827C73]">See the reason.</span>
              <br />
              Fix with care.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-[#5F5A53] dark:text-[#B7B0A6] sm:text-lg">
              Review a file or project for security, React, and code quality issues. Get line-specific evidence, a clear next step, and a preview before any suggested edit.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {onOpenProjectImport && (
                <button
                  type="button"
                  onClick={onOpenProjectImport}
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#F18742] px-6 text-sm font-semibold text-[#211207] shadow-[0_6px_20px_rgba(241,135,66,0.19)] transition-colors hover:bg-[#FFA365] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F18742]"
                >
                  Review a project <ArrowRight size={17} aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={onStartReviewing}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-[#CEC8BE] bg-white px-6 text-sm font-semibold text-[#25211D] transition-colors hover:border-[#9C8F81] dark:border-[#35312D] dark:bg-[#181715] dark:text-[#F4F0E9] dark:hover:border-[#6B5C4E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F18742]"
              >
                Paste a single file <FileCode2 size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#D8D2C9] pt-5 font-mono text-[11px] uppercase tracking-wide text-[#777067] dark:border-[#2B2926] dark:text-[#A39C93]">
              <span className="flex items-center gap-2"><Check size={14} className="text-[#A6501A] dark:text-[#F18742]" /> JavaScript, JSX & TypeScript</span>
              <span className="flex items-center gap-2"><Check size={14} className="text-[#A6501A] dark:text-[#F18742]" /> Static checks work without AI</span>
            </div>
          </div>

          <div id="workbench" className="relative scroll-mt-20">
            <div className="absolute -left-4 -top-4 hidden h-24 w-24 border-l border-t border-[#F18742]/60 lg:block" />
            <div className="overflow-hidden rounded-xl border border-[#38332D] bg-[#141311] shadow-[0_28px_70px_rgba(0,0,0,0.22)]">
              <div className="flex items-center justify-between border-b border-[#302C28] px-4 py-3.5 sm:px-5">
                <div className="flex items-center gap-2 font-mono text-xs text-[#E5DDD1]">
                  <Braces size={15} className="text-[#F18742]" aria-hidden="true" />
                  auth.js
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#A39C93]">Example report</span>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-5 px-4 py-6 sm:px-5">
                <div className="grid h-20 w-20 place-items-center rounded-full border-[5px] border-[#F18742] font-mono text-2xl font-semibold text-white">50</div>
                <div className="self-center">
                  <div className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#F39A65]">Review score / 100</div>
                  <div className="mt-1 text-xl font-semibold text-[#F4F0E9]">2 findings to inspect</div>
                  <div className="mt-1 text-xs text-[#9E9890]">Security checks flagged the sample code.</div>
                </div>
              </div>
              <PreviewFinding number="01" title="Hardcoded credential" location="auth.js · line 6" tone="critical" />
              <PreviewFinding number="02" title="Dynamic SQL query" location="auth.js · line 12" tone="critical" />
              <div className="border-t border-[#302C28] bg-[#1D1A17] px-4 py-5 sm:px-5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#F39A65]">
                  <LockKeyhole size={13} aria-hidden="true" /> Recommended action
                </div>
                <p className="mt-2 text-sm leading-6 text-[#D5CEC5]">
                  Rotate the exposed credential and load the replacement from a server-side secret store. This requires more than a one-line edit.
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#777067] dark:text-[#9E9890]">Illustrative report. Open a sample below to run the actual analyzer.</p>
          </div>
        </section>

        <section className="border-y border-[#D8D2C9] bg-[#ECE8E1] py-8 dark:border-[#292724] dark:bg-[#11100F]">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:px-8 lg:flex-row lg:items-center">
            <div className="shrink-0 lg:w-48">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.17em] text-[#A6501A] dark:text-[#F18742]">Try a real review</div>
              <p className="mt-1 text-sm text-[#625D56] dark:text-[#A9A299]">Choose a sample and inspect the result.</p>
            </div>
            <div className="grid flex-1 gap-2 sm:grid-cols-3">
              {examples.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => onSelectScenarioAndStart(example.id)}
                  className="group flex min-h-16 items-center justify-between gap-3 rounded-md border border-[#D5CEC4] bg-[#F8F6F2] px-4 text-left transition-colors hover:border-[#A6501A] dark:border-[#33302B] dark:bg-[#1A1816] dark:hover:border-[#F18742] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F18742]"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-xs font-semibold text-[#29241F] dark:text-[#F1EAE1]">{example.file}</span>
                    <span className="mt-1 block text-xs text-[#6C655D] dark:text-[#AAA39A]">{example.label}</span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-[#A6501A] transition-transform group-hover:translate-x-0.5 dark:text-[#F18742]" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-2xl">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.17em] text-[#A6501A] dark:text-[#F18742]">A practical workflow</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">From finding to decision.</h2>
            <p className="mt-4 text-base leading-7 text-[#625D56] dark:text-[#AAA39A]">A score helps you prioritize. The evidence and code context help you decide what to change.</p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-[#D8D2C9] bg-[#D8D2C9] dark:border-[#302D29] dark:bg-[#302D29] md:grid-cols-3">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <article key={number} className="bg-[#F8F6F2] p-6 dark:bg-[#171614] sm:p-8">
                <div className="flex items-start justify-between">
                  <Icon size={24} className="text-[#A6501A] dark:text-[#F18742]" strokeWidth={1.7} aria-hidden="true" />
                  <span className="font-mono text-xs text-[#9D948A] dark:text-[#77716A]">{number}</span>
                </div>
                <h3 className="mt-10 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#625D56] dark:text-[#AAA39A]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="architecture" className="border-t border-[#D8D2C9] bg-[#EDE9E2] dark:border-[#292724] dark:bg-[#11100F]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:py-20">
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.17em] text-[#A6501A] dark:text-[#F18742]">Built for source review</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Inspect the finding. Keep control of the fix.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border-l-2 border-[#A6501A] pl-5 dark:border-[#F18742]">
                <h3 className="text-sm font-semibold">AST-based static checks</h3>
                <p className="mt-2 text-sm leading-6 text-[#625D56] dark:text-[#AAA39A]">Checks for secrets, injection patterns, React mistakes, and maintainability issues run without an AI key.</p>
              </div>
              <div className="border-l-2 border-[#A6501A] pl-5 dark:border-[#F18742]">
                <h3 className="text-sm font-semibold">Source-matched previews</h3>
                <p className="mt-2 text-sm leading-6 text-[#625D56] dark:text-[#AAA39A]">Suggested edits are checked against the current file before you can apply them. Run your own tests after a change.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-24">
          <div>
            <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Bring your code. Leave with a plan.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#625D56] dark:text-[#AAA39A]">Start with a single file, or import a repository when you need a wider view.</p>
          </div>
          <button
            type="button"
            onClick={onStartReviewing}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-md bg-[#F18742] px-6 text-sm font-semibold text-[#211207] transition-colors hover:bg-[#FFA365] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F18742]"
          >
            Start reviewing <ArrowRight size={17} aria-hidden="true" />
          </button>
        </section>
      </main>

      <footer className="border-t border-[#D8D2C9] bg-[#EDE9E2] px-5 py-10 text-sm dark:border-[#292724] dark:bg-[#11100F] sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CodeEagleLogo size={36} withText withSubtitle dark={isDark} />
            <p className="mt-4 max-w-sm text-xs leading-5 text-[#6C655D] dark:text-[#A59E95]">Code review findings are leads to investigate. A clean score is not proof that code is bug-free.</p>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-3 text-xs font-medium">
            <button type="button" onClick={onStartReviewing} className="hover:text-[#A6501A] dark:hover:text-[#F18742]">Review code</button>
            {onOpenHistory && <button type="button" onClick={onOpenHistory} className="hover:text-[#A6501A] dark:hover:text-[#F18742]">History{historyCount > 0 ? ' (' + historyCount + ')' : ''}</button>}
            {onOpenHowItWorks && <button type="button" onClick={onOpenHowItWorks} className="hover:text-[#A6501A] dark:hover:text-[#F18742]">How it works</button>}
            <a href="#architecture" className="hover:text-[#A6501A] dark:hover:text-[#F18742]">Architecture</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

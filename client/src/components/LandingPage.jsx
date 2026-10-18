import React from 'react';
import { ArrowRight, ArrowUpRight, Check, Code2, FileSearch, FolderGit2, GitBranch, ShieldCheck } from 'lucide-react';
import { Navbar } from './Navbar.jsx';

const samples = [
  { id: 'insecure-login', file: 'auth.js', topic: 'SQL injection + secret', count: '2 findings' },
  { id: 'buggy-react', file: 'ActivityFeed.jsx', topic: 'React lifecycle', count: '3 findings' },
  { id: 'complex-function', file: 'shippingFee.js', topic: 'Maintainability', count: 'Advisory' },
];

export function LandingPage({ onStartReviewing, onOpenProjectImport, onSelectScenarioAndStart, onOpenHistory, onOpenHowItWorks, historyCount = 0 }) {
  return <div className="ce-page">
    <Navbar variant="marketing" mode="landing" onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} onNavigateReview={onStartReviewing} onOpenProjectImport={onOpenProjectImport} onToggleHistory={onOpenHistory} onOpenHowItWorks={onOpenHowItWorks} historyCount={historyCount} />
    <main id="main-content">
      <section className="ce-grid overflow-hidden border-b ce-line">
        <div className="mx-auto grid max-w-[1440px] lg:min-h-[680px] lg:grid-cols-[.92fr_1.08fr]">
          <div className="flex flex-col justify-center px-5 py-20 sm:px-10 lg:py-24 xl:px-16">
            <p className="ce-accent mb-6 text-sm font-semibold">Review code with clearer priorities</p>
            <h1 className="max-w-[12ch] text-[clamp(3.4rem,6vw,6.75rem)] font-semibold leading-[.98] tracking-[-.075em]">See what matters in your code.</h1>
            <p className="ce-muted mt-7 max-w-[55ch] text-lg leading-8">CodeEagle checks source for concrete security and correctness risks, shows the evidence beside your code, and lets you inspect a fix before applying it.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button type="button" onClick={onOpenProjectImport} className="ce-action ce-focus ce-button px-6">Review a repository <ArrowRight size={17} /></button>
              <button type="button" onClick={onStartReviewing} className="ce-outline ce-focus ce-button px-6">Paste a file <Code2 size={17} /></button>
            </div>
            <div className="mt-11 flex flex-wrap items-center gap-x-6 gap-y-3 border-t ce-line pt-5 text-sm ce-muted">
              <span className="inline-flex items-center gap-2"><Check size={16} className="ce-accent"/> Static review works without an AI key</span>
              <span className="inline-flex items-center gap-2"><Check size={16} className="ce-accent"/> Nothing is edited without a preview</span>
            </div>
          </div>
          <div className="flex items-center justify-center border-t ce-line bg-[var(--ce-surface-2)] px-4 py-14 sm:px-8 lg:border-l lg:border-t-0 lg:py-16">
            <div className="ce-shadow w-full max-w-[650px] overflow-hidden rounded-[18px] border border-[var(--ce-code-line)] ce-code">
              <div className="flex items-center justify-between border-b border-[var(--ce-code-line)] px-5 py-4 text-sm">
                <div className="flex items-center gap-2.5"><span className="h-2 w-2 rounded-full bg-[#74d9a5]"/><span className="ce-mono">auth.js</span></div>
                <span className="ce-mono text-xs text-[#a9c2b4]">sample review</span>
              </div>
              <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 overflow-x-auto px-5 py-6 ce-mono text-[12px] leading-7 sm:text-[13px]">
                <span className="text-right text-[#789287]">11</span><span>router.post('/login', async (req, res) =&gt; {'{'}</span>
                <span className="text-right text-[#789287]">12</span><span>  const {'{'} email, password {'}'} = req.body;</span>
                <span className="text-right text-[#789287]">13</span><span className="whitespace-nowrap rounded bg-[#803d3d]/50 px-1 text-[#ffd6cc]">  db.query(`SELECT * FROM users WHERE email = '{'${email}'}'`);</span>
                <span className="text-right text-[#789287]">14</span><span>{'}'});</span>
              </div>
              <div className="border-t border-[var(--ce-code-line)] bg-[#172620] p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-[#69302c] px-2 py-1 ce-mono text-[11px] text-[#ffd6cc]">CRITICAL</span><span className="ce-mono text-[11px] text-[#a9c2b4]">SEC-SQLI · line 13</span></div>
                <h2 className="mt-4 text-xl font-semibold text-[#f1f8f1]">Request input reaches a SQL query</h2>
                <p className="mt-2 max-w-[58ch] text-sm leading-6 text-[#b6cabe]">Dynamic values can change the query structure. Bind them as parameters in the database driver.</p>
                <div className="mt-5 flex items-center justify-between border-t border-[var(--ce-code-line)] pt-4 text-sm text-[#9dd7b6]"><span>Verified edit available</span><span className="inline-flex items-center gap-1">Inspect fix <ArrowUpRight size={15}/></span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workbench" className="mx-auto max-w-[1440px] px-5 py-14 sm:px-10 xl:px-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="ce-label">Try the actual analyzer</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.05em] sm:text-4xl">Start with an example.</h2></div><p className="ce-muted max-w-md text-sm leading-6">Each example opens a real review. The report above illustrates how evidence appears.</p></div>
        <div className="mt-7 grid gap-3 lg:grid-cols-3">{samples.map((sample) => <button key={sample.id} type="button" onClick={() => onSelectScenarioAndStart(sample.id)} className="ce-panel ce-focus group flex min-h-[126px] flex-col justify-between p-5 text-left transition-colors hover:border-[var(--ce-action)] hover:bg-[var(--ce-action-soft)]"><span className="flex items-center justify-between gap-3"><span className="ce-mono text-sm font-semibold">{sample.file}</span><ArrowUpRight size={18} className="ce-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></span><span className="flex items-end justify-between gap-3"><span className="ce-muted text-sm">{sample.topic}</span><span className="ce-mono text-xs ce-accent">{sample.count}</span></span></button>)}</div>
      </section>

      <section id="how-it-works" className="border-y ce-line ce-surface"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-10 lg:grid-cols-[.75fr_1.25fr] xl:px-16"><div><p className="ce-label">A review you can act on</p><h2 className="mt-3 max-w-[13ch] text-4xl font-semibold leading-tight tracking-[-.055em] sm:text-5xl">From signal to source to fix.</h2><p className="ce-muted mt-5 max-w-[42ch] text-base leading-7">The finding is a starting point. Keep the code, evidence, and proposed change in one place while you decide.</p></div><div className="border-t ce-line">{[
        [FileSearch, '01', 'Find the relevant issue', 'Focus shows security and correctness risks first. Lower-impact suggestions stay in Advisory.'],
        [GitBranch, '02', 'Inspect the context', 'Jump to the affected line and read why it was flagged before changing code.'],
        [ShieldCheck, '03', 'Verify a suggested edit', 'Preview the diff. The app checks the source version and re-analyzes the code after an edit.'],
      ].map(([Icon, number, title, body]) => <div key={number} className="grid gap-4 border-b ce-line py-6 sm:grid-cols-[2rem_2rem_1fr] sm:items-start"><span className="ce-mono text-xs ce-muted">{number}</span><Icon size={20} className="ce-accent"/><div><h3 className="text-lg font-semibold">{title}</h3><p className="ce-muted mt-1 max-w-[60ch] text-sm leading-6">{body}</p></div></div>)}</div></div></section>

      <section id="architecture" className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 sm:px-10 lg:grid-cols-[1fr_1fr] lg:items-center xl:px-16"><div><p className="ce-label">Review scope</p><h2 className="mt-3 max-w-[16ch] text-4xl font-semibold leading-tight tracking-[-.055em] sm:text-5xl">One file or a whole repository.</h2><p className="ce-muted mt-5 max-w-[55ch] text-base leading-7">Use the editor for a quick check, or import a public GitHub repository, ZIP, or local folder to see findings across files.</p><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={onOpenProjectImport} className="ce-action ce-focus ce-button"><FolderGit2 size={17}/> Import a project</button><button type="button" onClick={onStartReviewing} className="ce-outline ce-focus ce-button">Open editor <ArrowRight size={17}/></button></div></div><div className="ce-panel p-6 sm:p-8"><div className="flex items-center gap-3 border-b ce-line pb-5"><div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--ce-action-soft)] ce-accent"><ShieldCheck size={20}/></div><div><h3 className="font-semibold">Your code stays under your control</h3><p className="ce-muted text-sm">Read first, edit deliberately.</p></div></div><div className="divide-y divide-[var(--ce-line)] text-sm"><p className="py-4">Source is parsed as text. CodeEagle does not run imported build scripts.</p><p className="py-4">Suggestions with uncertain behavior require a human decision.</p><p className="py-4">AI review appears only when the server has a configured provider.</p></div></div></section>
    </main>
    <footer className="ce-surface border-t ce-line"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-6 px-5 py-8 text-sm sm:flex-row sm:items-center sm:px-10 xl:px-16"><span className="font-bold tracking-[-.04em]">CodeEagle</span><p className="ce-muted max-w-[65ch] text-xs leading-5">Findings are leads to investigate. A clean score does not prove code is bug free.</p><button type="button" onClick={onOpenHowItWorks} className="ce-accent ce-focus text-sm font-semibold hover:underline">How it works</button></div></footer>
  </div>;
}

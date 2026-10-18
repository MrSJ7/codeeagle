import React from 'react';
import { ArrowRight, Check, CircleHelp, Code2, FolderGit2, History, Loader2, Moon, Play, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';

export function Navbar({
  mode = 'workspace', variant = null, onRunAudit, onRunReview, isAuditing = false, isReviewing = false,
  isStale = false, onToggleHistory, isHistoryOpen = false, historyCount = null,
  onNavigateHome, onNavigateReview, onOpenProjectImport, onOpenHowItWorks,
  filename = 'auth.js', language = 'JavaScript', lineCount = null, filesCount = null,
  issueCount = null, reviewStatus = 'IDLE', score = null, activeLens = 'overview', onSelectLens,
}) {
  const { isLight, toggleTheme } = useTheme();
  const marketing = variant === 'marketing' || mode === 'landing';
  const running = isAuditing || isReviewing;
  const run = onRunReview || onRunAudit;
  const project = filesCount !== null;
  const tabs = [['overview', 'Overview'], ['findings', 'Findings']];

  return <header className="relative z-30 shrink-0 ce-surface border-b ce-line">
    <div className="mx-auto flex min-h-[64px] max-w-[1600px] items-center gap-3 px-4 sm:px-6">
      <button type="button" onClick={onNavigateHome} className="ce-focus flex shrink-0 items-center gap-2.5 rounded-lg text-left" aria-label="CodeEagle home">
        <span className="ce-mark" aria-hidden="true">C<span>E</span></span>
        <span className="hidden min-[380px]:block text-[15px] font-bold tracking-[-.04em]">CodeEagle</span>
      </button>
      {!marketing && <div className="mx-1 hidden h-6 w-px bg-[var(--ce-line)] sm:block" />}
      {!marketing && <div className="hidden min-w-0 items-center gap-2 sm:flex">
        <Code2 size={15} className="ce-muted shrink-0" aria-hidden="true" />
        <span className="max-w-[15rem] truncate ce-mono text-xs font-medium" title={filename}>{filename}</span>
        <span className="hidden text-xs ce-muted xl:inline">{filesCount ? `${filesCount} files` : `${lineCount || 0} lines`}</span>
      </div>}
      <div className="min-w-0 flex-1" />
      {marketing && <nav aria-label="Product" className="hidden items-center gap-1 md:flex">
        <a href="#how-it-works" className="ce-ghost ce-focus rounded-md px-3 py-2 text-sm font-medium">How it works</a>
        <a href="#architecture" className="ce-ghost ce-focus rounded-md px-3 py-2 text-sm font-medium">The workflow</a>
      </nav>}
      {typeof score === 'number' && !marketing && <span className="ce-chip hidden rounded-md px-2.5 py-1.5 ce-mono text-xs lg:inline-flex">Score {score}/100</span>}
      {!marketing && reviewStatus === 'SUCCESS' && <span className="ce-accent hidden items-center gap-1 text-xs font-semibold lg:inline-flex"><Check size={14} /> Reviewed</span>}
      {onOpenProjectImport && <button type="button" onClick={onOpenProjectImport} className="ce-outline ce-focus inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold sm:px-3.5" aria-label="Import a project"><FolderGit2 size={17} /><span className="hidden sm:inline">Projects</span></button>}
      {marketing && <button type="button" onClick={onNavigateReview} className="ce-action ce-focus ce-button hidden sm:inline-flex">Review code <ArrowRight size={16}/></button>}
      {!marketing && <button type="button" onClick={run} disabled={running} className="ce-action ce-focus ce-button shrink-0 px-3 sm:px-4" aria-label={isStale ? 'Re-run code review' : 'Run code review'}>{running ? <Loader2 size={16} className="animate-spin" /> : <Play size={15} fill="currentColor" />}<span className="hidden min-[430px]:inline">{running ? 'Reviewing' : isStale ? 'Re-run review' : 'Run review'}</span></button>}
      <button type="button" onClick={onToggleHistory} className="ce-ghost ce-focus relative grid min-h-11 min-w-11 place-items-center rounded-lg" aria-label={isHistoryOpen ? 'Close review history' : 'Open review history'}><History size={18}/>{historyCount > 0 && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--ce-action)]" />}</button>
      <button type="button" onClick={toggleTheme} className="ce-ghost ce-focus grid min-h-11 min-w-11 place-items-center rounded-lg" aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}>{isLight ? <Moon size={18}/> : <Sun size={18}/>}</button>
      {onOpenHowItWorks && !marketing && <button type="button" onClick={onOpenHowItWorks} className="ce-ghost ce-focus hidden min-h-11 min-w-11 place-items-center rounded-lg lg:grid" aria-label="How CodeEagle works"><CircleHelp size={18}/></button>}
    </div>
    {!marketing && onSelectLens && <nav aria-label="Review views" className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto border-t ce-line px-3 sm:px-5">
      {tabs.map(([id,label]) => <button key={id} type="button" onClick={() => onSelectLens(id)} aria-current={activeLens === id ? 'page' : undefined} className="ce-tab ce-focus shrink-0">{label}{id === 'findings' && issueCount > 0 ? <span className="ml-2 ce-mono text-[11px] opacity-70">{issueCount}</span> : null}</button>)}
      {!marketing && <span className="ml-auto hidden whitespace-nowrap text-xs ce-muted sm:block">{project ? 'Project review' : language} {isStale ? '· changed since review' : ''}</span>}
    </nav>}
  </header>;
}

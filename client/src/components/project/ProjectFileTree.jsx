import React, { useState, useMemo, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Search,
  X,
  FileCode
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { cn } from "@/lib/utils";

function getFileBadge(filename = "") {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
      return { label: "TS", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
    case "tsx":
      return { label: "TSX", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" };
    case "js":
    case "mjs":
    case "cjs":
      return { label: "JS", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    case "jsx":
      return { label: "JSX", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" };
    case "json":
      return { label: "JSON", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
    case "css":
    case "scss":
      return { label: "CSS", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" };
    default:
      return { label: ext?.toUpperCase() || "FILE", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" };
  }
}

/**
 * Transforms flat array of project files into hierarchical directory structure.
 */
function buildTreeStructure(files = [], searchQuery = "", onlyIssues = false) {
  const query = searchQuery.trim().toLowerCase();

  const filteredFiles = files.filter((f) => {
    // Exclude any dot-directory files (e.g. .agents, .claude, .cursor, .github)
    const parts = (f.path || "").split("/");
    for (let i = 0; i < parts.length - 1; i++) {
      if (parts[i].startsWith(".") && parts[i] !== "." && parts[i] !== "..") {
        return false;
      }
    }
    if (onlyIssues && (f.findingCount || 0) === 0) return false;
    if (!query) return true;
    return (f.path || "").toLowerCase().includes(query) || (f.filename || "").toLowerCase().includes(query);
  });

  const root = { name: "root", isDirectory: true, children: {}, files: [], totalIssues: 0 };

  for (const file of filteredFiles) {
    const parts = (file.path || "").split("/");
    let current = root;
    current.totalIssues += (file.findingCount || 0);

    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      if (!current.children[folderName]) {
        current.children[folderName] = {
          name: folderName,
          path: parts.slice(0, i + 1).join("/"),
          isDirectory: true,
          children: {},
          files: [],
          totalIssues: 0,
        };
      }
      current = current.children[folderName];
      current.totalIssues += (file.findingCount || 0);
    }

    current.files.push(file);
  }

  return root;
}

/**
 * Recursive Tree Node Component for Directories and Files.
 */
function TreeNode({ node, activeFileId, onSelectFile, depth = 0, forceOpen = false }) {
  const { isLight } = useTheme();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  if (node.isDirectory) {
    const childFolders = Object.values(node.children);
    const hasChildren = childFolders.length > 0 || node.files.length > 0;

    return (
      <div className="select-none">
        {node.name !== "root" && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{ paddingLeft: `${depth * 10 + 6}px` }}
            className={cn(
              "w-full flex items-center justify-between gap-1.5 py-1.5 pr-2 text-xs font-medium rounded-md transition-colors cursor-pointer text-left group",
              isLight
                ? "hover:bg-slate-100 text-slate-700"
                : "hover:bg-[#161616] text-obsidian-300"
            )}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {hasChildren && (
                isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0 group-hover:opacity-80" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0 group-hover:opacity-80" />
                )
              )}
              {isOpen ? (
                <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
              )}
              <span className="truncate font-sans font-medium text-xs text-foreground/90">{node.name}</span>
            </div>

            {node.totalIssues > 0 && (
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold shrink-0",
                isLight ? "bg-amber-100 text-amber-800" : "bg-brand-500/20 text-brand-400"
              )}>
                {node.totalIssues}
              </span>
            )}
          </button>
        )}

        {isOpen && (
          <div className={cn(
            node.name !== "root" && "ml-2.5 pl-1.5 border-l",
            isLight ? "border-slate-200/80" : "border-[#222222]"
          )}>
            {childFolders.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                activeFileId={activeFileId}
                onSelectFile={onSelectFile}
                depth={node.name === "root" ? depth : depth + 1}
                forceOpen={forceOpen}
              />
            ))}

            {node.files.map((file) => {
              const isActive = activeFileId === file.id || activeFileId === file.path;
              const hasIssues = (file.findingCount || 0) > 0;
              const isSkipped = file.status === "SKIPPED";
              const badge = getFileBadge(file.filename || file.path);

              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => !isSkipped && onSelectFile(file)}
                  style={{ paddingLeft: `${(node.name === "root" ? depth : 0) * 10 + 6}px` }}
                  className={cn(
                    "w-full flex items-center justify-between gap-1.5 py-1.5 pr-2 my-0.5 text-xs rounded-md transition-all font-mono cursor-pointer text-left",
                    isActive
                      ? isLight
                        ? "bg-blue-50 text-blue-700 font-bold shadow-xs ring-1 ring-blue-500/30"
                        : "bg-brand-500/15 text-brand-300 font-bold ring-1 ring-brand-500/40"
                      : isSkipped
                      ? "opacity-45 cursor-default text-muted-foreground"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      : "text-obsidian-400 hover:text-obsidian-100 hover:bg-[#141414]"
                  )}
                  title={isSkipped ? `Skipped: ${file.skipMessage || "Excluded file"}` : file.path}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn(
                      "px-1 py-0.2 rounded text-[9px] font-mono font-bold border shrink-0 leading-none",
                      badge.color
                    )}>
                      {badge.label}
                    </span>
                    <span className="truncate text-[12px]">{file.filename || file.path.split("/").pop()}</span>
                  </div>

                  {hasIssues ? (
                    <span className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono shrink-0",
                      file.severityCounts?.critical > 0
                        ? "bg-red-500/20 text-red-500"
                        : file.severityCounts?.high > 0
                        ? "bg-brand-500/20 text-brand-500"
                        : "bg-amber-500/20 text-amber-500"
                    )}>
                      {file.findingCount}
                    </span>
                  ) : isSkipped ? (
                    <span className="text-[9px] text-muted-foreground font-sans uppercase">
                      {file.skipReason === "CONFIG_FILE" ? "cfg" : file.skipReason === "DECLARATION_FILE" ? "d.ts" : "skip"}
                    </span>
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
}

/**
 * Project File Tree Sidebar Explorer.
 */
export function ProjectFileTree({ files = [], activeFileId, onSelectFile, className = "" }) {
  const { isLight } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyIssues, setOnlyIssues] = useState(false);

  const cleanFiles = useMemo(() => {
    return files.filter((f) => {
      const parts = (f.path || "").split("/");
      for (let i = 0; i < parts.length - 1; i++) {
        if (parts[i].startsWith(".") && parts[i] !== "." && parts[i] !== "..") {
          return false;
        }
      }
      return true;
    });
  }, [files]);

  const codeFilesCount = useMemo(() => {
    return cleanFiles.filter((f) => f.status !== "SKIPPED").length;
  }, [cleanFiles]);

  const filesWithIssuesCount = useMemo(() => {
    return cleanFiles.filter((f) => (f.findingCount || 0) > 0).length;
  }, [cleanFiles]);

  const tree = useMemo(() => {
    return buildTreeStructure(cleanFiles, searchQuery, onlyIssues);
  }, [cleanFiles, searchQuery, onlyIssues]);

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className={cn("flex flex-col h-full overflow-hidden select-none", className)}>
      {/* Explorer Header */}
      <div className={cn(
        "p-2.5 border-b flex flex-col gap-2 shrink-0",
        isLight ? "border-slate-200 bg-slate-50/70" : "border-[#222222] bg-[#0E0E0E]"
      )}>
        <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase">
          <span className={isLight ? "text-slate-700" : "text-obsidian-200"}>Explorer</span>
          <span className="font-mono text-[11px] font-normal text-muted-foreground">
            {codeFilesCount} {codeFilesCount === 1 ? "code file" : "code files"}
          </span>
        </div>

        {/* Quick Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-8 pr-7 py-1 rounded-md text-xs font-mono outline-none border transition-all",
              isLight
                ? "bg-white border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                : "bg-[#141414] border-[#262626] focus:border-brand-500 text-obsidian-100 placeholder:text-obsidian-500"
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Issue Filter Pill */}
        {filesWithIssuesCount > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => setOnlyIssues(!onlyIssues)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer",
                onlyIssues
                  ? isLight
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-brand-500 text-black font-bold"
                  : isLight
                  ? "bg-slate-200/80 hover:bg-slate-200 text-slate-700"
                  : "bg-[#1C1C1C] hover:bg-[#252525] text-obsidian-300"
              )}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Issues only ({filesWithIssuesCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <TreeNode
          node={tree}
          activeFileId={activeFileId}
          onSelectFile={onSelectFile}
          depth={0}
          forceOpen={hasSearch || onlyIssues}
        />
      </div>
    </div>
  );
}

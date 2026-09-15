import React, { useState, useMemo } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { cn } from "@/lib/utils";

/**
 * Transforms flat array of project files into hierarchical directory structure.
 */
function buildTreeStructure(files = []) {
  const root = { name: "root", isDirectory: true, children: {}, files: [] };

  for (const file of files) {
    const parts = (file.path || "").split("/");
    let current = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      if (!current.children[folderName]) {
        current.children[folderName] = {
          name: folderName,
          path: parts.slice(0, i + 1).join("/"),
          isDirectory: true,
          children: {},
          files: [],
        };
      }
      current = current.children[folderName];
    }

    current.files.push(file);
  }

  return root;
}

/**
 * Recursive Tree Node Component for Directories and Files.
 */
function TreeNode({ node, activeFileId, onSelectFile, depth = 0 }) {
  const { isLight } = useTheme();
  const [isOpen, setIsOpen] = useState(true);

  if (node.isDirectory) {
    const childFolders = Object.values(node.children);
    const hasChildren = childFolders.length > 0 || node.files.length > 0;

    return (
      <div className="select-none">
        {node.name !== "root" && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            className={cn(
              "w-full flex items-center gap-1.5 py-1 pr-2 text-xs font-medium rounded-md transition-colors cursor-pointer text-left",
              isLight
                ? "hover:bg-slate-100 text-slate-700"
                : "hover:bg-[#181818] text-obsidian-300"
            )}
          >
            {hasChildren && (
              isOpen ? <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
            )}
            {isOpen ? <FolderOpen className="w-3.5 h-3.5 text-brand-500 shrink-0" /> : <Folder className="w-3.5 h-3.5 text-brand-500 shrink-0" />}
            <span className="truncate">{node.name}</span>
          </button>
        )}

        {isOpen && (
          <div className="space-y-0.5">
            {childFolders.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                activeFileId={activeFileId}
                onSelectFile={onSelectFile}
                depth={node.name === "root" ? depth : depth + 1}
              />
            ))}

            {node.files.map((file) => {
              const isActive = activeFileId === file.id || activeFileId === file.path;
              const hasIssues = (file.findingCount || 0) > 0;
              const isSkipped = file.status === "SKIPPED";

              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => !isSkipped && onSelectFile(file)}
                  style={{ paddingLeft: `${(node.name === "root" ? depth : depth + 1) * 12 + 8}px` }}
                  className={cn(
                    "w-full flex items-center justify-between gap-1.5 py-1 pr-2 text-xs rounded-md transition-colors font-mono cursor-pointer text-left",
                    isActive
                      ? isLight
                        ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600 shadow-xs"
                        : "bg-brand-500/15 text-brand-400 font-bold border-l-2 border-brand-500"
                      : isSkipped
                      ? "opacity-50 cursor-default text-muted-foreground"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      : "text-obsidian-400 hover:text-obsidian-100 hover:bg-[#161616]"
                  )}
                  title={isSkipped ? `Skipped: ${file.skipMessage || "Unsupported file"}` : file.path}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileCode className={cn(
                      "w-3.5 h-3.5 shrink-0",
                      isActive ? (isLight ? "text-blue-600" : "text-brand-500") : "text-muted-foreground"
                    )} />
                    <span className="truncate">{file.filename || file.path.split("/").pop()}</span>
                  </div>

                  {hasIssues ? (
                    <span className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0",
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
                      skip
                    </span>
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
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
  const tree = useMemo(() => buildTreeStructure(files), [files]);

  return (
    <div className={cn("flex flex-col h-full overflow-hidden select-none", className)}>
      <div className={cn(
        "px-3 py-2 border-b flex items-center justify-between text-xs font-bold tracking-wider uppercase",
        isLight ? "border-slate-200 text-slate-500 bg-slate-50/50" : "border-[#222222] text-obsidian-400 bg-[#121212]/50"
      )}>
        <span>Project Files</span>
        <span className="font-mono text-[10px] font-normal">{files.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <TreeNode
          node={tree}
          activeFileId={activeFileId}
          onSelectFile={onSelectFile}
          depth={0}
        />
      </div>
    </div>
  );
}

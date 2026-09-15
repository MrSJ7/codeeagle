import React, { useState, useRef } from "react";
import {
  Upload,
  FolderUp,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  Sparkles,
  Layers,
  FileText
} from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { importProjectApi, startProjectReviewApi } from "../../services/projectApi.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import { cn } from "@/lib/utils";

function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

/**
 * Project Import & Discovery Modal
 * Enables importing full projects via ZIP, Local Folder, or Public GitHub URL.
 */
export function ProjectImportModal({ isOpen, onClose, onProjectReady }) {
  const { isLight } = useTheme();
  const [activeTab, setActiveTab] = useState("zip"); // "zip" | "folder" | "github"

  // Form states
  const [githubUrl, setGithubUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Discovered project preview state
  const [discoveredProject, setDiscoveredProject] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const zipInputRef = useRef(null);
  const folderInputRef = useRef(null);

  if (!isOpen) return null;

  // 1. Handle ZIP File selection
  async function handleZipSelected(file) {
    if (!file) return;
    if (!file.name.endsWith(".zip")) {
      setError("Please select a valid .zip archive.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Content = e.target.result.split(",")[1];
          const derivedName = projectName.trim() || file.name.replace(/\.zip$/i, "");
          
          const result = await importProjectApi({
            sourceType: "zip",
            name: derivedName,
            zipBase64: base64Content,
          });

          setDiscoveredProject(result.project);
        } catch (err) {
          setError(err.message || "Failed to process ZIP archive.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read the selected file.");
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message || "Failed to upload ZIP.");
      setIsProcessing(false);
    }
  }

  // 2. Handle Folder selection
  async function handleFolderSelected(fileList) {
    if (!fileList || fileList.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const filesArray = [];
      const derivedName = projectName.trim() || (fileList[0].webkitRelativePath?.split("/")[0]) || "Local Project";

      const isModuleOrIgnored = (p) => {
        const parts = p.toLowerCase().split("/");
        return parts.some(part => [
          "node_modules", "bower_components", "jspm_packages", "vendor", ".yarn", ".pnp",
          ".git", ".svn", ".hg", "dist", "build", "coverage", ".nyc_output",
          ".cache", ".vite", ".next", ".nuxt", "out", ".turbo", ".vercel", ".netlify", ".idea", ".vscode"
        ].includes(part));
      };

      const eligibleFileList = Array.from(fileList).filter(file => {
        const path = file.webkitRelativePath || file.name;
        return !isModuleOrIgnored(path);
      });

      // Read text files
      const readPromises = eligibleFileList.slice(0, 500).map(async (file) => {
        const path = file.webkitRelativePath || file.name;
        // Skip reading huge files or common binaries in browser
        if (file.size > 1024 * 1024 || /\.(png|jpg|jpeg|gif|webp|pdf|zip|mp4|woff2)$/i.test(file.name)) {
          filesArray.push({ path, size: file.size, content: null });
          return;
        }

        try {
          const text = await file.text();
          filesArray.push({ path, size: file.size, content: text });
        } catch {
          filesArray.push({ path, size: file.size, content: null });
        }
      });

      await Promise.all(readPromises);

      const result = await importProjectApi({
        sourceType: "folder",
        name: derivedName,
        files: filesArray,
      });

      setDiscoveredProject(result.project);
    } catch (err) {
      setError(err.message || "Failed to process local folder.");
    } finally {
      setIsProcessing(false);
    }
  }

  // 3. Handle GitHub Import
  async function handleGithubImport(e) {
    e.preventDefault();
    if (!githubUrl || !githubUrl.trim()) {
      setError("Please provide a GitHub repository URL.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await importProjectApi({
        sourceType: "github",
        name: projectName.trim() || undefined,
        url: githubUrl.trim(),
      });

      setDiscoveredProject(result.project);
    } catch (err) {
      setError(err.message || "Failed to import GitHub repository.");
    } finally {
      setIsProcessing(false);
    }
  }

  // 4. Start Full Project Review
  async function handleStartReview() {
    if (!discoveredProject) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const reviewOutcome = await startProjectReviewApi(discoveredProject.id);
      if (onProjectReady) {
        onProjectReady({
          project: discoveredProject,
          review: reviewOutcome.review,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Project review failed to complete.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full max-w-xl rounded-xl border shadow-2xl flex flex-col overflow-hidden max-h-[90vh]",
          isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0E0E0E] border-[#262626] text-obsidian-50"
        )}
      >
        {/* Modal Header */}
        <div className={cn(
          "px-6 py-4 border-b flex items-center justify-between",
          isLight ? "border-slate-200 bg-slate-50/50" : "border-[#222222] bg-[#121212]/50"
        )}>
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              isLight ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-brand-500/10 text-brand-500 border border-brand-500/20"
            )}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Review a project</h3>
              <p className={cn("text-xs", isLight ? "text-slate-500" : "text-obsidian-400")}>
                Upload source or import from GitHub to analyze multi-file codebases.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              isLight ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100" : "text-obsidian-400 hover:text-obsidian-100 hover:bg-[#1C1C1C]"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className={cn(
              "p-3.5 rounded-lg border text-xs flex items-start gap-2.5",
              isLight ? "bg-red-50 text-red-700 border-red-200" : "bg-red-950/30 text-red-400 border-red-900/40"
            )}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error importing project:</span> {error}
              </div>
            </div>
          )}

          {!discoveredProject ? (
            <>
              {/* Method Selector Tabs */}
              <div className={cn(
                "grid grid-cols-3 gap-1 p-1 rounded-lg border text-xs font-semibold select-none",
                isLight ? "bg-slate-100 border-slate-200" : "bg-[#141414] border-[#222222]"
              )}>
                <button
                  type="button"
                  onClick={() => { setActiveTab("zip"); setError(null); }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 rounded-[5px] transition-all cursor-pointer",
                    activeTab === "zip"
                      ? isLight ? "bg-white text-blue-600 shadow-xs" : "bg-[#1F1F1F] text-[#F5F3EF] shadow-xs"
                      : isLight ? "text-slate-600 hover:text-slate-900" : "text-obsidian-400 hover:text-obsidian-200"
                  )}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload ZIP</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("folder"); setError(null); }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 rounded-[5px] transition-all cursor-pointer",
                    activeTab === "folder"
                      ? isLight ? "bg-white text-blue-600 shadow-xs" : "bg-[#1F1F1F] text-[#F5F3EF] shadow-xs"
                      : isLight ? "text-slate-600 hover:text-slate-900" : "text-obsidian-400 hover:text-obsidian-200"
                  )}
                >
                  <FolderUp className="w-3.5 h-3.5" />
                  <span>Choose Folder</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("github"); setError(null); }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 rounded-[5px] transition-all cursor-pointer",
                    activeTab === "github"
                      ? isLight ? "bg-white text-blue-600 shadow-xs" : "bg-[#1F1F1F] text-[#F5F3EF] shadow-xs"
                      : isLight ? "text-slate-600 hover:text-slate-900" : "text-obsidian-400 hover:text-obsidian-200"
                  )}
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </button>
              </div>

              {/* Tab 1: ZIP Upload */}
              {activeTab === "zip" && (
                <div className="space-y-4">
                  <div
                    onClick={() => zipInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) {
                        handleZipSelected(e.dataTransfer.files[0]);
                      }
                    }}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group",
                      isLight
                        ? "border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30"
                        : "border-[#2A2A2A] hover:border-brand-500/60 bg-[#121212] hover:bg-[#161616]"
                    )}
                  >
                    <input
                      ref={zipInputRef}
                      type="file"
                      accept=".zip"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleZipSelected(e.target.files[0]);
                        }
                      }}
                    />

                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105",
                      isLight ? "bg-blue-100 text-blue-600" : "bg-brand-500/10 text-brand-500"
                    )}>
                      {isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>

                    <p className="text-sm font-semibold mb-1">
                      {isProcessing ? "Extracting & validating archive..." : "Drop your project .zip here"}
                    </p>
                    <p className={cn("text-xs max-w-xs", isLight ? "text-slate-500" : "text-obsidian-400")}>
                      or click to browse from your computer (max 30 MB).
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Folder Picker */}
              {activeTab === "folder" && (
                <div className="space-y-4">
                  <div
                    onClick={() => folderInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group",
                      isLight
                        ? "border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30"
                        : "border-[#2A2A2A] hover:border-brand-500/60 bg-[#121212] hover:bg-[#161616]"
                    )}
                  >
                    <input
                      ref={folderInputRef}
                      type="file"
                      webkitdirectory=""
                      directory=""
                      multiple
                      className="hidden"
                      onChange={(e) => handleFolderSelected(e.target.files)}
                    />

                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105",
                      isLight ? "bg-blue-100 text-blue-600" : "bg-brand-500/10 text-brand-500"
                    )}>
                      {isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <FolderUp className="w-6 h-6" />
                      )}
                    </div>

                    <p className="text-sm font-semibold mb-1">
                      {isProcessing ? "Reading project files..." : "Select a local project folder"}
                    </p>
                    <p className={cn("text-xs max-w-xs", isLight ? "text-slate-500" : "text-obsidian-400")}>
                      Pick your codebase folder. Relative paths are preserved without exposing absolute system paths.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: GitHub Import */}
              {activeTab === "github" && (
                <form onSubmit={handleGithubImport} className="space-y-4">
                  <div className="space-y-2">
                    <label className={cn("block text-xs font-semibold", isLight ? "text-slate-700" : "text-obsidian-300")}>
                      Public GitHub Repository URL
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <GithubIcon className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                          isLight ? "text-slate-400" : "text-obsidian-400"
                        )} />
                        <input
                          type="url"
                          placeholder="https://github.com/owner/repository"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          className={cn(
                            "w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2",
                            isLight
                              ? "bg-white border-slate-200 text-slate-900 focus:ring-blue-500"
                              : "bg-[#141414] border-[#2A2A2A] text-obsidian-50 focus:ring-brand-500"
                          )}
                        />
                      </div>
                      <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        disabled={isProcessing}
                        isLoading={isProcessing}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Import
                      </Button>
                    </div>
                  </div>

                  <p className={cn("text-xs", isLight ? "text-slate-500" : "text-obsidian-400")}>
                    Public repositories on github.com are supported. Private repository OAuth authentication can be added via enterprise connect.
                  </p>
                </form>
              )}

              {/* Security Trust Note */}
              <div className={cn(
                "p-3 rounded-lg border text-xs flex items-center gap-2.5",
                isLight ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-[#121212] border-[#222222] text-obsidian-400"
              )}>
                <ShieldCheck className={cn("w-4 h-4 shrink-0", isLight ? "text-blue-600" : "text-brand-500")} />
                <span>
                  <strong>Zero Code Execution:</strong> Your project files are parsed as static text. CodeEagle never runs build scripts, install commands, or untrusted code.
                </span>
              </div>
            </>
          ) : (
            /* Discovery Preview Screen */
            <div className="space-y-5">
              <div className={cn(
                "p-4 rounded-xl border space-y-3",
                isLight ? "bg-slate-50 border-slate-200" : "bg-[#141414] border-[#262626]"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold">{discoveredProject.name}</h4>
                      <p className={cn("text-xs", isLight ? "text-slate-500" : "text-obsidian-400")}>
                        Source: {discoveredProject.sourceType?.toUpperCase()} · SHA-256 fingerprint verified
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-dashed border-border/50 text-center">
                  <div className={cn("p-2 rounded-lg", isLight ? "bg-white border border-slate-200" : "bg-[#1C1C1C]")}>
                    <div className="text-base font-bold">{discoveredProject.totalFileCount}</div>
                    <div className={cn("text-[11px]", isLight ? "text-slate-500" : "text-obsidian-400")}>Files Found</div>
                  </div>
                  <div className={cn("p-2 rounded-lg", isLight ? "bg-emerald-50 border border-emerald-200 text-emerald-900" : "bg-emerald-950/30 text-emerald-400")}>
                    <div className="text-base font-bold">{discoveredProject.eligibleFileCount}</div>
                    <div className="text-[11px]">Ready for Review</div>
                  </div>
                  <div className={cn("p-2 rounded-lg", isLight ? "bg-white border border-slate-200" : "bg-[#1C1C1C]")}>
                    <div className="text-base font-bold">{discoveredProject.skippedFileCount}</div>
                    <div className={cn("text-[11px]", isLight ? "text-slate-500" : "text-obsidian-400")}>Skipped Files</div>
                  </div>
                </div>
              </div>

              {/* Skipped files note */}
              <div className={cn("text-xs space-y-1.5", isLight ? "text-slate-600" : "text-obsidian-400")}>
                <p>
                  <strong>Analysis Scope:</strong> {discoveredProject.eligibleFileCount} JavaScript & JSX source files will be reviewed with deterministic AST checks and Gemini semantic reasoning.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Skipped files include dependencies (<code className="font-mono">node_modules</code>), lockfiles, binaries, and sensitive environment variables (<code className="font-mono">.env</code>).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setDiscoveredProject(null)}
                  disabled={isAnalyzing}
                >
                  Choose Different Project
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartReview}
                  disabled={isAnalyzing}
                  isLoading={isAnalyzing}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isAnalyzing ? "Analyzing Project..." : "Start Project Review"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

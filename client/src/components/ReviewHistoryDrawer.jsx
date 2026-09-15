import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  History,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Database,
  RefreshCw,
  FolderArchive,
} from 'lucide-react';
import { ReviewHistoryItem } from './ReviewHistoryItem.jsx';
import { getReviewHistoryApi, deleteReviewApi } from '../services/reviewApi.js';

export function ReviewHistoryDrawer({
  isOpen,
  onClose,
  onSelectAudit,
  currentReviewId,
  hasUnsavedChanges,
  persistenceMode = 'memory',
  refreshTrigger = 0,
}) {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // In-app confirmation dialog states
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingSelectId, setPendingSelectId] = useState(null);

  const fetchHistory = useCallback(async (page = 1) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getReviewHistoryApi({ page, limit: 20 });
      setReviews(data.reviews || []);
      setPagination(
        data.pagination || { page: 1, limit: 20, total: data.reviews?.length || 0, pages: 1 }
      );
    } catch (err) {
      console.error('Failed to load review history:', err);
      setErrorMessage(err.message || 'Could not load review history.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when drawer opens or refreshTrigger updates
  useEffect(() => {
    if (isOpen) {
      fetchHistory(1);
    }
  }, [isOpen, refreshTrigger, fetchHistory]);

  // Handle Escape key to close drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages || isLoading) return;
    fetchHistory(newPage);
  };

  const handleItemClick = (reviewId) => {
    if (hasUnsavedChanges) {
      setPendingSelectId(reviewId);
    } else {
      onSelectAudit(reviewId);
    }
  };

  const confirmSelectHistoricalAudit = () => {
    if (pendingSelectId) {
      onSelectAudit(pendingSelectId);
      setPendingSelectId(null);
    }
  };

  const handleDeleteClick = (reviewId) => {
    setDeletingId(reviewId);
  };

  const confirmDeleteAudit = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      await deleteReviewApi(deletingId);

      // Optimistically update list
      const updated = reviews.filter((r) => r.reviewId !== deletingId);
      setReviews(updated);
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        pages: Math.max(1, Math.ceil((prev.total - 1) / prev.limit)),
      }));

      // If page is now empty and not on first page, fetch previous
      if (updated.length === 0 && pagination.page > 1) {
        fetchHistory(pagination.page - 1);
      }
    } catch (err) {
      console.error('Failed to delete audit:', err);
      alert(err.message || 'Could not delete this audit.');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <aside
        role="dialog"
        aria-label="Review History"
        aria-modal="true"
        className="fixed inset-y-0 right-0 w-full max-w-md bg-[#F5F7F6] border-l border-stone-200 shadow-2xl z-50 flex flex-col overflow-hidden animate-slideLeft"
      >
        {/* Drawer Header */}
        <div className="h-14 px-5 bg-white border-b border-stone-200 flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#DDF7EC] border border-[#0F9F6E]/30 flex items-center justify-center text-[#0F9F6E]">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-stone-900 uppercase tracking-wide font-mono">
                  Review History
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {pagination.total} {pagination.total === 1 ? 'review' : 'reviews'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono mt-0.5">
                <Database className="w-3 h-3 text-stone-400" />
                <span>
                  Storage: {persistenceMode === 'mongo' ? 'MongoDB Atlas' : 'In-Memory'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchHistory(pagination.page)}
              disabled={isLoading}
              title="Refresh history"
              aria-label="Refresh history"
              className="p-1.5 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              title="Close history drawer"
              aria-label="Close history drawer"
              className="p-1.5 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {/* Loading State */}
          {isLoading && (
            <div className="h-48 flex flex-col items-center justify-center text-stone-400 space-y-2 select-none">
              <Loader2 className="w-6 h-6 animate-spin text-[#0F9F6E]" />
              <span className="text-xs font-mono">Loading history...</span>
            </div>
          )}

          {/* Error State */}
          {!isLoading && errorMessage && (
            <div className="p-4 rounded bg-red-50 border border-red-200 text-center space-y-2">
              <AlertTriangle className="w-6 h-6 text-red-600 mx-auto" />
              <div className="text-xs font-semibold text-red-800">
                Could not load review history
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {errorMessage}
              </p>
              <button
                onClick={() => fetchHistory(pagination.page)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium border border-stone-300 transition-colors shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !errorMessage && reviews.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2 select-none">
              <div className="w-10 h-10 rounded bg-stone-200/80 border border-stone-300 flex items-center justify-center text-stone-500 mb-1">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-stone-800">No reviews yet</div>
              <p className="text-[11px] text-stone-500 max-w-xs leading-relaxed">
                Run a review on code in the editor to record review history.
              </p>
            </div>
          )}

          {/* Review List */}
          {!isLoading && !errorMessage && reviews.length > 0 && (
            reviews.map((rev) => (
              <ReviewHistoryItem
                key={rev.reviewId}
                review={rev}
                isSelected={rev.reviewId === currentReviewId}
                onSelect={handleItemClick}
                onDelete={handleDeleteClick}
              />
            ))
          )}
        </div>

        {/* Drawer Footer / Pagination */}
        {pagination.pages > 1 && (
          <div className="h-12 px-5 bg-white border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 font-mono select-none shrink-0">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
              aria-label="Previous page"
              className="flex items-center gap-1 px-3 py-1 rounded bg-stone-50 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed border border-stone-200 transition-colors text-stone-700 font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="text-[11px] text-stone-600 font-medium">
              Page {pagination.page} of {pagination.pages}
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || isLoading}
              aria-label="Next page"
              className="flex items-center gap-1 px-3 py-1 rounded bg-stone-50 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed border border-stone-200 transition-colors text-stone-700 font-medium"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* In-App Confirmation: Delete Audit */}
        {deletingId && (
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border border-stone-200 rounded-lg p-5 max-w-xs w-full shadow-xl text-center space-y-3">
              <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-stone-900 font-sans">Delete this review?</h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  This record will be permanently removed from history. This cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingId(null)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDeleteAudit}
                  className="px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* In-App Confirmation: Replace Unsaved Changes */}
        {pendingSelectId && (
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border border-amber-300 rounded-lg p-5 max-w-xs w-full shadow-xl text-center space-y-3">
              <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-stone-900 font-sans">Restore Historical Review?</h3>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  Current editor has modified code that has not been reviewed yet. Restoring will replace current editor contents.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingSelectId(null)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSelectHistoricalAudit}
                  className="px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-[#0F9F6E] hover:bg-[#087A54] transition-colors shadow-2xs"
                >
                  Open Review
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}


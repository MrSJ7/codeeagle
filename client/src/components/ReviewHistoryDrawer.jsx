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
import { Button } from './ui/Button.jsx';

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
      setReviews((prev) => prev.filter((r) => r.reviewId !== deletingId));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete review:', err);
      setErrorMessage(err.message || 'Failed to delete audit.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <aside
        role="dialog"
        aria-label="Review History"
        aria-modal="true"
        className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white border-l border-slate-200 z-50 flex flex-col shadow-dev-lg font-sans select-none"
      >
        {/* Drawer Header */}
        <div className="h-13 bg-slate-50 border-b border-slate-200 px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Review History
            </h2>
            {pagination.total > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold border border-slate-300">
                {pagination.total}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Persistence Indicator */}
            <div
              title={`Active storage: ${persistenceMode === 'mongodb' ? 'MongoDB Atlas persistent database' : 'In-memory ephemeral store'}`}
              className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-dev-sm"
            >
              <Database className="w-3 h-3 text-brand-600" />
              <span>{persistenceMode === 'mongodb' ? 'MongoDB' : 'Memory'}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Close history drawer"
              aria-label="Close history drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading && reviews.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600 mb-2" />
              <p className="text-xs font-medium">Loading history...</p>
            </div>
          ) : errorMessage ? (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Failed to load history</span>
              </div>
              <p>{errorMessage}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchHistory(pagination.page)}
                leftIcon={<RefreshCw className="w-3 h-3" />}
                className="self-start mt-1"
              >
                Retry
              </Button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <FolderArchive className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-800">No review audits yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                Run a code review or apply a verified fix to start building your audit history.
              </p>
            </div>
          ) : (
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

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-600 select-none">
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                aria-label="Previous page"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages || isLoading}
                leftIcon={<ChevronRight className="w-3.5 h-3.5" />}
                aria-label="Next page"
              />
            </div>
          </div>
        )}

        {/* In-app Modal Confirmation for Unsaved Changes */}
        {pendingSelectId && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-60 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-dev-lg max-w-xs text-xs space-y-3 font-sans">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Unsaved Code Changes</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Loading this historical audit will replace the current editor code. Are you sure you want to proceed?
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingSelectId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={confirmSelectHistoricalAudit}
                >
                  Restore Audit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* In-app Modal Confirmation for Audit Deletion */}
        {deletingId && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-60 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-dev-lg max-w-xs text-xs space-y-3 font-sans">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Delete Audit Record</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Permanently delete this review record from the ledger? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={confirmDeleteAudit}
                  disabled={isDeleting}
                  isLoading={isDeleting}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

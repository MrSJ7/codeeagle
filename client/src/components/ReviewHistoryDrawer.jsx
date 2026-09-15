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
        className="fixed inset-0 bg-graphite-950/80 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <aside
        role="dialog"
        aria-label="Review History"
        aria-modal="true"
        className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-graphite-950 border-l border-graphite-800 z-50 flex flex-col shadow-dev-lg font-sans select-none"
      >
        {/* Drawer Header */}
        <div className="h-12 bg-graphite-900 border-b border-graphite-800 px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-400" />
            <h2 className="text-xs font-bold text-graphite-100 uppercase tracking-wider">
              Review History
            </h2>
            {pagination.total > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-graphite-800 text-graphite-300 font-semibold border border-graphite-700">
                {pagination.total}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Persistence Indicator */}
            <div
              title={`Active storage: ${persistenceMode === 'mongodb' ? 'MongoDB Atlas persistent database' : 'In-memory ephemeral store'}`}
              className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-graphite-850 text-graphite-300 border border-graphite-750"
            >
              <Database className="w-3 h-3 text-cyan-400" />
              <span>{persistenceMode === 'mongodb' ? 'MongoDB' : 'Memory'}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-graphite-400 hover:text-graphite-100 hover:bg-graphite-800 transition-colors cursor-pointer"
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
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-graphite-500">
              <Loader2 className="w-6 h-6 animate-spin text-brand-400 mb-2" />
              <p className="text-xs font-medium">Loading history...</p>
            </div>
          ) : errorMessage ? (
            <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-red-400" />
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
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-graphite-500">
              <FolderArchive className="w-8 h-8 text-graphite-700 mb-2" />
              <p className="text-xs font-semibold text-graphite-300">No review audits yet</p>
              <p className="text-xs text-graphite-500 mt-1 max-w-[220px]">
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
          <div className="p-3 bg-graphite-900 border-t border-graphite-800 flex items-center justify-between text-xs font-mono text-graphite-400 select-none">
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

        {/* Confirmation Modal: Restore when unsaved changes exist */}
        {pendingSelectId && (
          <div
            className="absolute inset-0 bg-graphite-950/90 flex items-center justify-center p-4 z-60"
            role="alertdialog"
            aria-labelledby="confirm-restore-title"
          >
            <div className="bg-graphite-900 border border-graphite-700 rounded-lg p-4 shadow-dev-lg max-w-xs text-xs">
              <h3 id="confirm-restore-title" className="font-bold text-graphite-100 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span>Discard current edits?</span>
              </h3>
              <p className="text-graphite-400 mb-4 leading-relaxed">
                You have modified the code buffer. Loading this historical review will overwrite your active edits.
              </p>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
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

        {/* Confirmation Modal: Delete audit item */}
        {deletingId && (
          <div
            className="absolute inset-0 bg-graphite-950/90 flex items-center justify-center p-4 z-60"
            role="alertdialog"
            aria-labelledby="confirm-delete-title"
          >
            <div className="bg-graphite-900 border border-graphite-700 rounded-lg p-4 shadow-dev-lg max-w-xs text-xs">
              <h3 id="confirm-delete-title" className="font-bold text-graphite-100 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Delete historical audit?</span>
              </h3>
              <p className="text-graphite-400 mb-4 leading-relaxed">
                This will permanently delete this audit record from your history ledger.
              </p>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
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

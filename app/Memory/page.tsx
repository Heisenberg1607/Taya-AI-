"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { MemoryCard } from "@/app/UI/MemoryCards/MemoryCard";
import { useMemories } from "@/hooks/useMemories";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function MemoryCardSkeleton() {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
}

function PaginationControls({
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: PaginationControlsProps) {
  const getPageNumbers = useCallback(() => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevPage}
        disabled={!hasPrevPage}
        className="h-10 w-10"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onGoToPage(page)}
              className="h-10 w-10"
            >
              {page}
            </Button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onNextPage}
        disabled={!hasNextPage}
        className="h-10 w-10"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function MemoriesPage() {
  const {
    currentMemory,
    totalCount,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    loading,
    error,
    fetchMemories,
    goToPage,
    nextPage,
    prevPage,
    updateMemory,
    deleteMemory,
    toggleActionItemComplete,
    updateActionItem,
    deleteActionItem,
  } = useMemories();

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && hasPrevPage) {
        prevPage();
      } else if (e.key === "ArrowRight" && hasNextPage) {
        nextPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasPrevPage, hasNextPage, prevPage, nextPage]);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            All Memories
          </h1>
          <p className="text-sm text-slate-500">
            {loading
              ? "Loading…"
              : error
              ? "Error loading memories"
              : `${totalCount} memories • Page ${currentPage} of ${totalPages}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMemories}
            disabled={loading}
            className="text-sm font-medium"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Link
            href="/"
            className="text-sm font-medium text-slate-900 hover:opacity-70"
          >
            ← Back
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && <MemoryCardSkeleton />}

      {!loading && !error && totalCount === 0 && (
        <div className="rounded-lg bg-slate-50 p-8 text-center">
          <p className="text-slate-500">No memories yet.</p>
          <p className="mt-2 text-sm text-slate-400">
            Record your first memory to get started!
          </p>
        </div>
      )}

      {!loading && !error && currentMemory && (
        <div className="space-y-6">
          <MemoryCard
            data={currentMemory}
            onUpdate={updateMemory}
            onDelete={deleteMemory}
            onToggleActionComplete={toggleActionItemComplete}
            onUpdateActionItem={updateActionItem}
            onDeleteActionItem={deleteActionItem}
          />

          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              hasPrevPage={hasPrevPage}
              hasNextPage={hasNextPage}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              onGoToPage={goToPage}
            />
          )}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <p className="text-center text-xs text-slate-400">
          Use ← → arrow keys to navigate between memories
        </p>
      )}
    </main>
  );
}

import { memo, useEffect, useState } from 'react';
import { X, ThumbsUp, MapPin, ShieldCheck, ImageOff } from 'lucide-react';
import type { CivicIssue } from '../lib/civicLogic.js';
import { PriorityIndicator, StatusIndicator } from './StatusIndicator.tsx';

/**
 * Props for the TicketDetailDrawer audit and inspection dialog.
 */
export interface TicketDetailDrawerProps {
  issue: CivicIssue | null;
  onClose: () => void;
  onUpvote: (id: string) => void;
}

/**
 * Accessible slide-over modal dialog displaying full AI dispatch metadata,
 * attached evidence, resolution notes, and chronological status history.
 */
export const TicketDetailDrawer = memo(function TicketDetailDrawer({
  issue,
  onClose,
  onUpvote,
}: TicketDetailDrawerProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [issue?.id]);

  useEffect(() => {
    if (!issue) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [issue, onClose]);

  if (!issue) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-ticket-title"
        className="w-full max-w-xl bg-[#111827] border-l border-[#1E293B] h-full overflow-y-auto p-6 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1E293B]">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8] font-mono tabular-nums">
              <span className="text-[#3B82F6] font-semibold">{issue.id}</span>
              <span aria-hidden="true">·</span>
              <span>{new Date(issue.createdAt).toLocaleString()}</span>
            </div>
            <h2 id="drawer-ticket-title" className="text-xl font-semibold text-[#F8FAFC]">
              {issue.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <PriorityIndicator priority={issue.priority} />
              <span className="text-[#475569]" aria-hidden="true">·</span>
              <StatusIndicator status={issue.status} />
              <span className="text-[#475569]" aria-hidden="true">·</span>
              <span className="text-xs text-[#94A3B8]">{issue.category}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close details for ${issue.id}`}
            className="p-2 rounded-md text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-2 text-sm text-[#F8FAFC]">
            <MapPin className="h-4 w-4 text-[#3B82F6] shrink-0" aria-hidden="true" />
            <span>{issue.location}</span>
          </div>
          <button
            type="button"
            onClick={() => onUpvote(issue.id)}
            aria-label={`Upvote issue ${issue.id}, current upvotes ${issue.upvotes}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] hover:border-[#3B82F6] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
          >
            <ThumbsUp className="h-3.5 w-3.5 text-[#3B82F6]" aria-hidden="true" />
            <span>Upvote</span>
            <span className="font-mono tabular-nums text-[#3B82F6]">{issue.upvotes}</span>
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-[#94A3B8]">Citizen Report Description</h3>
          <p className="text-sm leading-relaxed text-[#F8FAFC]">{issue.description}</p>
        </div>

        {issue.imageDataUrl && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#94A3B8]">Attached Field Photo</h3>
            {!imageError ? (
              <img
                src={issue.imageDataUrl}
                alt={`Uploaded evidence for ${issue.title}`}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full max-h-64 object-cover rounded-md border border-[#1E293B]"
              />
            ) : (
              <div className="w-full h-36 rounded-md border border-[#1E293B] bg-[#0B0F19] flex flex-col items-center justify-center gap-2 text-xs text-[#94A3B8]">
                <ImageOff className="h-5 w-5" aria-hidden="true" />
                <span>Attached image could not be displayed</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 pt-4 border-t border-[#1E293B]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-[#94A3B8] inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
              <span>AI Dispatch Assessment</span>
            </h3>
            <span className="text-xs text-[#94A3B8] font-mono tabular-nums">
              {issue.analysisSource === 'gemini-ai' ? 'Gemini AI' : 'Rule-Based Engine'} · {issue.confidence}% confidence
            </span>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-[#94A3B8]">Recommended Department</dt>
              <dd className="text-[#F8FAFC] font-medium mt-0.5">{issue.department}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#94A3B8]">Estimated Resolution SLA</dt>
              <dd className="text-[#F8FAFC] font-mono tabular-nums mt-0.5">{issue.slaWindow}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-[#94A3B8]">Official Field Dispatch Brief</dt>
              <dd className="text-[#F8FAFC] mt-0.5 leading-relaxed">{issue.dispatchBrief}</dd>
            </div>
          </dl>
        </div>

        {issue.resolutionNotes && (
          <div className="space-y-1.5 pt-4 border-t border-[#1E293B]">
            <h3 className="text-xs font-semibold text-[#94A3B8]">Administrator Resolution Notes</h3>
            <p className="text-sm text-[#10B981] leading-relaxed">{issue.resolutionNotes}</p>
          </div>
        )}

        <div className="space-y-3 pt-4 border-t border-[#1E293B]">
          <h3 className="text-xs font-semibold text-[#94A3B8]">Audit Status History</h3>
          <ol className="space-y-3">
            {issue.statusHistory.map((entry, index) => (
              <li key={`${entry.timestamp}-${index}`} className="flex items-start justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="font-medium text-[#F8FAFC]">{entry.status}</div>
                  <div className="text-[#94A3B8]">{entry.note}</div>
                </div>
                <time className="font-mono tabular-nums text-[#94A3B8] shrink-0">
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
});

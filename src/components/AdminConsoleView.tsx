import { useMemo, useState } from 'react';
import { Check, Eye, Search } from 'lucide-react';
import {
  DEPARTMENTS,
  ISSUE_STATUSES,
  PRIORITY_LEVELS,
  type CivicDepartment,
  type CivicIssue,
  type IssueStatus,
  type PriorityLevel,
} from '../lib/civicLogic.js';
import { PriorityIndicator, StatusIndicator } from './StatusIndicator.tsx';

interface AdminConsoleViewProps {
  issues: CivicIssue[];
  onUpdateIssue: (
    id: string,
    patch: {
      status?: IssueStatus;
      priority?: PriorityLevel;
      department?: CivicDepartment;
      resolutionNotes?: string;
    }
  ) => Promise<void>;
  onInspectIssue: (issue: CivicIssue) => void;
}

export function AdminConsoleView({
  issues,
  onUpdateIssue,
  onInspectIssue,
}: AdminConsoleViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const filteredIssues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return issues.filter((issue) => {
      if (statusFilter !== 'All' && issue.status !== statusFilter) return false;
      if (!q) return true;
      return (
        issue.id.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.department.toLowerCase().includes(q) ||
        issue.location.toLowerCase().includes(q)
      );
    });
  }, [issues, searchQuery, statusFilter]);

  async function handlePatch(
    id: string,
    patch: {
      status?: IssueStatus;
      priority?: PriorityLevel;
      department?: CivicDepartment;
      resolutionNotes?: string;
    },
    actionLabel: string
  ) {
    setSavingId(id);
    setFeedback('');
    try {
      await onUpdateIssue(id, patch);
      setFeedback(`${id}: ${actionLabel}`);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section
      aria-labelledby="admin-console-heading"
      className="bg-[#111827] border border-[#1E293B] rounded-lg p-6 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <h1 id="admin-console-heading" className="text-xl font-semibold text-[#F8FAFC]">
            Administrator Dispatch & Resolution Console
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Review incoming reports, update workflow statuses, adjust priorities or department routing, and log field resolution notes.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#0B0F19] border border-[#1E293B] rounded-md">
          {['All', ...ISSUE_STATUSES].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] ${
                statusFilter === status
                  ? 'bg-[#3B82F6] text-[#F8FAFC]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full sm:max-w-sm space-y-1">
          <label htmlFor="admin-search" className="block text-xs font-medium text-[#94A3B8]">
            Filter Admin Queue
          </label>
          <div className="relative">
            <Search
              className="h-4 w-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="admin-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Ticket ID, title, or department..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
        </div>

        {feedback && (
          <div role="status" aria-live="polite" className="text-xs font-medium text-[#10B981]">
            Updated {feedback}
          </div>
        )}
      </div>

      <div className="overflow-x-auto border border-[#1E293B] rounded-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0B0F19] border-b border-[#1E293B] text-xs font-semibold text-[#94A3B8]">
            <tr>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">Ticket</th>
              <th scope="col" className="py-3 px-4">Complaint Summary</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">Priority</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">Department</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">Status</th>
              <th scope="col" className="py-3 px-4 min-w-[240px]">Resolution Notes</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B] text-sm">
            {filteredIssues.map((issue) => {
              const currentNote = notesDraft[issue.id] ?? issue.resolutionNotes ?? '';
              const isBusy = savingId === issue.id;

              return (
                <tr key={issue.id} className="hover:bg-[#0B0F19]/50 transition-colors">
                  <td className="py-3.5 px-4 align-top whitespace-nowrap space-y-1">
                    <div className="font-mono tabular-nums text-xs font-semibold text-[#3B82F6]">
                      {issue.id}
                    </div>
                    <div className="text-xs font-mono tabular-nums text-[#94A3B8]">
                      +{issue.upvotes} votes
                    </div>
                  </td>

                  <td className="py-3.5 px-4 align-top max-w-xs space-y-1">
                    <div className="font-medium text-[#F8FAFC]">{issue.title}</div>
                    <div className="text-xs text-[#94A3B8]">{issue.location}</div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <PriorityIndicator priority={issue.priority} />
                      <span className="text-[#475569]" aria-hidden="true">·</span>
                      <StatusIndicator status={issue.status} />
                    </div>
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    <label htmlFor={`priority-${issue.id}`} className="sr-only">
                      Priority for {issue.id}
                    </label>
                    <select
                      id={`priority-${issue.id}`}
                      disabled={isBusy}
                      value={issue.priority}
                      onChange={(e) =>
                        handlePatch(
                          issue.id,
                          { priority: e.target.value as PriorityLevel },
                          `Priority set to ${e.target.value}`
                        )
                      }
                      className="px-2.5 py-1.5 text-xs rounded bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                    >
                      {PRIORITY_LEVELS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    <label htmlFor={`dept-${issue.id}`} className="sr-only">
                      Department for {issue.id}
                    </label>
                    <select
                      id={`dept-${issue.id}`}
                      disabled={isBusy}
                      value={issue.department}
                      onChange={(e) =>
                        handlePatch(
                          issue.id,
                          { department: e.target.value as CivicDepartment },
                          `Assigned to ${e.target.value}`
                        )
                      }
                      className="max-w-[210px] px-2.5 py-1.5 text-xs rounded bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    <label htmlFor={`status-${issue.id}`} className="sr-only">
                      Status for {issue.id}
                    </label>
                    <select
                      id={`status-${issue.id}`}
                      disabled={isBusy}
                      value={issue.status}
                      onChange={(e) =>
                        handlePatch(
                          issue.id,
                          { status: e.target.value as IssueStatus },
                          `Status changed to ${e.target.value}`
                        )
                      }
                      className="px-2.5 py-1.5 text-xs rounded bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                    >
                      {ISSUE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3.5 px-4 align-top">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor={`note-${issue.id}`} className="sr-only">
                        Resolution note for {issue.id}
                      </label>
                      <input
                        id={`note-${issue.id}`}
                        type="text"
                        value={currentNote}
                        onChange={(e) =>
                          setNotesDraft((prev) => ({ ...prev, [issue.id]: e.target.value }))
                        }
                        placeholder="Add dispatch or resolution note..."
                        className="w-full px-2.5 py-1.5 text-xs rounded bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
                      />
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          handlePatch(
                            issue.id,
                            { resolutionNotes: currentNote },
                            'Resolution note saved'
                          )
                        }
                        aria-label={`Save resolution note for ${issue.id}`}
                        className="p-1.5 rounded bg-[#0B0F19] border border-[#1E293B] text-[#10B981] hover:border-[#10B981] disabled:opacity-50 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onInspectIssue(issue)}
                      aria-label={`Inspect full audit trail for ${issue.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded bg-[#0B0F19] border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Audit</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

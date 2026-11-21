import { useMemo, useState } from 'react';
import { Search, ThumbsUp, Eye } from 'lucide-react';
import {
  DEPARTMENTS,
  ISSUE_STATUSES,
  PRIORITY_LEVELS,
  type CivicIssue,
} from '../lib/civicLogic.js';
import { PriorityIndicator, StatusIndicator } from './StatusIndicator.tsx';

interface IssueTrackerViewProps {
  issues: CivicIssue[];
  onUpvote: (id: string) => void;
  onInspectIssue: (issue: CivicIssue) => void;
  onReportNew: () => void;
}

const PRIORITY_RANK: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export function IssueTrackerView({
  issues,
  onUpvote,
  onInspectIssue,
  onReportNew,
}: IssueTrackerViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes' | 'priority'>('newest');

  const filteredIssues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return issues
      .filter((issue) => {
        if (statusFilter !== 'All' && issue.status !== statusFilter) return false;
        if (priorityFilter !== 'All' && issue.priority !== priorityFilter) return false;
        if (departmentFilter !== 'All' && issue.department !== departmentFilter) return false;
        if (!q) return true;
        return (
          issue.id.toLowerCase().includes(q) ||
          issue.title.toLowerCase().includes(q) ||
          issue.location.toLowerCase().includes(q) ||
          issue.description.toLowerCase().includes(q) ||
          issue.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
        if (sortBy === 'priority') {
          return (PRIORITY_RANK[b.priority] ?? 0) - (PRIORITY_RANK[a.priority] ?? 0);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [issues, searchQuery, statusFilter, priorityFilter, departmentFilter, sortBy]);

  function resetFilters() {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setDepartmentFilter('All');
    setSortBy('newest');
  }

  return (
    <section
      aria-labelledby="tracker-heading"
      className="bg-[#111827] border border-[#1E293B] rounded-lg p-6 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <h1 id="tracker-heading" className="text-xl font-semibold text-[#F8FAFC]">
            Civic Issue Tracking Dashboard
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Search by Ticket ID, filter by operational status or department, and upvote urgent infrastructure reports.
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

      {/* Search & Multi-Facet Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        <div className="lg:col-span-4 space-y-1">
          <label htmlFor="tracker-search" className="block text-xs font-medium text-[#94A3B8]">
            Search Ticket ID, Title, or Location
          </label>
          <div className="relative">
            <Search
              className="h-4 w-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="tracker-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., CR-2026-101 or Oakridge"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-1">
          <label htmlFor="tracker-priority-filter" className="block text-xs font-medium text-[#94A3B8]">
            Priority
          </label>
          <select
            id="tracker-priority-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
          >
            <option value="All">All Priorities</option>
            {PRIORITY_LEVELS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-4 space-y-1">
          <label htmlFor="tracker-dept-filter" className="block text-xs font-medium text-[#94A3B8]">
            Department
          </label>
          <select
            id="tracker-dept-filter"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2 space-y-1">
          <label htmlFor="tracker-sort" className="block text-xs font-medium text-[#94A3B8]">
            Sort By
          </label>
          <select
            id="tracker-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'upvotes' | 'priority')}
            className="w-full px-3 py-2 text-sm rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
          >
            <option value="newest">Newest First</option>
            <option value="priority">Highest Priority</option>
            <option value="upvotes">Most Upvoted</option>
          </select>
        </div>
      </div>

      {/* High-Density Data Table */}
      {filteredIssues.length === 0 ? (
        <div className="py-12 text-center space-y-3 border border-dashed border-[#1E293B] rounded-md">
          <p className="text-sm font-medium text-[#F8FAFC]">
            No civic tickets match your active filters.
          </p>
          <p className="text-xs text-[#94A3B8]">
            Try clearing your search filters or report a new infrastructure issue.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={resetFilters}
              className="px-3.5 py-2 text-xs font-medium rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] hover:border-[#3B82F6]"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={onReportNew}
              className="px-3.5 py-2 text-xs font-semibold rounded-md bg-[#3B82F6] text-[#F8FAFC] hover:bg-[#2563EB]"
            >
              Report New Issue
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#1E293B] rounded-md">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0B0F19] border-b border-[#1E293B] text-xs font-semibold text-[#94A3B8]">
              <tr>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Ticket ID</th>
                <th scope="col" className="py-3 px-4">Issue & Dispatch Brief</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Department</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Priority</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap">Status</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap text-right">SLA</th>
                <th scope="col" className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-sm">
              {filteredIssues.map((issue) => (
                <tr
                  key={issue.id}
                  className="hover:bg-[#0B0F19]/60 transition-colors"
                >
                  <td className="py-3.5 px-4 align-top font-mono tabular-nums text-xs font-semibold text-[#3B82F6] whitespace-nowrap">
                    {issue.id}
                  </td>
                  <td className="py-3.5 px-4 align-top max-w-md space-y-1">
                    <button
                      type="button"
                      onClick={() => onInspectIssue(issue)}
                      className="text-left font-medium text-[#F8FAFC] hover:text-[#3B82F6] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                    >
                      {issue.title}
                    </button>
                    <div className="text-xs text-[#94A3B8]">
                      {issue.location} · {issue.category}
                    </div>
                    <div className="text-xs text-[#94A3B8] line-clamp-1">
                      {issue.dispatchBrief}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-top text-xs text-[#F8FAFC] max-w-[180px]">
                    {issue.department}
                  </td>
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    <PriorityIndicator priority={issue.priority} />
                  </td>
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    <StatusIndicator status={issue.status} />
                  </td>
                  <td className="py-3.5 px-4 align-top text-right font-mono tabular-nums text-xs text-[#94A3B8] whitespace-nowrap">
                    {issue.slaWindow}
                  </td>
                  <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpvote(issue.id)}
                        aria-label={`Upvote ${issue.id}, current count ${issue.upvotes}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono tabular-nums rounded bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] hover:border-[#3B82F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                      >
                        <ThumbsUp className="h-3 w-3 text-[#3B82F6]" aria-hidden="true" />
                        <span>{issue.upvotes}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onInspectIssue(issue)}
                        aria-label={`Inspect details for ${issue.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded bg-[#0B0F19] border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Details</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

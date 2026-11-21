import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import {
  INITIAL_SEED_ISSUES,
  classifyIssueRuleBased,
  computeTelemetry,
  formatAuditReportCsv,
  generateTicketId,
  sanitizeText,
  type CivicDepartment,
  type CivicIssue,
  type ClassificationResult,
  type IssueStatus,
  type PriorityLevel,
} from './lib/civicLogic.js';
import { DepartmentWorkloadPanel, TelemetryStrip } from './components/TelemetryStrip.tsx';
import { CitizenReportPanel } from './components/CitizenReportPanel.tsx';
import { IssueTrackerView } from './components/IssueTrackerView.tsx';
import { AdminConsoleView } from './components/AdminConsoleView.tsx';
import { TicketDetailDrawer } from './components/TicketDetailDrawer.tsx';

type ActiveTab = 'report' | 'tracker' | 'admin' | 'workload';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('report');
  const [issues, setIssues] = useState<CivicIssue[]>(INITIAL_SEED_ISSUES);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState('');
  const [apiStatusError, setApiStatusError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/issues')
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load server issue store.');
        return res.json() as Promise<{ issues?: CivicIssue[] }>;
      })
      .then((data) => {
        if (active && Array.isArray(data.issues) && data.issues.length > 0) {
          setIssues(data.issues);
        }
      })
      .catch(() => {
        // Keep seeded initial state if running in static preview without API server
      });
    return () => {
      active = false;
    };
  }, []);

  const telemetry = useMemo(() => computeTelemetry(issues), [issues]);

  const selectedIssue = useMemo(
    () => issues.find((issue) => issue.id === selectedIssueId) ?? null,
    [issues, selectedIssueId]
  );

  const handleAnalyzePreview = useCallback(
    async (draft: {
      title: string;
      location: string;
      category: string;
      description: string;
      imageDataUrl: string;
    }): Promise<ClassificationResult> => {
      setApiStatusError('');
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: draft.title,
            location: draft.location,
            category: draft.category,
            description: draft.description,
            imageDataUrl: draft.imageDataUrl,
          }),
        });
        const data = (await res.json()) as {
          analysis?: ClassificationResult;
          fallbackAnalysis?: ClassificationResult;
          error?: string;
        };

        if (res.ok && data.analysis) {
          return data.analysis;
        }
        if (data.fallbackAnalysis) {
          return {
            ...data.fallbackAnalysis,
            notice: data.error
              ? `${data.error} Using local rule-based classification.`
              : data.fallbackAnalysis.notice,
          };
        }
        throw new Error(data.error || 'Analysis failed.');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Network error';
        setApiStatusError(message);
        const localFallback = classifyIssueRuleBased({
          title: draft.title,
          description: draft.description,
          location: draft.location,
          categoryHint: draft.category,
        });
        return {
          ...localFallback,
          notice: `Backend unavailable (${message}); local rule-based classification applied.`,
        };
      }
    },
    []
  );

  const handleSubmitIssue = useCallback(
    async (draft: {
      title: string;
      location: string;
      category: string;
      description: string;
      imageDataUrl: string;
    }): Promise<{ issue: CivicIssue; notice?: string }> => {
      setApiStatusError('');
      try {
        const res = await fetch('/api/issues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        });
        const data = (await res.json()) as {
          issue?: CivicIssue;
          notice?: string;
          error?: string;
        };
        if (res.ok && data.issue) {
          setIssues((prev) => [data.issue!, ...prev]);
          return { issue: data.issue, notice: data.notice };
        }
        throw new Error(data.error || 'Unable to submit issue.');
      } catch (err) {
        // Resilient client-side fallback when running without live backend
        const localTriage = classifyIssueRuleBased({
          title: draft.title,
          description: draft.description,
          location: draft.location,
          categoryHint: draft.category,
        });
        const now = new Date().toISOString();
        const fallbackIssue: CivicIssue = {
          id: generateTicketId(issues, 2026),
          title: sanitizeText(draft.title, 140),
          description: sanitizeText(draft.description, 2000),
          location: sanitizeText(draft.location, 180),
          category: localTriage.category,
          priority: localTriage.priority,
          department: localTriage.department,
          status: 'Reported',
          dispatchBrief: localTriage.dispatchBrief,
          confidence: localTriage.confidence,
          slaWindow: localTriage.slaWindow,
          analysisSource: 'rule-based-fallback',
          upvotes: 1,
          reportedBy: 'Citizen Portal',
          resolutionNotes: '',
          ...(draft.imageDataUrl ? { imageDataUrl: draft.imageDataUrl } : {}),
          createdAt: now,
          updatedAt: now,
          statusHistory: [
            {
              status: 'Reported',
              timestamp: now,
              note: 'Triaged via local rule-based fallback and logged to queue',
            },
          ],
        };
        setIssues((prev) => [fallbackIssue, ...prev]);
        const msg = err instanceof Error ? err.message : 'Offline fallback mode';
        return {
          issue: fallbackIssue,
          notice: `Logged locally (${msg}).`,
        };
      }
    },
    [issues]
  );

  const handleUpvote = useCallback(async (id: string) => {
    setIssues((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, upvotes: item.upvotes + 1, updatedAt: new Date().toISOString() }
          : item
      )
    );
    try {
      const res = await fetch(`/api/issues/${encodeURIComponent(id)}/upvote`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = (await res.json()) as { issue?: CivicIssue };
        if (data.issue) {
          setIssues((prev) => prev.map((item) => (item.id === id ? data.issue! : item)));
        }
      }
    } catch {
      // Optimistic client upvote already applied
    }
  }, []);

  const handleAdminUpdateIssue = useCallback(
    async (
      id: string,
      patch: {
        status?: IssueStatus;
        priority?: PriorityLevel;
        department?: CivicDepartment;
        resolutionNotes?: string;
      }
    ) => {
      const now = new Date().toISOString();
      setIssues((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const nextStatus = patch.status ?? item.status;
          const changes: string[] = [];
          if (patch.status && patch.status !== item.status) {
            changes.push(`Status updated to ${patch.status}`);
          }
          if (patch.priority && patch.priority !== item.priority) {
            changes.push(`Priority adjusted to ${patch.priority}`);
          }
          if (patch.department && patch.department !== item.department) {
            changes.push(`Reassigned to ${patch.department}`);
          }
          if (patch.resolutionNotes !== undefined && patch.resolutionNotes !== item.resolutionNotes) {
            changes.push(`Admin note: ${sanitizeText(patch.resolutionNotes, 600)}`);
          }
          return {
            ...item,
            status: nextStatus,
            priority: patch.priority ?? item.priority,
            department: patch.department ?? item.department,
            resolutionNotes:
              patch.resolutionNotes !== undefined
                ? sanitizeText(patch.resolutionNotes, 600)
                : item.resolutionNotes,
            updatedAt: now,
            statusHistory:
              changes.length > 0
                ? [
                    ...item.statusHistory,
                    { status: nextStatus, timestamp: now, note: changes.join(' · ') },
                  ]
                : item.statusHistory,
          };
        })
      );

      try {
        const res = await fetch(`/api/issues/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        if (res.ok) {
          const data = (await res.json()) as { issue?: CivicIssue };
          if (data.issue) {
            setIssues((prev) => prev.map((item) => (item.id === id ? data.issue! : item)));
          }
        }
      } catch {
        // Optimistic update preserved
      }
    },
    []
  );

  function handleExportAuditCsv() {
    const csv = formatAuditReportCsv(issues);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `civicresolve-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportNotice(`Exported ${issues.length} civic tickets to CSV audit report.`);
    setTimeout(() => setExportNotice(''), 4000);
  }

  function handlePrintAudit() {
    window.print();
  }

  const navItems: Array<{ id: ActiveTab; label: string }> = [
    { id: 'report', label: 'Report Issue' },
    { id: 'tracker', label: 'Issue Tracker' },
    { id: 'admin', label: 'Admin Console' },
    { id: 'workload', label: 'Department Load' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#3B82F6] focus:text-[#F8FAFC] focus:rounded-md focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* Clean 3-Zone Top Bar Contract */}
      <header className="no-print border-b border-[#1E293B] bg-[#0B0F19]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#main-content"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('report');
            }}
            className="text-lg font-bold tracking-tight text-[#F8FAFC] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
          >
            CivicResolve
          </a>

          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`py-5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6] ${
                    isActive
                      ? 'border-[#3B82F6] text-[#F8FAFC]'
                      : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportAuditCsv}
              aria-label="Export civic issues audit report as CSV"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-[#3B82F6] text-[#F8FAFC] hover:bg-[#2563EB] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export Audit Report</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <nav
          aria-label="Mobile primary navigation"
          className="md:hidden border-t border-[#1E293B] px-4 py-2 flex items-center gap-4 overflow-x-auto"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`py-1.5 text-xs font-medium border-b-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-[#3B82F6] text-[#F8FAFC]'
                    : 'border-transparent text-[#94A3B8]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 focus:outline-none"
      >
        {(exportNotice || apiStatusError) && (
          <div
            role="status"
            aria-live="polite"
            className="no-print flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-md bg-[#111827] border border-[#1E293B] text-xs"
          >
            <span className="text-[#10B981]">{exportNotice || apiStatusError}</span>
            <button
              type="button"
              onClick={handlePrintAudit}
              aria-label="Print formatted audit report"
              className="inline-flex items-center gap-1.5 text-[#94A3B8] hover:text-[#F8FAFC] font-medium"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Print Audit View</span>
            </button>
          </div>
        )}

        {/* Live Civic Telemetry KPIs */}
        <TelemetryStrip telemetry={telemetry} />

        {/* Active Workspace View */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            <CitizenReportPanel
              issues={issues}
              onAnalyzePreview={handleAnalyzePreview}
              onSubmitIssue={handleSubmitIssue}
              onUpvote={handleUpvote}
              onInspectIssue={(issue) => setSelectedIssueId(issue.id)}
              onOpenTracker={() => setActiveTab('tracker')}
            />
            <DepartmentWorkloadPanel telemetry={telemetry} />
          </div>
        )}

        {activeTab === 'tracker' && (
          <IssueTrackerView
            issues={issues}
            onUpvote={handleUpvote}
            onInspectIssue={(issue) => setSelectedIssueId(issue.id)}
            onReportNew={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'admin' && (
          <div className="space-y-6">
            <AdminConsoleView
              issues={issues}
              onUpdateIssue={handleAdminUpdateIssue}
              onInspectIssue={(issue) => setSelectedIssueId(issue.id)}
            />
            <DepartmentWorkloadPanel telemetry={telemetry} />
          </div>
        )}

        {activeTab === 'workload' && (
          <div className="space-y-6">
            <DepartmentWorkloadPanel telemetry={telemetry} />
            <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-[#F8FAFC]">
                  Printable Municipal Audit Summary
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Download a formula-safe CSV ledger or open your browser print dialog for formal civic review.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrintAudit}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] hover:border-[#3B82F6]"
                >
                  <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Print Report</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportAuditCsv}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-[#3B82F6] text-[#F8FAFC] hover:bg-[#2563EB]"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="no-print border-t border-[#1E293B] bg-[#0B0F19]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <span>CivicResolve Municipal Issue Management Platform</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePrintAudit}
              className="hover:text-[#F8FAFC] transition-colors"
            >
              Print Audit Summary
            </button>
            <button
              type="button"
              onClick={handleExportAuditCsv}
              className="hover:text-[#F8FAFC] transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </footer>

      <TicketDetailDrawer
        issue={selectedIssue}
        onClose={() => setSelectedIssueId(null)}
        onUpvote={handleUpvote}
      />
    </div>
  );
}

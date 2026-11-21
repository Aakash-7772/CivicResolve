import type { CivicTelemetry } from '../lib/civicLogic.js';

export function TelemetryStrip({ telemetry }: { telemetry: CivicTelemetry }) {
  const kpis = [
    {
      label: 'Total Civic Issues',
      value: telemetry.totalIssues.toString(),
      subtext: `${telemetry.reportedCount} awaiting dispatch`,
      accentClass: 'text-[#F8FAFC]',
    },
    {
      label: 'Critical Alerts',
      value: telemetry.criticalAlerts.toString(),
      subtext:
        telemetry.criticalAlerts > 0
          ? 'Immediate emergency SLA active'
          : 'No active critical incidents',
      accentClass: telemetry.criticalAlerts > 0 ? 'text-[#EF4444]' : 'text-[#10B981]',
    },
    {
      label: 'In Progress',
      value: telemetry.inProgressCount.toString(),
      subtext: 'Field crews currently assigned',
      accentClass: 'text-[#F59E0B]',
    },
    {
      label: 'Resolution Rate',
      value: `${telemetry.resolutionRate}%`,
      subtext: `${telemetry.resolvedCount} of ${telemetry.totalIssues} tickets closed`,
      accentClass: 'text-[#10B981]',
    },
  ];

  return (
    <section aria-labelledby="telemetry-heading" className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="telemetry-heading" className="text-sm font-semibold tracking-wide text-[#94A3B8]">
          Live Civic Telemetry
        </h2>
        <span className="text-xs text-[#94A3B8] font-mono tabular-nums">
          {telemetry.resolvedCount} resolved / {telemetry.totalIssues} logged
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 flex flex-col justify-between gap-2"
          >
            <span className="text-xs font-medium text-[#94A3B8]">{kpi.label}</span>
            <div className={`text-3xl font-semibold tracking-tight font-mono tabular-nums ${kpi.accentClass}`}>
              {kpi.value}
            </div>
            <span className="text-xs text-[#94A3B8]">{kpi.subtext}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DepartmentWorkloadPanel({ telemetry }: { telemetry: CivicTelemetry }) {
  const maxTotal = Math.max(1, ...telemetry.departmentWorkloads.map((d) => d.total));

  return (
    <section
      aria-labelledby="dept-workload-heading"
      className="bg-[#111827] border border-[#1E293B] rounded-lg p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <h2 id="dept-workload-heading" className="text-base font-semibold text-[#F8FAFC]">
            Department Workload Distribution
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Active dispatch queue versus closed tickets across municipal divisions. Updates automatically as statuses change.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-[#3B82F6]" aria-hidden="true" />
            Active Queue
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-[#10B981]" aria-hidden="true" />
            Resolved
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-5">
        {telemetry.departmentWorkloads.map((dept) => {
          const activeWidth = Math.round((dept.active / maxTotal) * 100);
          const resolvedWidth = Math.round((dept.resolved / maxTotal) * 100);

          return (
            <div key={dept.department} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-[#F8FAFC] truncate">
                  {dept.department}
                </span>
                <span className="text-xs font-mono tabular-nums text-[#94A3B8] shrink-0">
                  {dept.active} active · {dept.resolved} resolved
                  {dept.criticalCount > 0 ? ` · ${dept.criticalCount} critical` : ''}
                </span>
              </div>
              <div
                className="h-2.5 w-full bg-[#0B0F19] border border-[#1E293B] rounded-sm overflow-hidden flex"
                role="progressbar"
                aria-label={`${dept.department}: ${dept.active} active and ${dept.resolved} resolved tickets`}
                aria-valuenow={dept.total}
                aria-valuemin={0}
                aria-valuemax={maxTotal}
              >
                {activeWidth > 0 && (
                  <div
                    className="h-full bg-[#3B82F6] transition-all duration-200"
                    style={{ width: `${activeWidth}%` }}
                  />
                )}
                {resolvedWidth > 0 && (
                  <div
                    className="h-full bg-[#10B981] transition-all duration-200"
                    style={{ width: `${resolvedWidth}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

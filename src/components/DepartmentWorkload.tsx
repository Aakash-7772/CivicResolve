import { memo, useMemo } from 'react';
import type { CivicTelemetry } from '../lib/civicLogic.js';

/**
 * Props for the DepartmentWorkload distribution panel.
 */
export interface DepartmentWorkloadProps {
  telemetry: CivicTelemetry;
}

/**
 * Renders live municipal department workload progress bars comparing active dispatch
 * queues against resolved tickets across divisions.
 */
export const DepartmentWorkload = memo(function DepartmentWorkload({
  telemetry,
}: DepartmentWorkloadProps) {
  const { maxTotal, rows } = useMemo(() => {
    const peak = Math.max(1, ...telemetry.departmentWorkloads.map((d) => d.total));
    const computedRows = telemetry.departmentWorkloads.map((dept) => ({
      ...dept,
      activeWidth: Math.round((dept.active / peak) * 100),
      resolvedWidth: Math.round((dept.resolved / peak) * 100),
    }));
    return { maxTotal: peak, rows: computedRows };
  }, [telemetry.departmentWorkloads]);

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
        {rows.map((dept) => (
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
              {dept.activeWidth > 0 && (
                <div
                  className="h-full bg-[#3B82F6] transition-all duration-200"
                  style={{ width: `${dept.activeWidth}%` }}
                />
              )}
              {dept.resolvedWidth > 0 && (
                <div
                  className="h-full bg-[#10B981] transition-all duration-200"
                  style={{ width: `${dept.resolvedWidth}%` }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

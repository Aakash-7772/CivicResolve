import { memo, useMemo } from 'react';
import type { CivicTelemetry } from '../lib/civicLogic.js';

/**
 * Props for the TelemetryBar KPI summary strip.
 */
export interface TelemetryBarProps {
  telemetry: CivicTelemetry;
}

/**
 * Renders the top-level Live Civic Telemetry KPI summary strip with tabular numerals
 * and semantic status color indicators.
 */
export const TelemetryBar = memo(function TelemetryBar({ telemetry }: TelemetryBarProps) {
  const kpis = useMemo(
    () => [
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
    ],
    [
      telemetry.totalIssues,
      telemetry.reportedCount,
      telemetry.criticalAlerts,
      telemetry.inProgressCount,
      telemetry.resolutionRate,
      telemetry.resolvedCount,
    ]
  );

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
});

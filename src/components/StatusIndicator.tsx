import { memo } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  CircleDot,
  Info,
} from 'lucide-react';
import type { IssueStatus, PriorityLevel } from '../lib/civicLogic.js';

/**
 * Renders an accessible unboxed urgency indicator combining semantic icon and label.
 */
export const PriorityIndicator = memo(function PriorityIndicator({
  priority,
}: {
  priority: PriorityLevel;
}) {
  switch (priority) {
    case 'Critical':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EF4444] whitespace-nowrap">
          <AlertOctagon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Critical</span>
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F59E0B] whitespace-nowrap">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>High</span>
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3B82F6] whitespace-nowrap">
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Medium</span>
        </span>
      );
    case 'Low':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] whitespace-nowrap">
          <ArrowDownRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Low</span>
        </span>
      );
  }
});

/**
 * Renders an accessible unboxed workflow status indicator combining icon and label.
 */
export const StatusIndicator = memo(function StatusIndicator({ status }: { status: IssueStatus }) {
  switch (status) {
    case 'Resolved':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981] whitespace-nowrap">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Resolved</span>
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F59E0B] whitespace-nowrap">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>In Progress</span>
        </span>
      );
    case 'Reported':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] whitespace-nowrap">
          <CircleDot className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Reported</span>
        </span>
      );
  }
});

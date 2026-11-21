export type CivicCategory =
  | 'Water & Utilities'
  | 'Electrical & Streetlighting'
  | 'Sanitation & Waste'
  | 'Roads & Transportation'
  | 'Parks & Public Spaces'
  | 'Public Safety & Hazards';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type IssueStatus = 'Reported' | 'In Progress' | 'Resolved';

export type CivicDepartment =
  | 'Municipal Water & Sewer Authority'
  | 'Public Works — Electrical Grid Division'
  | 'Department of Sanitation & Environmental Services'
  | 'Department of Transportation & Roadways'
  | 'Parks & Urban Forestry'
  | 'Emergency Public Safety Response';

export interface StatusHistoryEntry {
  status: IssueStatus;
  timestamp: string;
  note: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  location: string;
  category: CivicCategory;
  priority: PriorityLevel;
  department: CivicDepartment;
  status: IssueStatus;
  dispatchBrief: string;
  confidence: number;
  slaWindow: string;
  analysisSource: 'gemini-ai' | 'rule-based-fallback';
  upvotes: number;
  reportedBy: string;
  resolutionNotes: string;
  imageDataUrl?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryEntry[];
}

export interface ClassificationResult {
  category: CivicCategory;
  priority: PriorityLevel;
  department: CivicDepartment;
  dispatchBrief: string;
  confidence: number;
  slaWindow: string;
  reasoning: string;
  analysisSource: 'gemini-ai' | 'rule-based-fallback';
  notice?: string;
}

export interface DemoPreset {
  id: string;
  label: string;
  title: string;
  location: string;
  category: string;
  description: string;
}

export interface DuplicateMatch {
  issue: CivicIssue;
  similarity: number;
  reason: string;
}

export interface DepartmentWorkload {
  department: CivicDepartment;
  total: number;
  active: number;
  resolved: number;
  criticalCount: number;
  sharePercent: number;
  resolutionPercent: number;
}

export interface CivicTelemetry {
  totalIssues: number;
  criticalAlerts: number;
  inProgressCount: number;
  reportedCount: number;
  resolvedCount: number;
  resolutionRate: number;
  departmentWorkloads: DepartmentWorkload[];
}

export const CIVIC_CATEGORIES: CivicCategory[];
export const PRIORITY_LEVELS: PriorityLevel[];
export const ISSUE_STATUSES: IssueStatus[];
export const DEPARTMENTS: CivicDepartment[];
export const CATEGORY_TO_DEPARTMENT: Record<CivicCategory, CivicDepartment>;
export const DEMO_PRESETS: DemoPreset[];
export const INITIAL_SEED_ISSUES: CivicIssue[];

export function sanitizeText(value: unknown, maxLength?: number): string;
export function isSafeImageDataUrl(value: unknown): boolean;
export function validateIssueInput(payload: unknown): {
  valid: boolean;
  errors: string[];
  sanitized: {
    title: string;
    description: string;
    location: string;
    category: string;
    imageDataUrl: string;
  };
};
export function classifyIssueRuleBased(input: {
  title?: string;
  description?: string;
  location?: string;
  categoryHint?: string;
}): ClassificationResult;
export function generateTicketId(existingIssues?: CivicIssue[], year?: number): string;
export function detectPotentialDuplicates(
  draft: { title?: string; description?: string; location?: string },
  existingIssues?: CivicIssue[]
): DuplicateMatch[];
export function computeTelemetry(issues?: CivicIssue[]): CivicTelemetry;
export function formatAuditReportCsv(issues?: CivicIssue[]): string;

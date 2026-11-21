import {
  DEPARTMENTS,
  ISSUE_STATUSES,
  PRIORITY_LEVELS,
  sanitizeText,
  type CivicDepartment,
  type IssueStatus,
  type PriorityLevel,
} from '../../src/lib/civicLogic.js';
import {
  extractQueryParam,
  issuesStore,
  parseJsonBody,
  type VercelRequest,
  type VercelResponse,
} from '../_lib/civicServer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const id = extractQueryParam(req, 'id');
  const issue = issuesStore.find((item) => item.id === id);
  if (!issue) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  const body = await parseJsonBody(req);
  const nextStatus = sanitizeText(body.status ?? '', 30) as IssueStatus;
  const nextPriority = sanitizeText(body.priority ?? '', 30) as PriorityLevel;
  const nextDepartment = sanitizeText(body.department ?? '', 80) as CivicDepartment;
  const resolutionNotes =
    typeof body.resolutionNotes === 'string' ? sanitizeText(body.resolutionNotes, 600) : undefined;

  const now = new Date().toISOString();
  const changes: string[] = [];

  if (nextStatus) {
    if (!ISSUE_STATUSES.includes(nextStatus)) {
      res.status(400).json({ error: 'Invalid status value.' });
      return;
    }
    if (issue.status !== nextStatus) {
      issue.status = nextStatus;
      changes.push(`Status updated to ${nextStatus}`);
    }
  }

  if (nextPriority) {
    if (!PRIORITY_LEVELS.includes(nextPriority)) {
      res.status(400).json({ error: 'Invalid priority value.' });
      return;
    }
    if (issue.priority !== nextPriority) {
      issue.priority = nextPriority;
      changes.push(`Priority adjusted to ${nextPriority}`);
    }
  }

  if (nextDepartment) {
    if (!DEPARTMENTS.includes(nextDepartment)) {
      res.status(400).json({ error: 'Invalid department value.' });
      return;
    }
    if (issue.department !== nextDepartment) {
      issue.department = nextDepartment;
      changes.push(`Reassigned to ${nextDepartment}`);
    }
  }

  if (resolutionNotes !== undefined) {
    issue.resolutionNotes = resolutionNotes;
    if (resolutionNotes) {
      changes.push(`Admin note: ${resolutionNotes}`);
    }
  }

  issue.updatedAt = now;
  if (changes.length > 0) {
    issue.statusHistory.push({
      status: issue.status,
      timestamp: now,
      note: changes.join(' · '),
    });
  }

  res.status(200).json({ issue });
}

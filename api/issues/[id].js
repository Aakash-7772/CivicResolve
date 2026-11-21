import {
  DEPARTMENTS,
  ISSUE_STATUSES,
  PRIORITY_LEVELS,
  extractIssueId,
  issuesStore,
  parseJsonBody,
  sanitizeText,
  sendJson,
} from '../_lib/civicServer.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const id = extractIssueId(req);
  const issue = issuesStore.find((item) => item.id === id);
  if (!issue) {
    sendJson(res, 404, { error: 'Ticket not found.' });
    return;
  }

  const body = await parseJsonBody(req);
  const nextStatus = sanitizeText(body.status ?? '', 30);
  const nextPriority = sanitizeText(body.priority ?? '', 30);
  const nextDepartment = sanitizeText(body.department ?? '', 80);
  const resolutionNotes =
    typeof body.resolutionNotes === 'string' ? sanitizeText(body.resolutionNotes, 600) : undefined;

  const now = new Date().toISOString();
  const changes = [];

  if (nextStatus) {
    if (!ISSUE_STATUSES.includes(nextStatus)) {
      sendJson(res, 400, { error: 'Invalid status value.' });
      return;
    }
    if (issue.status !== nextStatus) {
      issue.status = nextStatus;
      changes.push(`Status updated to ${nextStatus}`);
    }
  }

  if (nextPriority) {
    if (!PRIORITY_LEVELS.includes(nextPriority)) {
      sendJson(res, 400, { error: 'Invalid priority value.' });
      return;
    }
    if (issue.priority !== nextPriority) {
      issue.priority = nextPriority;
      changes.push(`Priority adjusted to ${nextPriority}`);
    }
  }

  if (nextDepartment) {
    if (!DEPARTMENTS.includes(nextDepartment)) {
      sendJson(res, 400, { error: 'Invalid department value.' });
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

  sendJson(res, 200, { issue });
}

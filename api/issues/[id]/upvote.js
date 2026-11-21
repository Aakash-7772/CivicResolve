import { extractIssueId, issuesStore, sendJson } from '../../_lib/civicServer.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const id = extractIssueId(req);
  const issue = issuesStore.find((item) => item.id === id);
  if (!issue) {
    sendJson(res, 404, { error: 'Ticket not found.' });
    return;
  }

  issue.upvotes += 1;
  issue.updatedAt = new Date().toISOString();
  sendJson(res, 200, { issue });
}

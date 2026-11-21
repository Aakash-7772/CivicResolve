import {
  extractQueryParam,
  issuesStore,
  type VercelRequest,
  type VercelResponse,
} from '../../_lib/civicServer';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const id = extractQueryParam(req, 'id');
  const issue = issuesStore.find((item) => item.id === id);
  if (!issue) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  issue.upvotes += 1;
  issue.updatedAt = new Date().toISOString();
  res.status(200).json({ issue });
}

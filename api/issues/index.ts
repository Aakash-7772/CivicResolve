import {
  classifyIssueRuleBased,
  generateTicketId,
  validateIssueInput,
  type CivicIssue,
  type ClassificationResult,
} from '../../src/lib/civicLogic.js';
import {
  analyzeWithGemini,
  issuesStore,
  parseJsonBody,
  type VercelRequest,
  type VercelResponse,
} from '../_lib/civicServer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const sorted = [...issuesStore].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.status(200).json({ issues: sorted });
    return;
  }

  if (req.method === 'POST') {
    const body = await parseJsonBody(req);
    const validation = validateIssueInput(body);
    if (!validation.valid) {
      res.status(400).json({ error: validation.errors.join(' ') });
      return;
    }

    const { title, description, location, category, imageDataUrl } = validation.sanitized;

    let triage: ClassificationResult;
    try {
      triage = await analyzeWithGemini({
        title,
        description,
        location,
        categoryHint: category,
        imageDataUrl,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gemini AI call failed';
      console.error('[/api/issues] Gemini fallback triggered:', message);
      triage = {
        ...classifyIssueRuleBased({ title, description, location, categoryHint: category }),
        notice: `Gemini AI unavailable (${message}); local rule-based triage applied.`,
      };
    }

    const now = new Date().toISOString();
    const newIssue: CivicIssue = {
      id: generateTicketId(issuesStore, 2026),
      title,
      description,
      location,
      category: triage.category,
      priority: triage.priority,
      department: triage.department,
      status: 'Reported',
      dispatchBrief: triage.dispatchBrief,
      confidence: triage.confidence,
      slaWindow: triage.slaWindow,
      analysisSource: triage.analysisSource,
      upvotes: 1,
      reportedBy: 'Citizen Portal',
      resolutionNotes: '',
      ...(imageDataUrl ? { imageDataUrl } : {}),
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: 'Reported',
          timestamp: now,
          note:
            triage.analysisSource === 'gemini-ai'
              ? 'Triaged via Google Gemini AI and logged to Citizen Portal'
              : 'Triaged via rule-based engine and logged to Citizen Portal',
        },
      ],
    };

    issuesStore.unshift(newIssue);
    res.status(201).json({ issue: newIssue, notice: triage.notice });
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed.' });
}

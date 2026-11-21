import {
  analyzeWithGemini,
  classifyIssueRuleBased,
  generateTicketId,
  issuesStore,
  parseJsonBody,
  sendJson,
  validateIssueInput,
} from '../_lib/civicServer.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const sorted = [...issuesStore].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    sendJson(res, 200, { issues: sorted });
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const validation = validateIssueInput(body);
      if (!validation.valid) {
        sendJson(res, 400, { error: validation.errors.join(' ') });
        return;
      }

      const { title, description, location, category, imageDataUrl } = validation.sanitized;

      let triage;
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
      const newIssue = {
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
      sendJson(res, 201, { issue: newIssue, notice: triage.notice });
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to process civic issue.';
      sendJson(res, 400, { error: message });
      return;
    }
  }

  res.setHeader('Allow', 'GET, POST');
  sendJson(res, 405, { error: 'Method not allowed.' });
}

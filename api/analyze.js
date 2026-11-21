import {
  analyzeWithGemini,
  classifyIssueRuleBased,
  parseJsonBody,
  sendJson,
  validateIssueInput,
} from './_lib/civicServer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const validation = validateIssueInput(body);
    if (!validation.valid) {
      sendJson(res, 400, { error: validation.errors.join(' ') });
      return;
    }

    const { title, description, location, category, imageDataUrl } = validation.sanitized;

    try {
      const analysis = await analyzeWithGemini({
        title,
        description,
        location,
        categoryHint: category,
        imageDataUrl,
      });
      sendJson(res, 200, { analysis });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gemini AI service request failed.';
      console.error('[/api/analyze] Gemini error:', message);
      sendJson(res, 502, {
        error: `Gemini AI analysis unavailable (${message}).`,
        fallbackAnalysis: {
          ...classifyIssueRuleBased({ title, description, location, categoryHint: category }),
          notice: 'Gemini AI upstream call returned an error; local rule-based fallback applied.',
        },
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected request error.';
    sendJson(res, 400, { error: message });
  }
}

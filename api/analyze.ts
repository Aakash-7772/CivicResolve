import { classifyIssueRuleBased, validateIssueInput } from '../src/lib/civicLogic.js';
import {
  analyzeWithGemini,
  parseJsonBody,
  type VercelRequest,
  type VercelResponse,
} from './_lib/civicServer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const body = await parseJsonBody(req);
  const validation = validateIssueInput(body);
  if (!validation.valid) {
    res.status(400).json({ error: validation.errors.join(' ') });
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
    res.status(200).json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gemini AI service request failed.';
    console.error('[/api/analyze] Gemini error:', message);
    res.status(502).json({
      error: `Gemini AI analysis unavailable (${message}).`,
      fallbackAnalysis: {
        ...classifyIssueRuleBased({ title, description, location, categoryHint: category }),
        notice: 'Gemini AI upstream call returned an error; local rule-based fallback applied.',
      },
    });
  }
}

import { getGeminiClient, type VercelRequest, type VercelResponse } from './_lib/civicServer';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  res.status(200).json({
    ok: true,
    geminiConfigured: Boolean(getGeminiClient()),
  });
}

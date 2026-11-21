import { getGeminiApiKey, sendJson } from './_lib/civicServer.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    geminiConfigured: Boolean(getGeminiApiKey()),
  });
}

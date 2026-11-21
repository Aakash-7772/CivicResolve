import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import {
  CIVIC_CATEGORIES,
  PRIORITY_LEVELS,
  ISSUE_STATUSES,
  DEPARTMENTS,
  INITIAL_SEED_ISSUES,
  sanitizeText,
  validateIssueInput,
  classifyIssueRuleBased,
  generateTicketId,
  type CivicIssue,
  type CivicCategory,
  type PriorityLevel,
  type CivicDepartment,
  type IssueStatus,
  type ClassificationResult,
} from './src/lib/civicLogic.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const app = express();

app.use(express.json({ limit: '4mb' }));

// In-memory store seeded with realistic civic issues
const issuesStore: CivicIssue[] = structuredClone(INITIAL_SEED_ISSUES);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function analyzeWithGemini(input: {
  title: string;
  description: string;
  location: string;
  categoryHint: string;
  imageDataUrl?: string;
}): Promise<ClassificationResult> {
  const ai = getGeminiClient();
  if (!ai) {
    const fallback = classifyIssueRuleBased(input);
    return {
      ...fallback,
      notice:
        'GEMINI_API_KEY is not configured in environment variables; using deterministic rule-based triage fallback.',
    };
  }

  const systemInstruction = `You are CivicResolve's municipal AI dispatch analyst. Analyze citizen infrastructure and public-service reports carefully and return structured triage metadata.
- Select exactly one category from: ${CIVIC_CATEGORIES.join(', ')}.
- If the citizen provided a specific valid category hint (${input.categoryHint}), honor it unless clearly contradicted by severe hazard details.
- Select priority from: ${PRIORITY_LEVELS.join(', ')} based on public safety risk, infrastructure failure severity, and proximity to schools/hospitals/highways.
- Recommend exactly one municipal department from: ${DEPARTMENTS.join(', ')}.
- Write a crisp 1-sentence Official Field Dispatch Brief (max 160 characters) with actionable dispatch guidance.
- Provide an integer confidence score between 70 and 99.
- Provide an Estimated Resolution SLA window (e.g. "2–4 Hours", "6–12 Hours", "24–48 Hours", "3–5 Business Days").
- Provide a 1-sentence reasoning summary.`;

  const promptText = `Analyze this civic issue report:
Title: ${input.title}
Location: ${input.location}
Citizen Category Hint: ${input.categoryHint}
Description: ${input.description}`;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  if (input.imageDataUrl) {
    const match = /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(
      input.imageDataUrl
    );
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1] === 'image/jpg' ? 'image/jpeg' : match[1],
          data: match[2],
        },
      });
    }
  }
  parts.push({ text: promptText });

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: { parts },
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: CIVIC_CATEGORIES,
          },
          priority: {
            type: Type.STRING,
            enum: PRIORITY_LEVELS,
          },
          department: {
            type: Type.STRING,
            enum: DEPARTMENTS,
          },
          dispatchBrief: {
            type: Type.STRING,
          },
          confidence: {
            type: Type.INTEGER,
          },
          slaWindow: {
            type: Type.STRING,
          },
          reasoning: {
            type: Type.STRING,
          },
        },
        required: [
          'category',
          'priority',
          'department',
          'dispatchBrief',
          'confidence',
          'slaWindow',
          'reasoning',
        ],
      },
    },
  });

  const rawText = (response.text ?? '{}').trim();
  const parsed = JSON.parse(rawText) as Partial<ClassificationResult>;

  const safeCategory: CivicCategory = CIVIC_CATEGORIES.includes(parsed.category as CivicCategory)
    ? (parsed.category as CivicCategory)
    : classifyIssueRuleBased(input).category;

  const safePriority: PriorityLevel = PRIORITY_LEVELS.includes(parsed.priority as PriorityLevel)
    ? (parsed.priority as PriorityLevel)
    : 'Medium';

  const safeDepartment: CivicDepartment = DEPARTMENTS.includes(parsed.department as CivicDepartment)
    ? (parsed.department as CivicDepartment)
    : classifyIssueRuleBased(input).department;

  const confidenceNum = Number(parsed.confidence);
  const safeConfidence = Number.isFinite(confidenceNum)
    ? Math.max(50, Math.min(99, Math.round(confidenceNum)))
    : 90;

  return {
    category: safeCategory,
    priority: safePriority,
    department: safeDepartment,
    dispatchBrief:
      sanitizeText(parsed.dispatchBrief ?? '', 200) ||
      classifyIssueRuleBased(input).dispatchBrief,
    confidence: safeConfidence,
    slaWindow: sanitizeText(parsed.slaWindow ?? '', 40) || '24–48 Hours',
    reasoning:
      sanitizeText(parsed.reasoning ?? '', 260) ||
      'Triaged via Google Gemini civic dispatch analysis.',
    analysisSource: 'gemini-ai',
  };
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(getGeminiClient()),
  });
});

// List all issues
app.get('/api/issues', (_req, res) => {
  const sorted = [...issuesStore].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ issues: sorted });
});

// AI triage analysis preview endpoint
app.post('/api/analyze', async (req, res) => {
  const validation = validateIssueInput(req.body);
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
    res.json({ analysis });
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
});

// Submit a new civic issue
app.post('/api/issues', async (req, res) => {
  const validation = validateIssueInput(req.body);
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
});

// Admin update status, priority, department, or resolution notes
app.patch('/api/issues/:id', (req, res) => {
  const id = sanitizeText(req.params.id, 32);
  const issue = issuesStore.find((item) => item.id === id);
  if (!issue) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
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

  res.json({ issue });
});

// Community upvote endpoint
app.post('/api/issues/:id/upvote', (req, res) => {
  const id = sanitizeText(req.params.id, 32);
  const issue = issuesStore.find((item) => item.id === id);
  if (!issue) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }
  issue.upvotes += 1;
  issue.updatedAt = new Date().toISOString();
  res.json({ issue });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicResolve server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

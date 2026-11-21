import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import {
  CIVIC_CATEGORIES,
  PRIORITY_LEVELS,
  DEPARTMENTS,
  INITIAL_SEED_ISSUES,
  sanitizeText,
  classifyIssueRuleBased,
  type CivicIssue,
  type CivicCategory,
  type PriorityLevel,
  type CivicDepartment,
  type ClassificationResult,
} from '../../src/lib/civicLogic.js';

export interface VercelRequest extends IncomingMessage {
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
}

export interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => VercelResponse;
}

// Shared warm-container issue store seeded with initial civic reports
const globalStore = globalThis as typeof globalThis & {
  __civicResolveIssuesStore?: CivicIssue[];
};

if (!globalStore.__civicResolveIssuesStore) {
  globalStore.__civicResolveIssuesStore = structuredClone(INITIAL_SEED_ISSUES);
}

export const issuesStore: CivicIssue[] = globalStore.__civicResolveIssuesStore;

export function getGeminiClient(): GoogleGenAI | null {
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

export async function parseJsonBody(req: VercelRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      const parsed = JSON.parse(req.body.toString('utf8'));
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }

  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    const maxBytes = 4 * 1024 * 1024;

    req.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes <= maxBytes) {
        chunks.push(chunk);
      }
    });
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        resolve(parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export function extractQueryParam(req: VercelRequest, key: string): string {
  const raw = req.query?.[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return sanitizeText(value ?? '', 32);
}

export async function analyzeWithGemini(input: {
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

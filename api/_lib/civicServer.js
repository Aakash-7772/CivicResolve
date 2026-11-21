export const CIVIC_CATEGORIES = [
  'Water & Utilities',
  'Electrical & Streetlighting',
  'Sanitation & Waste',
  'Roads & Transportation',
  'Parks & Public Spaces',
  'Public Safety & Hazards',
];

export const PRIORITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];

export const ISSUE_STATUSES = ['Reported', 'In Progress', 'Resolved'];

export const DEPARTMENTS = [
  'Municipal Water & Sewer Authority',
  'Public Works — Electrical Grid Division',
  'Department of Sanitation & Environmental Services',
  'Department of Transportation & Roadways',
  'Parks & Urban Forestry',
  'Emergency Public Safety Response',
];

const CATEGORY_TO_DEPARTMENT = {
  'Water & Utilities': 'Municipal Water & Sewer Authority',
  'Electrical & Streetlighting': 'Public Works — Electrical Grid Division',
  'Sanitation & Waste': 'Department of Sanitation & Environmental Services',
  'Roads & Transportation': 'Department of Transportation & Roadways',
  'Parks & Public Spaces': 'Parks & Urban Forestry',
  'Public Safety & Hazards': 'Emergency Public Safety Response',
};

const INITIAL_SEED_ISSUES = [
  {
    id: 'CR-2026-101',
    title: 'Substation Transformer Oil Leak & Flickering Grid',
    description:
      'Dark oil pooling beneath pole-mounted distribution transformer accompanied by intermittent arcing and voltage drops across three residential blocks.',
    location: '214 Cedar Park Lane, Sector 2',
    category: 'Electrical & Streetlighting',
    priority: 'Critical',
    department: 'Public Works — Electrical Grid Division',
    status: 'In Progress',
    dispatchBrief:
      'Dispatch high-voltage isolation crew to de-energize Sector 2 transformer and contain dielectric oil leak.',
    confidence: 96,
    slaWindow: '2–4 Hours',
    analysisSource: 'gemini-ai',
    upvotes: 28,
    reportedBy: 'Citizen Portal',
    resolutionNotes: 'High-voltage isolation truck en route; perimeter cones deployed.',
    createdAt: '2026-11-20T07:15:00.000Z',
    updatedAt: '2026-11-20T08:40:00.000Z',
    statusHistory: [
      { status: 'Reported', timestamp: '2026-11-20T07:15:00.000Z', note: 'Submitted via Citizen Portal' },
      { status: 'In Progress', timestamp: '2026-11-20T08:40:00.000Z', note: 'Electrical Grid Division crew assigned' },
    ],
  },
  {
    id: 'CR-2026-102',
    title: 'Collapsed Storm Drain Grate on Market Street',
    description:
      'Cast-iron storm drain cover snapped in half at the bike lane edge, leaving an unprotected 3-foot drop into the stormwater culvert.',
    location: '450 Market Street & Pine Alley',
    category: 'Roads & Transportation',
    priority: 'High',
    department: 'Department of Transportation & Roadways',
    status: 'Reported',
    dispatchBrief:
      'Deploy road barricade immediately and schedule structural storm-grate replacement along Market Street bike lane.',
    confidence: 93,
    slaWindow: '6–12 Hours',
    analysisSource: 'gemini-ai',
    upvotes: 19,
    reportedBy: 'Citizen Portal',
    resolutionNotes: '',
    createdAt: '2026-11-20T09:10:00.000Z',
    updatedAt: '2026-11-20T09:10:00.000Z',
    statusHistory: [
      { status: 'Reported', timestamp: '2026-11-20T09:10:00.000Z', note: 'Submitted via Citizen Portal' },
    ],
  },
  {
    id: 'CR-2026-103',
    title: 'Sewage Backflow Odor near Riverside Clinic',
    description:
      'Sanitary manhole emitting raw sewage odor and slow surface seepage outside the outpatient clinic walkway.',
    location: '19 Riverside Drive, South Ward',
    category: 'Water & Utilities',
    priority: 'Critical',
    department: 'Municipal Water & Sewer Authority',
    status: 'In Progress',
    dispatchBrief:
      'Assign hydro-jetting vacuum crew to clear Riverside sanitary trunk blockage and sanitize clinic frontage.',
    confidence: 95,
    slaWindow: '2–4 Hours',
    analysisSource: 'gemini-ai',
    upvotes: 34,
    reportedBy: 'Citizen Portal',
    resolutionNotes: 'Hydro-jetting unit arrived on site; lateral inspection underway.',
    createdAt: '2026-11-20T10:05:00.000Z',
    updatedAt: '2026-11-20T11:20:00.000Z',
    statusHistory: [
      { status: 'Reported', timestamp: '2026-11-20T10:05:00.000Z', note: 'Submitted via Citizen Portal' },
      { status: 'In Progress', timestamp: '2026-11-20T11:20:00.000Z', note: 'Sewer Authority vacuum truck dispatched' },
    ],
  },
  {
    id: 'CR-2026-104',
    title: 'Illegal Construction Debris Dumping at Greenway Trail',
    description:
      'Six pallets of broken drywall, concrete chunks, and scrap lumber dumped across the paved pedestrian path near mile marker 2.',
    location: 'Greenway Multi-Use Trail, Mile Marker 2',
    category: 'Sanitation & Waste',
    priority: 'Medium',
    department: 'Department of Sanitation & Environmental Services',
    status: 'Reported',
    dispatchBrief:
      'Schedule bulk flatbed hauler and code enforcement inspection to clear construction debris from Greenway Trail.',
    confidence: 91,
    slaWindow: '24–48 Hours',
    analysisSource: 'gemini-ai',
    upvotes: 11,
    reportedBy: 'Citizen Portal',
    resolutionNotes: '',
    createdAt: '2026-11-20T12:30:00.000Z',
    updatedAt: '2026-11-20T12:30:00.000Z',
    statusHistory: [
      { status: 'Reported', timestamp: '2026-11-20T12:30:00.000Z', note: 'Submitted via Citizen Portal' },
    ],
  },
  {
    id: 'CR-2026-105',
    title: 'Fallen Oak Limb Blocking Community Park Playground',
    description:
      'Heavy oak branch snapped and resting across playground swing fencing; no injuries reported but area needs clearing.',
    location: 'Willowbrook Community Park, East Lawn',
    category: 'Parks & Public Spaces',
    priority: 'Medium',
    department: 'Parks & Urban Forestry',
    status: 'Resolved',
    dispatchBrief:
      'Dispatch certified arborist crew with chipper to clear fallen oak limb and inspect adjacent playground canopy.',
    confidence: 94,
    slaWindow: '24–48 Hours',
    analysisSource: 'gemini-ai',
    upvotes: 14,
    reportedBy: 'Citizen Portal',
    resolutionNotes: 'Branch sectioned and removed; swing perimeter fence inspected and reopened.',
    createdAt: '2026-11-19T14:20:00.000Z',
    updatedAt: '2026-11-20T06:50:00.000Z',
    statusHistory: [
      { status: 'Reported', timestamp: '2026-11-19T14:20:00.000Z', note: 'Submitted via Citizen Portal' },
      { status: 'In Progress', timestamp: '2026-11-19T16:00:00.000Z', note: 'Urban Forestry arborist team assigned' },
      { status: 'Resolved', timestamp: '2026-11-20T06:50:00.000Z', note: 'Debris cleared and playground reopened' },
    ],
  },
  {
    id: 'CR-2026-106',
    title: 'Malfunctioning Pedestrian Crosswalk Beacon at Transit Hub',
    description:
      'Push-button pedestrian crossing lights stay stuck on red even when walk signal activates during evening rush hour.',
    location: 'Central Station Plaza & 8th Avenue',
    category: 'Public Safety & Hazards',
    priority: 'High',
    department: 'Emergency Public Safety Response',
    status: 'Resolved',
    dispatchBrief:
      'Coordinate signal technician and traffic safety officer to reset Central Station crosswalk controller.',
    confidence: 89,
    slaWindow: '6–12 Hours',
    analysisSource: 'gemini-ai',
    upvotes: 22,
    reportedBy: 'Citizen Portal',
    resolutionNotes: 'Replaced faulty pedestrian relay module and verified signal timing cycle.',
    createdAt: '2026-11-19T17:45:00.000Z',
    updatedAt: '2026-11-20T05:15:00.000Z',
    statusHistory: [
      { status: 'Reported', timestamp: '2026-11-19T17:45:00.000Z', note: 'Submitted via Citizen Portal' },
      { status: 'In Progress', timestamp: '2026-11-19T18:30:00.000Z', note: 'Traffic safety officer and signal tech dispatched' },
      { status: 'Resolved', timestamp: '2026-11-20T05:15:00.000Z', note: 'Relay module replaced and verified' },
    ],
  },
];

// Shared warm-container issue store seeded with initial civic reports
if (!globalThis.__civicResolveIssuesStore) {
  globalThis.__civicResolveIssuesStore = structuredClone(INITIAL_SEED_ISSUES);
}

export const issuesStore = globalThis.__civicResolveIssuesStore;

export function sanitizeText(value, maxLength = 2000) {
  if (typeof value !== 'string') {
    return '';
  }
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function isSafeImageDataUrl(value) {
  if (!value) return true;
  if (typeof value !== 'string') return false;
  if (value.length > 2_800_000) return false;
  return /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value.trim());
}

export function validateIssueInput(payload) {
  const errors = [];
  const raw = payload && typeof payload === 'object' ? payload : {};

  const title = sanitizeText(raw.title ?? '', 140);
  const description = sanitizeText(raw.description ?? '', 2000);
  const location = sanitizeText(raw.location ?? '', 180);
  const categoryInput = sanitizeText(raw.category ?? 'Auto-Detect', 80) || 'Auto-Detect';
  const imageDataUrl = typeof raw.imageDataUrl === 'string' ? raw.imageDataUrl.trim() : '';

  if (title.length < 5) {
    errors.push('Title must be at least 5 characters.');
  }
  if (description.length < 10) {
    errors.push('Description must be at least 10 characters.');
  }
  if (location.length < 3) {
    errors.push('Location must be at least 3 characters.');
  }
  if (categoryInput !== 'Auto-Detect' && !CIVIC_CATEGORIES.includes(categoryInput)) {
    errors.push('Selected category is invalid.');
  }
  if (imageDataUrl && !isSafeImageDataUrl(imageDataUrl)) {
    errors.push('Uploaded image must be a valid PNG, JPEG, WEBP, or GIF under 2MB.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      title,
      description,
      location,
      category: categoryInput,
      imageDataUrl: imageDataUrl && isSafeImageDataUrl(imageDataUrl) ? imageDataUrl : '',
    },
  };
}

export function classifyIssueRuleBased({
  title = '',
  description = '',
  location = '',
  categoryHint = 'Auto-Detect',
}) {
  const cleanTitle = sanitizeText(title, 140);
  const cleanDescription = sanitizeText(description, 2000);
  const cleanLocation = sanitizeText(location, 180);
  const combined = `${cleanTitle} ${cleanDescription} ${cleanLocation}`.toLowerCase();

  const categoryRules = [
    {
      category: 'Electrical & Streetlighting',
      keywords: [
        'wire', 'electrical', 'electric', 'streetlight', 'street light', 'transformer',
        'power', 'sparking', 'outage', 'pole', 'cable', 'blackout', 'voltage', 'arcing',
      ],
    },
    {
      category: 'Water & Utilities',
      keywords: [
        'water', 'main', 'pipe', 'leak', 'flood', 'flooding', 'sewage',
        'sewer', 'hydrant', 'drainage', 'burst', 'pressure', 'manhole', 'valve',
      ],
    },
    {
      category: 'Sanitation & Waste',
      keywords: [
        'garbage', 'trash', 'waste', 'dump', 'dumping', 'bin', 'landfill',
        'debris', 'odor', 'pest', 'sanitation', 'litter', 'recycling',
      ],
    },
    {
      category: 'Roads & Transportation',
      keywords: [
        'pothole', 'highway', 'road', 'asphalt', 'pavement', 'bridge', 'lane',
        'traffic', 'sidewalk', 'curb', 'sinkhole', 'crosswalk', 'merge', 'drain grate',
      ],
    },
    {
      category: 'Parks & Public Spaces',
      keywords: [
        'park', 'tree', 'limb', 'branch', 'playground', 'bench', 'trail',
        'lawn', 'fountain', 'greenway', 'forestry',
      ],
    },
    {
      category: 'Public Safety & Hazards',
      keywords: [
        'hazard', 'danger', 'emergency', 'fire', 'gas', 'beacon', 'signal',
        'collapse', 'fallen', 'school', 'hospital', 'pedestrian', 'unsafe',
      ],
    },
  ];

  let matchedCategory =
    categoryHint && categoryHint !== 'Auto-Detect' && CIVIC_CATEGORIES.includes(categoryHint)
      ? categoryHint
      : 'Public Safety & Hazards';
  let bestScore = 0;

  if (!categoryHint || categoryHint === 'Auto-Detect') {
    for (const rule of categoryRules) {
      let score = 0;
      for (const kw of rule.keywords) {
        if (combined.includes(kw)) {
          score += kw.includes(' ') ? 2 : 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        matchedCategory = rule.category;
      }
    }
  } else {
    bestScore = 3;
  }

  const criticalTriggers = [
    'live wire', 'sparking', 'electrocution', 'burst', 'ruptured', 'flooding',
    'sinkhole', 'gas leak', 'collapse', 'sewage', 'arcing', 'transformer',
    'hospital', 'emergency',
  ];
  const highTriggers = [
    'school', 'highway', 'deep pothole', 'crater', 'broken streetlight', 'dark',
    'overflowing', 'traffic', 'blowout', 'unsafe', 'blocked', 'beacon',
  ];
  const lowTriggers = ['minor', 'cosmetic', 'faded', 'paint', 'bench', 'litter', 'trimming'];

  let priority = 'Medium';
  if (criticalTriggers.some((kw) => combined.includes(kw))) {
    priority = 'Critical';
  } else if (highTriggers.some((kw) => combined.includes(kw))) {
    priority = 'High';
  } else if (lowTriggers.some((kw) => combined.includes(kw))) {
    priority = 'Low';
  }

  const department = CATEGORY_TO_DEPARTMENT[matchedCategory] || 'Emergency Public Safety Response';

  const slaByPriority = {
    Critical: '2–4 Hours',
    High: '6–12 Hours',
    Medium: '24–48 Hours',
    Low: '5–7 Business Days',
  };

  const actionVerbByPriority = {
    Critical: 'Dispatch emergency response unit immediately',
    High: 'Assign priority field crew',
    Medium: 'Schedule municipal inspection and repair team',
    Low: 'Queue routine maintenance unit',
  };

  const targetLocation = cleanLocation || 'reported site';
  const shortSubject = cleanTitle ? cleanTitle.toLowerCase() : matchedCategory.toLowerCase();
  const dispatchBrief = `${actionVerbByPriority[priority]} to ${targetLocation} to mitigate ${shortSubject}.`;

  const confidence = Math.min(96, 76 + bestScore * 4 + (priority === 'Critical' ? 3 : 0));

  return {
    category: matchedCategory,
    priority,
    department,
    dispatchBrief: dispatchBrief.slice(0, 200),
    confidence,
    slaWindow: slaByPriority[priority],
    reasoning: `Classified via rule-based triage matching ${matchedCategory} indicators and ${priority.toLowerCase()} public impact signals.`,
    analysisSource: 'rule-based-fallback',
  };
}

export function generateTicketId(existingIssues = [], year = 2026) {
  const prefix = `CR-${year}-`;
  let maxNum = 100;
  for (const issue of existingIssues) {
    if (issue && typeof issue.id === 'string' && issue.id.startsWith(prefix)) {
      const parsed = Number.parseInt(issue.id.slice(prefix.length), 10);
      if (Number.isFinite(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
  }
  return `${prefix}${maxNum + 1}`;
}

export function getGeminiApiKey() {
  const apiKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY?.trim() : '';
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return '';
  }
  return apiKey;
}

export function sendJson(res, statusCode, payload) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(payload);
    return;
  }
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

export async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      const parsed = JSON.parse(req.body.toString('utf8'));
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  try {
    const chunks = [];
    let totalBytes = 0;
    const maxBytes = 4 * 1024 * 1024;
    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += buf.length;
      if (totalBytes <= maxBytes) {
        chunks.push(buf);
      }
    }
    if (chunks.length === 0) return {};
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function extractIssueId(req) {
  const raw = req.query?.id;
  const fromQuery = Array.isArray(raw) ? raw[0] : raw;
  if (fromQuery) {
    return sanitizeText(String(fromQuery), 32);
  }
  const pathname = String(req.url || '').split('?')[0];
  const segments = pathname.split('/').filter(Boolean);
  const issuesIndex = segments.indexOf('issues');
  if (issuesIndex !== -1 && segments[issuesIndex + 1]) {
    return sanitizeText(decodeURIComponent(segments[issuesIndex + 1]), 32);
  }
  return '';
}

export async function analyzeWithGemini(input) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
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

  const parts = [];
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

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-4-hydrogen:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'User-Agent': 'aistudio-build',
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: 'LOW' },
          responseSchema: {
            type: 'OBJECT',
            properties: {
              category: { type: 'STRING', enum: CIVIC_CATEGORIES },
              priority: { type: 'STRING', enum: PRIORITY_LEVELS },
              department: { type: 'STRING', enum: DEPARTMENTS },
              dispatchBrief: { type: 'STRING' },
              confidence: { type: 'INTEGER' },
              slaWindow: { type: 'STRING' },
              reasoning: { type: 'STRING' },
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
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Gemini API HTTP ${response.status}${errText ? `: ${errText.slice(0, 120)}` : ''}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
  const parsed = JSON.parse(rawText);

  const safeCategory = CIVIC_CATEGORIES.includes(parsed.category)
    ? parsed.category
    : classifyIssueRuleBased(input).category;

  const safePriority = PRIORITY_LEVELS.includes(parsed.priority)
    ? parsed.priority
    : 'Medium';

  const safeDepartment = DEPARTMENTS.includes(parsed.department)
    ? parsed.department
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

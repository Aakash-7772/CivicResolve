import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  CIVIC_CATEGORIES,
  DEMO_PRESETS,
  INITIAL_SEED_ISSUES,
  classifyIssueRuleBased,
  computeTelemetry,
  detectPotentialDuplicates,
  formatAuditReportCsv,
  generateTicketId,
  isSafeImageDataUrl,
  sanitizeText,
  validateIssueInput,
} from '../src/lib/civicLogic.js';

const ROOT_DIR = process.cwd();

test('1. Rule-based classifier routes burst water main to Critical Water & Utilities', () => {
  const preset = DEMO_PRESETS.find((p) => p.id === 'preset-water-main');
  assert.ok(preset);
  const result = classifyIssueRuleBased({
    title: preset.title,
    description: preset.description,
    location: preset.location,
  });
  assert.equal(result.category, 'Water & Utilities');
  assert.equal(result.priority, 'Critical');
  assert.equal(result.department, 'Municipal Water & Sewer Authority');
  assert.equal(result.slaWindow, '2–4 Hours');
  assert.ok(result.confidence >= 80 && result.confidence <= 99);
  assert.ok(result.dispatchBrief.length > 20);
});

test('2. Rule-based classifier routes exposed live electrical wire to Critical Electrical Grid', () => {
  const preset = DEMO_PRESETS.find((p) => p.id === 'preset-live-wire');
  assert.ok(preset);
  const result = classifyIssueRuleBased({
    title: preset.title,
    description: preset.description,
    location: preset.location,
  });
  assert.equal(result.category, 'Electrical & Streetlighting');
  assert.equal(result.priority, 'Critical');
  assert.equal(result.department, 'Public Works — Electrical Grid Division');
});

test('3. Rule-based classifier routes overflowing garbage near school to High Sanitation', () => {
  const preset = DEMO_PRESETS.find((p) => p.id === 'preset-garbage-school');
  assert.ok(preset);
  const result = classifyIssueRuleBased({
    title: preset.title,
    description: preset.description,
    location: preset.location,
  });
  assert.equal(result.category, 'Sanitation & Waste');
  assert.equal(result.priority, 'High');
  assert.equal(result.department, 'Department of Sanitation & Environmental Services');
});

test('4. Rule-based classifier routes deep highway pothole to High Roads & Transportation', () => {
  const preset = DEMO_PRESETS.find((p) => p.id === 'preset-highway-pothole');
  assert.ok(preset);
  const result = classifyIssueRuleBased({
    title: preset.title,
    description: preset.description,
    location: preset.location,
  });
  assert.equal(result.category, 'Roads & Transportation');
  assert.equal(result.priority, 'High');
  assert.equal(result.department, 'Department of Transportation & Roadways');
});

test('5. Rule-based classifier assigns Low priority to minor cosmetic park maintenance', () => {
  const result = classifyIssueRuleBased({
    title: 'Minor faded paint on park bench',
    description: 'Cosmetic chipped paint on a wooden bench along the north park lawn.',
    location: 'North Willow Park',
  });
  assert.equal(result.category, 'Parks & Public Spaces');
  assert.equal(result.priority, 'Low');
  assert.equal(result.slaWindow, '5–7 Business Days');
});

test('6. Explicit category hint overrides keyword auto-detection when valid', () => {
  const result = classifyIssueRuleBased({
    title: 'Broken wooden railing near river trail',
    description: 'Railing splintered along the pedestrian path.',
    location: 'Riverwalk Mile 1',
    categoryHint: 'Public Safety & Hazards',
  });
  assert.equal(result.category, 'Public Safety & Hazards');
  assert.equal(result.department, 'Emergency Public Safety Response');
});

test('7. Input validation rejects short titles, short descriptions, and invalid categories', () => {
  const invalid = validateIssueInput({
    title: 'Bad',
    description: 'Too short',
    location: 'A',
    category: 'NonExistentCategory',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.length >= 4);
});

test('8. Input validation accepts clean civic complaint payloads', () => {
  const valid = validateIssueInput({
    title: 'Damaged traffic bollard at intersection',
    description: 'Metal bollard knocked flat onto pedestrian curb creating trip hazard.',
    location: '5th Ave & Elm Street',
    category: 'Roads & Transportation',
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);
  assert.ok(CIVIC_CATEGORIES.includes(valid.sanitized.category));
});

test('9. XSS sanitizer strips script tags, event handlers, and javascript: URIs', () => {
  const dirty = `<script>alert("xss")</script><img src=x onerror=alert(1)> javascript:void(0) Broken Drain`;
  const clean = sanitizeText(dirty);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('onerror='), false);
  assert.equal(clean.toLowerCase().includes('javascript:'), false);
  assert.ok(clean.includes('Broken Drain'));
});

test('10. Image data URL validator blocks SVG XSS payloads and external URLs while allowing PNG base64', () => {
  assert.equal(isSafeImageDataUrl('data:image/svg+xml;base64,PHN2Zz4='), false);
  assert.equal(isSafeImageDataUrl('https://evil.example/tracker.png'), false);
  assert.equal(isSafeImageDataUrl('javascript:alert(1)'), false);
  assert.equal(isSafeImageDataUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='), true);
});

test('11. CSV audit formatter prevents CSV formula injection attacks', () => {
  const csv = formatAuditReportCsv([
    {
      ...INITIAL_SEED_ISSUES[0],
      title: '=CMD("calc")',
      location: '+1+1',
      dispatchBrief: '@SUM(A1:A2)',
    },
  ]);
  assert.ok(csv.includes("'=CMD"));
  assert.ok(csv.includes("'+1+1"));
  assert.ok(csv.includes("'@SUM(A1:A2)"));
});

test('12. Sequential Ticket ID generator increments highest CR-2026-XXX number without collisions', () => {
  const nextId = generateTicketId(INITIAL_SEED_ISSUES, 2026);
  assert.equal(nextId, 'CR-2026-107');
  assert.equal(generateTicketId([], 2026), 'CR-2026-101');
});

test('13. Duplicate detector flags active matching nearby reports and skips Resolved tickets', () => {
  const activeMatches = detectPotentialDuplicates(
    {
      title: 'Transformer Oil Leak & Flickering Grid',
      location: 'Cedar Park Lane Sector 2',
      description: 'Voltage drops and transformer oil leak on Cedar Park.',
    },
    INITIAL_SEED_ISSUES
  );
  assert.ok(activeMatches.length >= 1);
  assert.equal(activeMatches[0].issue.id, 'CR-2026-101');

  const resolvedMatches = detectPotentialDuplicates(
    {
      title: 'Fallen Oak Limb Blocking Community Park Playground',
      location: 'Willowbrook Community Park',
      description: 'Oak branch resting on swing fencing.',
    },
    INITIAL_SEED_ISSUES
  );
  assert.equal(resolvedMatches.some((m) => m.issue.id === 'CR-2026-105'), false);
});

test('14. Telemetry calculator dynamically updates KPIs and department workload bars', () => {
  const base = computeTelemetry(INITIAL_SEED_ISSUES);
  assert.equal(base.totalIssues, 6);
  assert.equal(base.criticalAlerts, 2);
  assert.equal(base.inProgressCount, 2);
  assert.equal(base.resolvedCount, 2);
  assert.equal(base.resolutionRate, 33);

  const updatedIssues = INITIAL_SEED_ISSUES.map((issue) =>
    issue.id === 'CR-2026-101' ? { ...issue, status: 'Resolved' } : issue
  );
  const afterResolve = computeTelemetry(updatedIssues);
  assert.equal(afterResolve.criticalAlerts, 1);
  assert.equal(afterResolve.resolvedCount, 3);
  assert.equal(afterResolve.resolutionRate, 50);
});

test('15. Security scan: no hardcoded Google/Gemini API keys exist in source or server files', () => {
  const filesToInspect = [
    'server.ts',
    'src/App.tsx',
    'src/lib/civicLogic.js',
    'src/components/IssueForm.tsx',
    'api/_lib/civicServer.js',
  ];
  for (const relPath of filesToInspect) {
    const content = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
    assert.equal(/AIza[0-9A-Za-z_-]{20,}/.test(content), false, `Found hardcoded key in ${relPath}`);
  }
});

test('16. Accessibility & HTML landmark structure check on index.html, App.tsx, and IssueForm.tsx', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('<title>CivicResolve'));
  assert.ok(indexHtml.includes('lang="en"'));

  const appTsx = fs.readFileSync(path.join(ROOT_DIR, 'src/App.tsx'), 'utf8');
  assert.ok(appTsx.includes('Skip to main content'));
  assert.ok(appTsx.includes('<header'));
  assert.ok(appTsx.includes('<nav'));
  assert.ok(appTsx.includes('<main'));
  assert.ok(appTsx.includes('<footer'));

  const formTsx = fs.readFileSync(
    path.join(ROOT_DIR, 'src/components/IssueForm.tsx'),
    'utf8'
  );
  assert.ok(formTsx.includes('htmlFor="issue-title"'));
  assert.ok(formTsx.includes('htmlFor="issue-location"'));
  assert.ok(formTsx.includes('htmlFor="issue-category"'));
  assert.ok(formTsx.includes('htmlFor="issue-description"'));
  assert.ok(formTsx.includes('aria-label='));
});

test('17. Modular component decomposition and Vercel security/cache headers check', () => {
  const requiredComponents = [
    'src/components/TelemetryBar.tsx',
    'src/components/IssueForm.tsx',
    'src/components/IssueTracker.tsx',
    'src/components/AdminConsole.tsx',
    'src/components/DepartmentWorkload.tsx',
  ];
  for (const compPath of requiredComponents) {
    const content = fs.readFileSync(path.join(ROOT_DIR, compPath), 'utf8');
    assert.ok(content.includes('/**'), `Missing JSDoc in ${compPath}`);
  }

  const vercelConfig = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'vercel.json'), 'utf8'));
  const allHeaders = vercelConfig.headers.flatMap((entry) => entry.headers);
  const headerKeys = new Set(allHeaders.map((h) => h.key));
  assert.ok(headerKeys.has('X-Content-Type-Options'));
  assert.ok(headerKeys.has('X-Frame-Options'));
  assert.ok(headerKeys.has('Referrer-Policy'));
  assert.ok(headerKeys.has('Cache-Control'));
});

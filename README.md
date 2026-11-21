# CivicResolve — AI-Powered Civic Issue Reporting & Management Platform

## Problem Statement

> "Build CivicResolve, an AI-powered civic issue reporting and management platform that simplifies how citizens report local infrastructure and public-service issues. Your application should allow citizens to report civic problems through a simple interface. Using AI capabilities powered by Google Gemini, the platform should intelligently understand the reported issue, categorize it, identify its urgency, and recommend the appropriate department for handling it. Create a functional prototype that demonstrates how a reported civic issue can move from submission to tracking and resolution.
> Expected Features:
> - Citizen Issue Reporting: Allow users to submit civic complaints with a title, description, location, category, and optional image.
> - AI-Powered Classification: Use Google Gemini to analyze complaints and automatically identify the issue category.
> - Priority Detection: Classify issues based on urgency and potential public impact.
> - Department Recommendation: Suggest the appropriate department based on the reported issue.
> - Issue Tracking Dashboard: Display submitted complaints with their status, such as Reported, In Progress, and Resolved.
> - Admin Dashboard: Provide an interface for administrators to review complaints, update statuses, and manage reported issues."

---

## How CivicResolve Solves It

CivicResolve bridges citizens and municipal operations in a single dark-slate SaaS console:

1. **Frictionless Citizen Intake with 1-Click Demo Presets & Duplicate Guard**: Citizens report issues with a title, street/landmark location, description, optional category override, and optional field photo. Real-time duplicate detection warns users about matching active nearby tickets and lets them upvote existing reports instead of creating duplicates.
2. **Server-Side Google Gemini AI Triage (`gemini-4-hydrogen`)**: Submitted text and optional field photos are analyzed server-side via the `@google/genai` SDK using a strict JSON `responseSchema`. Gemini returns the normalized **Issue Category**, **Priority** (`Critical`, `High`, `Medium`, `Low`), **Recommended Municipal Department**, a 1-sentence **Official Field Dispatch Brief**, **AI Confidence %**, and an **Estimated Resolution SLA** window. When no API key is configured at runtime, CivicResolve degrades transparently to a deterministic rule-based classifier so the live application never crashes.
3. **Live Issue Tracking & Community Upvoting**: Every report receives a sequential tracking ID (e.g., `CR-2026-107`). Citizens and dispatchers can search by Ticket ID, filter by status/priority/department, upvote urgent hazards, and inspect full audit timelines.
4. **Administrator Dispatch Console & Live Telemetry**: Municipal admins review complaints, transition tickets from `Reported` → `In Progress` → `Resolved`, override priority or department routing, and save official resolution notes—immediately updating top-level KPI metrics, department workload progress bars, and downloadable CSV/printable audit reports.

---

## Requirement Traceability Table

| Requirement | Implementation in CivicResolve | Location |
| --- | --- | --- |
| Citizen Issue Reporting (title, description, location, category, optional image) | Accessible form with `<label>` bindings, MIME/size-checked photo upload, and validation | `src/components/CitizenReportPanel.tsx`, `src/lib/civicLogic.js` |
| AI-Powered Classification | Server-side Gemini `gemini-4-hydrogen` structured JSON schema + deterministic fallback | `server.ts` (`/api/analyze`, `/api/issues`), `src/lib/civicLogic.js` |
| Priority Detection | `Critical` / `High` / `Medium` / `Low` scoring based on public safety & infrastructure risk | `server.ts`, `src/components/StatusIndicator.tsx` |
| Department Recommendation | Automated routing across 6 municipal divisions (`Water`, `Electrical`, `Sanitation`, `Roads`, `Parks`, `Public Safety`) | `server.ts`, `src/lib/civicLogic.js` |
| Issue Tracking Dashboard | Searchable, filterable, sortable table + Ticket Detail Audit Drawer | `src/components/IssueTrackerView.tsx`, `src/components/TicketDetailDrawer.tsx` |
| Admin Dashboard | Inline status transitions, priority/department overrides, and resolution notes | `src/components/AdminConsoleView.tsx`, `server.ts` (`PATCH /api/issues/:id`) |
| 1-Click Demo Presets | 4 realistic civic scenarios auto-filling the form & triggering live AI triage | `DEMO_PRESETS` in `src/lib/civicLogic.js`, `src/components/CitizenReportPanel.tsx` |
| AI Dispatch Brief, Confidence % & SLA | Structured triage fields rendered in AI Preview and Ticket Detail Drawer | `server.ts`, `src/components/CitizenReportPanel.tsx` |
| Duplicate Warning & Community Upvotes | Token/location similarity detector with inline upvote button | `detectPotentialDuplicates` in `src/lib/civicLogic.js`, `/api/issues/:id/upvote` |
| Live Civic Telemetry & Department Bars | Dynamic KPI cards + Active vs Resolved horizontal workload bars | `src/components/TelemetryStrip.tsx` |
| Ticket Tracking ID & Audit Export | Sequential `CR-2026-XXX` IDs, formula-safe CSV download, and Print view | `formatAuditReportCsv` in `src/lib/civicLogic.js`, `src/App.tsx` |

---

## Google Services Used

- **Google Gemini API (`@google/genai` SDK, model `gemini-4-hydrogen`)**: Server-side multimodal (text + optional image) structured JSON triage for civic issue categorization, urgency classification, department recommendation, dispatch brief generation, confidence scoring, and SLA estimation.

---

## System Architecture

```
+-------------------------------------------------------------------+
|                        Browser Client (React 19)                  |
|                                                                   |
|  [Citizen Report Form]   [Issue Tracker]   [Admin Console]        |
|   - 1-Click Presets       - ID/Facet Filter - Status Transitions  |
|   - Duplicate Guard       - Upvote Counter  - Resolution Notes    |
|   - Local Fallback        - Audit Drawer    - CSV / Print Export  |
+---------------------------------+---------------------------------+
                                  | HTTP JSON (/api/*)
                                  v
+-------------------------------------------------------------------+
|                  Express Server (server.ts :3000)                 |
|                                                                   |
|  - Input Validation & XSS Sanitization (src/lib/civicLogic.js)    |
|  - Ticket Store & Audit History (CR-2026-XXX)                     |
|  - /api/analyze & /api/issues -> Server-Side AI Triage            |
+-------------------+-----------------------------+-----------------+
                    |                             | (if key unset/offline)
                    v                             v
+---------------------------------+   +-----------------------------+
|   Google Gemini API             |   | Deterministic Rule-Based    |
|   @google/genai                 |   | Classifier Fallback         |
|   Model: gemini-4-hydrogen      |   | (src/lib/civicLogic.js)     |
|   Auth: process.env.GEMINI_API_KEY  +-----------------------------+
+---------------------------------+
```

---

## Setup & Testing Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` (or configure secrets in your runtime environment):

```bash
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

*Note: Never commit real API keys. If `GEMINI_API_KEY` is omitted during local testing, CivicResolve transparently activates its rule-based fallback classifier.*

### 2. Install & Run

```bash
npm install
npm run dev
```

The application serves on `http://localhost:3000`.

### 3. Build, Type-Check & Automated Tests

```bash
npm run lint
npm run build
npm test
```

The automated test suite (`tests/app.test.js`) uses Node's built-in `node:test` and `node:assert` modules to verify classification accuracy, input validation, XSS/CSV-injection sanitization, duplicate detection, telemetry math, secret hygiene, and semantic HTML accessibility.

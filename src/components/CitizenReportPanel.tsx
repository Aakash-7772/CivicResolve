import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Cpu,
  FileImage,
  Loader2,
  Send,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import {
  CIVIC_CATEGORIES,
  DEMO_PRESETS,
  detectPotentialDuplicates,
  isSafeImageDataUrl,
  validateIssueInput,
  type CivicIssue,
  type ClassificationResult,
  type DemoPreset,
} from '../lib/civicLogic.js';
import { PriorityIndicator, StatusIndicator } from './StatusIndicator.tsx';

interface CitizenReportPanelProps {
  issues: CivicIssue[];
  onAnalyzePreview: (draft: {
    title: string;
    location: string;
    category: string;
    description: string;
    imageDataUrl: string;
  }) => Promise<ClassificationResult>;
  onSubmitIssue: (draft: {
    title: string;
    location: string;
    category: string;
    description: string;
    imageDataUrl: string;
  }) => Promise<{ issue: CivicIssue; notice?: string }>;
  onUpvote: (id: string) => void;
  onInspectIssue: (issue: CivicIssue) => void;
  onOpenTracker: () => void;
}

export function CitizenReportPanel({
  issues,
  onAnalyzePreview,
  onSubmitIssue,
  onUpvote,
  onInspectIssue,
  onOpenTracker,
}: CitizenReportPanelProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Auto-Detect');
  const [description, setDescription] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [imageName, setImageName] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [analysisPreview, setAnalysisPreview] = useState<ClassificationResult | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<CivicIssue | null>(null);
  const [submitNotice, setSubmitNotice] = useState('');

  const duplicateMatches = useMemo(
    () => detectPotentialDuplicates({ title, description, location }, issues),
    [title, description, location, issues]
  );

  const recentIssues = useMemo(() => issues.slice(0, 4), [issues]);

  async function runPreview(draft: {
    title: string;
    location: string;
    category: string;
    description: string;
    imageDataUrl: string;
  }) {
    const check = validateIssueInput(draft);
    if (!check.valid) {
      setFormError(check.errors[0]);
      return;
    }
    setFormError('');
    setIsAnalyzing(true);
    try {
      const result = await onAnalyzePreview(check.sanitized);
      setAnalysisPreview(result);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to analyze report.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handlePresetClick(preset: DemoPreset) {
    setSubmittedTicket(null);
    setSubmitNotice('');
    setFormError('');
    setTitle(preset.title);
    setLocation(preset.location);
    setCategory(preset.category);
    setDescription(preset.description);

    await runPreview({
      title: preset.title,
      location: preset.location,
      category: preset.category,
      description: preset.description,
      imageDataUrl,
    });
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('Please select a PNG, JPEG, WEBP, or GIF image.');
      event.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError('Image must be 2MB or smaller.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!isSafeImageDataUrl(result)) {
        setFormError('Unsupported or invalid image encoding.');
        return;
      }
      setFormError('');
      setImageDataUrl(result);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const check = validateIssueInput({
      title,
      location,
      category,
      description,
      imageDataUrl,
    });
    if (!check.valid) {
      setFormError(check.errors.join(' '));
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    try {
      const { issue, notice } = await onSubmitIssue(check.sanitized);
      setSubmittedTicket(issue);
      setSubmitNotice(notice ?? '');
      setAnalysisPreview({
        category: issue.category,
        priority: issue.priority,
        department: issue.department,
        dispatchBrief: issue.dispatchBrief,
        confidence: issue.confidence,
        slaWindow: issue.slaWindow,
        reasoning: 'Confirmed and logged to the municipal dispatch queue.',
        analysisSource: issue.analysisSource,
        notice,
      });
      setTitle('');
      setLocation('');
      setCategory('Auto-Detect');
      setDescription('');
      setImageDataUrl('');
      setImageName('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit civic issue.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Citizen Issue Reporting Form */}
      <section
        aria-labelledby="report-form-heading"
        className="lg:col-span-7 bg-[#111827] border border-[#1E293B] rounded-lg p-6 space-y-6"
      >
        <div className="space-y-1 pb-4 border-b border-[#1E293B]">
          <h1 id="report-form-heading" className="text-xl font-semibold text-[#F8FAFC]">
            Report a Civic Infrastructure Issue
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Submit local infrastructure or public-service complaints for automated Google Gemini triage, priority scoring, and municipal department routing.
          </p>
        </div>

        {/* 1-Click Demo Presets */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#94A3B8]">
              Quick Demo Presets (Auto-fills & runs AI triage)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset)}
                aria-label={`Fill demo preset: ${preset.label}`}
                className="text-left px-3 py-2 text-xs font-medium rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors truncate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duplicate Issue Warning */}
        {duplicateMatches.length > 0 && (
          <div
            role="status"
            aria-live="polite"
            className="bg-[#0B0F19] border border-[#F59E0B]/60 rounded-md p-4 space-y-3"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-[#F59E0B]">
                  Potential Duplicate Reports Nearby
                </p>
                <p className="text-xs text-[#94A3B8]">
                  Active tickets match your title or location. Upvote an existing report to elevate urgency instead of creating duplicates.
                </p>
              </div>
            </div>
            <ul className="space-y-2 divide-y divide-[#1E293B]">
              {duplicateMatches.map(({ issue, similarity, reason }) => (
                <li key={issue.id} className="pt-2 first:pt-0 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-xs font-medium text-[#F8FAFC] truncate">
                      <span className="font-mono text-[#3B82F6] mr-2">{issue.id}</span>
                      {issue.title}
                    </div>
                    <div className="text-xs text-[#94A3B8] truncate">
                      {issue.location} · {reason} ({similarity}% match)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpvote(issue.id)}
                    aria-label={`Upvote existing issue ${issue.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#111827] border border-[#1E293B] text-[#F8FAFC] hover:border-[#3B82F6] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 text-[#3B82F6]" aria-hidden="true" />
                    <span>Upvote ({issue.upvotes})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirmation Banner after Submission */}
        {submittedTicket && (
          <div
            role="status"
            aria-live="polite"
            className="bg-[#0B0F19] border border-[#10B981]/60 rounded-md p-4 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#10B981]">
                Report Dispatched — Tracking ID {submittedTicket.id}
              </p>
              <p className="text-xs text-[#94A3B8]">
                Assigned to {submittedTicket.department} ({submittedTicket.priority} priority · SLA {submittedTicket.slaWindow}).
                {submitNotice ? ` ${submitNotice}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenTracker}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#111827] border border-[#1E293B] text-[#F8FAFC] hover:border-[#3B82F6] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              <span>Track Ticket</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {formError && (
          <div
            role="alert"
            className="bg-[#0B0F19] border border-[#EF4444]/60 rounded-md p-3 text-xs text-[#EF4444]"
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="issue-title" className="block text-xs font-medium text-[#F8FAFC]">
              Issue Title <span className="text-[#EF4444]" aria-hidden="true">*</span>
            </label>
            <input
              id="issue-title"
              name="title"
              type="text"
              required
              maxLength={140}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Burst Water Main Flooding Oakridge Junction"
              className="w-full px-3.5 py-2.5 text-sm rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="issue-location" className="block text-xs font-medium text-[#F8FAFC]">
                Street Address or Landmark <span className="text-[#EF4444]" aria-hidden="true">*</span>
              </label>
              <input
                id="issue-location"
                name="location"
                type="text"
                required
                maxLength={180}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Oakridge Ave & 4th Street"
                className="w-full px-3.5 py-2.5 text-sm rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="issue-category" className="block text-xs font-medium text-[#F8FAFC]">
                Category (Optional Override)
              </label>
              <select
                id="issue-category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="Auto-Detect">Auto-Detect via Gemini AI</option>
                {CIVIC_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="issue-description" className="block text-xs font-medium text-[#F8FAFC]">
              Detailed Description <span className="text-[#EF4444]" aria-hidden="true">*</span>
            </label>
            <textarea
              id="issue-description"
              name="description"
              required
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the hazard severity, impact on traffic/pedestrians, and nearby landmarks..."
              className="w-full px-3.5 py-2.5 text-sm rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="issue-image" className="block text-xs font-medium text-[#F8FAFC]">
              Field Photo (Optional, PNG/JPG/WEBP max 2MB)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="issue-image"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] hover:border-[#3B82F6] cursor-pointer transition-colors"
              >
                <FileImage className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
                <span>{imageName ? `Selected: ${imageName}` : 'Attach Photo'}</span>
              </label>
              <input
                id="issue-image"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleImageChange}
                className="sr-only"
              />
              {imageDataUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setImageDataUrl('');
                    setImageName('');
                  }}
                  aria-label="Remove attached photo"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md text-[#EF4444] hover:bg-[#0B0F19] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Remove</span>
                </button>
              )}
            </div>
            {imageDataUrl && (
              <img
                src={imageDataUrl}
                alt="Preview of attached civic issue evidence"
                referrerPolicy="no-referrer"
                className="mt-2 h-32 w-48 object-cover rounded-md border border-[#1E293B]"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
            <button
              type="button"
              disabled={isAnalyzing || isSubmitting}
              onClick={() =>
                runPreview({
                  title,
                  location,
                  category,
                  description,
                  imageDataUrl,
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] hover:border-[#3B82F6] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#3B82F6]" aria-hidden="true" />
              ) : (
                <Cpu className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />
              )}
              <span>{isAnalyzing ? 'Analyzing...' : 'Preview AI Triage'}</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-md bg-[#3B82F6] text-[#F8FAFC] hover:bg-[#2563EB] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{isSubmitting ? 'Dispatching...' : 'Submit & Dispatch Issue'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Right Column: Live AI Triage Assessment + Recent Feed */}
      <aside
        aria-labelledby="ai-triage-heading"
        className="lg:col-span-5 bg-[#111827] border border-[#1E293B] rounded-lg p-6 space-y-6"
      >
        <div className="space-y-1 pb-4 border-b border-[#1E293B]">
          <div className="flex items-center justify-between gap-2">
            <h2 id="ai-triage-heading" className="text-base font-semibold text-[#F8FAFC]">
              AI Triage & Dispatch Preview
            </h2>
            {analysisPreview && (
              <span className="text-xs font-mono tabular-nums text-[#94A3B8]">
                {analysisPreview.confidence}% confidence
              </span>
            )}
          </div>
          <p className="text-xs text-[#94A3B8]">
            Automated category, priority urgency, SLA target, and official field dispatch brief.
          </p>
        </div>

        {isAnalyzing ? (
          <div className="space-y-4 py-4" aria-live="polite">
            <div className="h-4 w-2/3 bg-[#1E293B] rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-[#1E293B] rounded animate-pulse" />
            <div className="h-16 w-full bg-[#1E293B] rounded animate-pulse" />
          </div>
        ) : analysisPreview ? (
          <div className="space-y-4" aria-live="polite">
            {analysisPreview.notice && (
              <p className="text-xs text-[#F59E0B] leading-relaxed">
                {analysisPreview.notice}
              </p>
            )}

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-[#94A3B8]">Issue Category</dt>
                <dd className="text-[#F8FAFC] font-medium mt-1">{analysisPreview.category}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#94A3B8]">Detected Priority</dt>
                <dd className="mt-1">
                  <PriorityIndicator priority={analysisPreview.priority} />
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-[#94A3B8]">Recommended Department</dt>
                <dd className="text-[#3B82F6] font-medium mt-1">{analysisPreview.department}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#94A3B8]">Estimated Resolution SLA</dt>
                <dd className="text-[#F8FAFC] font-mono tabular-nums mt-1">
                  {analysisPreview.slaWindow}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#94A3B8]">Triage Engine</dt>
                <dd className="text-[#94A3B8] font-mono text-xs mt-1.5">
                  {analysisPreview.analysisSource === 'gemini-ai'
                    ? 'Google Gemini AI'
                    : 'Rule-Based Fallback'}
                </dd>
              </div>
              <div className="col-span-2 pt-3 border-t border-[#1E293B]">
                <dt className="text-xs text-[#94A3B8]">Official Field Dispatch Brief</dt>
                <dd className="text-[#F8FAFC] text-sm leading-relaxed mt-1">
                  {analysisPreview.dispatchBrief}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="py-4 text-sm text-[#94A3B8] leading-relaxed">
            Select a 1-click demo preset or enter an issue report on the left to inspect live Gemini AI categorization, urgency detection, SLA estimation, and dispatch routing.
          </div>
        )}

        {/* Recent Civic Feed separated by hairline divider */}
        <div className="pt-5 border-t border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-[#94A3B8]">Recent Civic Tickets</h3>
            <button
              type="button"
              onClick={onOpenTracker}
              className="text-xs font-medium text-[#3B82F6] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              View all ({issues.length})
            </button>
          </div>

          <ul className="divide-y divide-[#1E293B]">
            {recentIssues.map((item) => (
              <li key={item.id} className="py-3 first:pt-1 last:pb-0 flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onInspectIssue(item)}
                  className="text-left min-w-0 flex-1 space-y-1 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                >
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-mono tabular-nums">
                    <span className="text-[#3B82F6]">{item.id}</span>
                    <span aria-hidden="true">·</span>
                    <PriorityIndicator priority={item.priority} />
                    <span aria-hidden="true">·</span>
                    <StatusIndicator status={item.status} />
                  </div>
                  <div className="text-sm font-medium text-[#F8FAFC] group-hover:text-[#3B82F6] transition-colors truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-[#94A3B8] truncate">{item.location}</div>
                </button>
                <button
                  type="button"
                  onClick={() => onUpvote(item.id)}
                  aria-label={`Upvote ${item.id}, ${item.upvotes} upvotes`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono tabular-nums rounded-md bg-[#0B0F19] border border-[#1E293B] text-[#F8FAFC] hover:border-[#3B82F6] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                >
                  <ThumbsUp className="h-3 w-3 text-[#3B82F6]" aria-hidden="true" />
                  <span>{item.upvotes}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useOpportunityAnalysis } from "@/hooks/use-opportunity-analysis";
import { ActionButton } from "@/components/ui/action-button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalysisResults } from "./analysis-results";
export function AnalyzerWorkspace() {
  const state = useOpportunityAnalysis();
  if (state.loading) return <div className="space-y-6" role="status" aria-label="Loading your Knowledge Base"><Skeleton className="h-10 w-64" /><Skeleton className="h-24 w-full" /><Skeleton className="h-96 w-full" /><span className="sr-only">Loading your Knowledge Base</span></div>;
  const fieldClass = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50";
  return <div className="mx-auto max-w-5xl space-y-6">
    <header className="space-y-4"><h1 className="text-3xl font-semibold tracking-tight">Know before you bid.</h1><p className="text-muted">Understand the opportunity, compare it with your experience, and prepare your proposal.</p><Link className="text-sm text-primary underline underline-offset-4" href="/profile">Manage your Knowledge Base</Link></header>
    {state.error && <div role="alert" className="rounded-xl border border-danger bg-danger-soft p-6 text-danger">{state.error}</div>}
    <form className="space-y-4 rounded-xl border border-border bg-surface p-6" onSubmit={event => {event.preventDefault(); state.analyze();}}>
      <div className="space-y-2"><label htmlFor="opportunity-title" className="text-sm font-medium">Opportunity title</label><input id="opportunity-title" required maxLength={200} className={fieldClass} value={state.input.title} disabled={!state.ready || state.saving} onChange={event => state.updateInput("title", event.target.value)} placeholder="e.g. Customer analytics dashboard" /></div>
      <div className="space-y-2"><label htmlFor="opportunity-source" className="text-sm font-medium">Source <span className="text-muted">(optional)</span></label><input id="opportunity-source" maxLength={200} className={fieldClass} value={state.input.source} disabled={!state.ready || state.saving} onChange={event => state.updateInput("source", event.target.value)} placeholder="e.g. Upwork or direct enquiry" /></div>
      <div className="space-y-2"><label htmlFor="opportunity-description" className="text-sm font-medium">Job description or client brief</label><textarea id="opportunity-description" required maxLength={30000} rows={10} className={fieldClass} value={state.input.description} disabled={!state.ready || state.saving} onChange={event => state.updateInput("description", event.target.value)} placeholder="Paste the requirements, budget and expected timeline…" /></div>
      <ActionButton type="submit" disabled={!state.ready || state.saving || !state.input.title.trim() || !state.input.description.trim()}>Analyze opportunity</ActionButton>
    </form>
    {state.analysis && <><AnalysisResults analysis={state.analysis} /><div className="flex flex-wrap items-center gap-4"><ActionButton onClick={state.save} disabled={state.saving}>{state.saving ? "Saving opportunity…" : "Save and continue"}</ActionButton><p className="text-sm text-muted">Review the saved opportunity, then build a proposal.</p></div></>}
  </div>;
}

import type { OpportunityAnalysis } from "@/lib/analyzer";
function ResultList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <section className="space-y-4 rounded-xl border border-border bg-surface p-6"><h3 className="font-semibold">{title}</h3>{items.length ? <ul className="space-y-2 text-sm text-muted">{items.map(item => <li key={item} className="flex gap-2"><span aria-hidden="true">•</span><span>{item}</span></li>)}</ul> : <p className="text-sm text-muted">{empty}</p>}</section>;
}
export function AnalysisResults({ analysis }: { analysis: OpportunityAnalysis }) {
  return <div className="space-y-6" aria-live="polite">
    <section className="space-y-4 rounded-xl border border-border bg-surface p-6"><h2 className="text-xl font-semibold">Your opportunity analysis</h2><p className="text-sm text-muted">Based on the brief and your saved Knowledge Base. Matches indicate listed evidence, not verified proficiency.</p><dl className="grid gap-4 sm:grid-cols-3">{[["Project", analysis.projectType], ["Budget", analysis.budget], ["Timeline", analysis.timeline]].map(([label,value]) => <div key={label}><dt className="text-sm text-muted">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}</dl></section>
    <div className="grid gap-6 md:grid-cols-2">
      <ResultList title="Requirements" items={analysis.requirements} empty="No recognized requirements. Confirm the scope with the client." />
      <ResultList title="Matched skills and technologies" items={analysis.matchedSkills} empty="No matching skills were found in your Knowledge Base." />
      <ResultList title="Skills without listed evidence" items={analysis.missingSkills} empty="No gaps detected among recognized requirements." />
      <ResultList title="Relevant projects" items={analysis.relevantProjects} empty="No relevant saved projects were found." />
      <ResultList title="Match evidence" items={analysis.evidence} empty="Add skills and projects to improve personalized analysis." />
      <ResultList title="Scope concerns" items={analysis.concerns} empty="No concerns detected by the current rules." />
      <ResultList title="Missing information" items={analysis.missingInformation} empty="No missing information detected by the current rules." />
      <ResultList title="Questions for the client" items={analysis.questions} empty="Confirm deliverables and acceptance criteria before committing." />
    </div><section className="space-y-4 rounded-xl border border-border bg-surface p-6"><h3 className="font-semibold">Proposal approach</h3><p className="text-sm text-muted">{analysis.proposalStrategy}</p></section>
  </div>;
}

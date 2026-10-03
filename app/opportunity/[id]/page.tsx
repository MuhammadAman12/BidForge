"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type OpportunityPageProps = {
  params: Promise<{ id: string }>;
};

type Opportunity = {
  id: number;
  title: string | null;
  job_description: string;
  source: string | null;
  source_url: string | null;
  budget: string | null;
  timeline: string | null;
  project_type: string | null;
  analysis: StoredAnalysis | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type StoredAnalysis = {
  projectType?: string;
  budget?: string;
  timeline?: string;
  scopeClarity?: string;
  experienceMatch?: string;

  technologies?: string[];
  skills?: string[];
  matchedSkills?: string[];
  missingSkills?: string[];
  relevantProjects?: string[];
  evidence?: string[];

  requirements?: string[];
  concerns?: string[];
  missingInformation?: string[];
  questions?: string[];

  proposalStrategy?: string;
};

function asArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0
  );
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function StatusBadge({ status }: { status: string }) {
  const label = status.replaceAll("_", " ");

  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-semibold capitalize text-foreground">
      <span
        className={`mr-2 h-1.5 w-1.5 rounded-full ${
          status === "analyzed"
            ? "bg-primary"
            : status === "proposal_drafted"
              ? "bg-warning"
              : status === "proposal_sent"
                ? "bg-success"
                : "bg-muted"
        }`}
      />
      {label}
    </span>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-7">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-muted">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function ListBlock({
  items,
  emptyText = "No information was identified.",
}: {
  items: string[];
  emptyText?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex gap-3 text-sm leading-6 text-foreground"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function OpportunityDetailsPage({
  params,
}: OpportunityPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buildingProposal, setBuildingProposal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOpportunity() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        const { data, error: opportunityError } = await supabase
          .from("opportunities")
          .select(
            `
              id,
              title,
              job_description,
              source,
              source_url,
              budget,
              timeline,
              project_type,
              analysis,
              status,
              created_at,
              updated_at
            `
          )
          .eq("id", Number(id))
          .eq("profile_id", profile.id)
          .maybeSingle();

        if (opportunityError) {
          throw opportunityError;
        }

        if (cancelled) {
          return;
        }

        if (!data) {
          setOpportunity(null);
          setError("Opportunity not found.");
          return;
        }

        setOpportunity(data as Opportunity);
      } catch (err) {
        console.error("Failed to load opportunity:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading this opportunity."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOpportunity();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  function handleBack() {
    router.back();
  }

  function handleBuildProposal() {
    if (!opportunity) {
      return;
    }

    setBuildingProposal(true);

    try {
      sessionStorage.setItem(
        "bidforge-opportunity-id",
        String(opportunity.id)
      );

      sessionStorage.setItem(
        "bidforge-job",
        opportunity.job_description
      );

      sessionStorage.setItem(
        "bidforge-analysis",
        JSON.stringify(opportunity.analysis ?? {})
      );

      sessionStorage.setItem(
        "bidforge-opportunity-title",
        opportunity.title ?? ""
      );

      router.push("/proposal");
    } catch (err) {
      console.error("Failed to prepare proposal:", err);
      setBuildingProposal(false);
    }
  }

  const analysis = opportunity?.analysis ?? {};

  const technologies = asArray(analysis.technologies);

  const matchedSkills = asArray(
    analysis.matchedSkills?.length
      ? analysis.matchedSkills
      : analysis.skills
  );

  const missingSkills = asArray(analysis.missingSkills);
  const relevantProjects = asArray(analysis.relevantProjects);
  const evidence = asArray(analysis.evidence);
  const requirements = asArray(analysis.requirements);
  const concerns = asArray(analysis.concerns);
  const missingInformation = asArray(analysis.missingInformation);
  const questions = asArray(analysis.questions);

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-32 rounded bg-border" />
            <div className="h-10 w-2/3 rounded bg-border" />
            <div className="h-5 w-1/3 rounded bg-border" />

            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-24 rounded-xl bg-surface shadow-sm" />
              <div className="h-24 rounded-xl bg-surface shadow-sm" />
              <div className="h-24 rounded-xl bg-surface shadow-sm" />
            </div>

            <div className="h-64 rounded-2xl bg-surface shadow-sm" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !opportunity) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
              !
            </div>

            <h1 className="mt-5 text-xl font-semibold text-foreground">
              Opportunity unavailable
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              {error ||
                "We could not find the opportunity you were looking for."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-6 py-8 pb-16">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
          >
            <span aria-hidden="true">←</span>
            Back
          </button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={opportunity.status} />

                {opportunity.source && (
                  <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium capitalize text-muted">
                    {opportunity.source}
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {opportunity.title || "Untitled Opportunity"}
              </h1>

              <p className="mt-2 text-sm text-muted">
                Analyzed {formatDate(opportunity.created_at)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleBuildProposal}
              disabled={buildingProposal}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {buildingProposal ? "Preparing..." : "Build My Proposal"}

              {!buildingProposal && (
                <span aria-hidden="true">→</span>
              )}
            </button>
          </div>
        </div>

        {/* Opportunity metadata */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Project Type
            </p>

            <p className="mt-2 text-sm font-semibold text-foreground">
              {opportunity.project_type ||
                analysis.projectType ||
                "Not specified"}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Budget
            </p>

            <p className="mt-2 text-sm font-semibold text-foreground">
              {opportunity.budget ||
                analysis.budget ||
                "Not specified"}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Timeline
            </p>

            <p className="mt-2 text-sm font-semibold text-foreground">
              {opportunity.timeline ||
                analysis.timeline ||
                "Not specified"}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main content */}
          <div className="min-w-0 rounded-2xl border border-border bg-surface px-6 py-7 shadow-sm sm:px-8">
            <Section
              title="Opportunity"
              description="The original client brief saved with this analysis."
            >
              <div className="rounded-xl border border-border bg-surface-subtle p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {opportunity.job_description}
                </p>
              </div>
            </Section>

            <Section
              title="Skill Match"
              description="Skills BidForge identified as relevant to the opportunity."
            >
              <div className="flex flex-wrap gap-2">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-sm font-medium text-foreground"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted">
                    No direct skill matches were identified.
                  </p>
                )}
              </div>
            </Section>

            {missingSkills.length > 0 && (
              <Section
                title="Missing or Unverified Skills"
                description="Skills mentioned in the opportunity that were not confirmed by your knowledge base."
              >
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg border border-warning/30 bg-warning-soft px-3 py-1.5 text-sm font-medium text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            <Section
              title="Relevant Experience"
              description="Projects and evidence from your knowledge base that may support this opportunity."
            >
              {relevantProjects.length > 0 ? (
                <div className="space-y-3">
                  {relevantProjects.map((project, index) => (
                    <div
                      key={`${project}-${index}`}
                      className="rounded-xl border border-border bg-surface-subtle p-4"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {project}
                      </p>

                      {evidence[index] && (
                        <p className="mt-1.5 text-sm leading-6 text-muted">
                          {evidence[index]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : evidence.length > 0 ? (
                <ListBlock items={evidence} />
              ) : (
                <p className="text-sm leading-6 text-muted">
                  No directly relevant project evidence was identified.
                </p>
              )}
            </Section>

            <Section
              title="Technologies"
              description="Technologies identified in the client brief."
            >
              <div className="flex flex-wrap gap-2">
                {technologies.length > 0 ? (
                  technologies.map((technology, index) => (
                    <span
                      key={`${technology}-${index}`}
                      className="rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-sm font-medium text-foreground"
                    >
                      {technology}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted">
                    No specific technologies were identified.
                  </p>
                )}
              </div>
            </Section>

            <Section
              title="Requirements"
              description="Important requirements extracted from the client brief."
            >
              <ListBlock items={requirements} />
            </Section>

            <Section
              title="Potential Concerns"
              description="Items worth reviewing before committing to the project."
            >
              {concerns.length > 0 ? (
                <div className="space-y-3">
                  {concerns.map((concern, index) => (
                    <div
                      key={`${concern}-${index}`}
                      className="rounded-xl border border-warning/30 bg-warning-soft p-4"
                    >
                      <p className="text-sm leading-6 text-foreground">
                        {concern}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted">
                  No major concerns were identified from the available brief.
                </p>
              )}
            </Section>

            <Section
              title="Missing Information"
              description="Details that would help clarify the scope before bidding."
            >
              <ListBlock
                items={missingInformation}
                emptyText="No major missing information was identified."
              />
            </Section>

            <Section
              title="Questions to Ask the Client"
              description="Useful questions to clarify scope before starting."
            >
              <ListBlock
                items={questions}
                emptyText="No additional client questions were identified."
              />
            </Section>

            <Section
              title="Proposal Strategy"
              description="The main points your proposal should emphasize."
            >
              {analysis.proposalStrategy ? (
                <div className="rounded-xl border border-primary/20 bg-primary-soft p-5">
                  <p className="text-sm leading-7 text-foreground">
                    {analysis.proposalStrategy}
                  </p>
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted">
                  No proposal strategy was saved for this opportunity.
                </p>
              )}
            </Section>
          </div>

          {/* Right rail */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Opportunity ID
              </p>

              <p className="mt-2 font-mono text-sm text-foreground">
                #{opportunity.id}
              </p>
            </div>

            {analysis.scopeClarity && (
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Scope Clarity
                </p>

                <p className="mt-2 text-sm leading-6 text-foreground">
                  {analysis.scopeClarity}
                </p>
              </div>
            )}

            {analysis.experienceMatch && (
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Experience Match
                </p>

                <p className="mt-2 text-sm leading-6 text-foreground">
                  {analysis.experienceMatch}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5">
              <p className="text-sm font-semibold text-foreground">
                Ready to bid?
              </p>

              <p className="mt-2 text-sm leading-6 text-muted">
                Use this saved analysis as the foundation for a personalized
                proposal.
              </p>

              <button
                type="button"
                onClick={handleBuildProposal}
                disabled={buildingProposal}
                className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {buildingProposal
                  ? "Preparing..."
                  : "Build Proposal"}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
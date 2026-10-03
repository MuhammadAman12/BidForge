"use client";

import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import { supabase } from "../../lib/supabase";

type Opportunity = {
  id: number;
  title: string;
  job_description: string;
  source: string | null;
  budget: string | null;
  timeline: string | null;
  project_type: string | null;
  status:
    | "analyzed"
    | "proposal_drafted"
    | "proposal_sent"
    | "archived";
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  professional_title: string | null;
};

type DashboardStats = {
  opportunities: number;
  analyzed: number;
  proposals: number;
  knowledgeBase: number;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(
    [],
  );

  const [stats, setStats] = useState<DashboardStats>({
    opportunities: 0,
    analyzed: 0,
    proposals: 0,
    knowledgeBase: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      window.location.href = "/login";
      return;
    }

    const { data: profileData, error: profileError } =
      await supabase
        .from("profiles")
        .select(
          "id, full_name, professional_title",
        )
        .eq("user_id", user.id)
        .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (!profileData) {
      setError(
        "Your freelancer profile could not be found.",
      );
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const [
      { data: opportunitiesData, error: opportunitiesError },
      { count: skillsCount, error: skillsError },
      { count: projectsCount, error: projectsError },
      { count: certificationsCount, error: certificationsError },
      { count: portfolioCount, error: portfolioError },
    ] = await Promise.all([
      supabase
        .from("opportunities")
        .select(
          "id, title, job_description, source, budget, timeline, project_type, status, created_at, updated_at",
        )
        .eq("profile_id", profileData.id)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("skills")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("profile_id", profileData.id),

      supabase
        .from("projects")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("profile_id", profileData.id),

      supabase
        .from("certifications")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("profile_id", profileData.id),

      supabase
        .from("portfolio_links")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("profile_id", profileData.id),
    ]);

    if (
      opportunitiesError ||
      skillsError ||
      projectsError ||
      certificationsError ||
      portfolioError
    ) {
      setError(
        opportunitiesError?.message ??
          skillsError?.message ??
          projectsError?.message ??
          certificationsError?.message ??
          portfolioError?.message ??
          "Unable to load dashboard data.",
      );

      setLoading(false);
      return;
    }

    const opportunityList =
      (opportunitiesData as Opportunity[]) ?? [];

    setOpportunities(opportunityList);

    const analyzedCount = opportunityList.filter(
      (opportunity) =>
        opportunity.status === "analyzed",
    ).length;

    const proposalCount = opportunityList.filter(
      (opportunity) =>
        opportunity.status === "proposal_drafted" ||
        opportunity.status === "proposal_sent",
    ).length;

    const knowledgeBaseCount =
      (skillsCount ?? 0) +
      (projectsCount ?? 0) +
      (certificationsCount ?? 0) +
      (portfolioCount ?? 0);

    setStats({
      opportunities: opportunityList.length,
      analyzed: analyzedCount,
      proposals: proposalCount,
      knowledgeBase: knowledgeBaseCount,
    });

    setLoading(false);
  }

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-white/10" />

            <div className="mt-3 h-9 w-64 animate-pulse rounded bg-gray-200 dark:bg-white/10" />

            <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-gray-200 dark:bg-white/10" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"
              />
            ))}
          </div>

          <div className="mt-6 h-80 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-400/20 dark:bg-red-400/[0.05]">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              DASHBOARD ERROR
            </p>

            <p className="mt-2 text-sm text-red-700/80 dark:text-red-300/70">
              {error}
            </p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const firstName =
    profile?.full_name?.trim().split(/\s+/)[0] ||
    "there";

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              WORKSPACE
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Good morning, {firstName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              Review your opportunities, understand which jobs
              fit your experience, and build better proposals.
            </p>
          </div>

          <a
            href="/analyze"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            Analyze Opportunity
            <span className="ml-2">→</span>
          </a>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Opportunities"
            value={stats.opportunities}
            description="Jobs analyzed in your workspace"
          />

          <StatCard
            label="Analyzed"
            value={stats.analyzed}
            description="Currently awaiting a proposal"
          />

          <StatCard
            label="Proposals"
            value={stats.proposals}
            description="Drafted or sent proposals"
          />

          <StatCard
            label="Knowledge Base"
            value={stats.knowledgeBase}
            description="Profile evidence available to BidForge"
          />
        </div>

        {/* Recent Opportunities */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Opportunities
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your latest analyzed freelance opportunities.
              </p>
            </div>

            {opportunities.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {opportunities.length} total
              </span>
            )}
          </div>

          {opportunities.length === 0 ? (
            <EmptyOpportunities />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
              <div className="divide-y divide-gray-100 dark:divide-white/10">
                {opportunities
                  .slice(0, 8)
                  .map((opportunity) => (
                    <OpportunityRow
                      key={opportunity.id}
                      opportunity={opportunity}
                    />
                  ))}
              </div>
            </div>
          )}
        </section>

        {/* Bottom Grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Knowledge Base */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  KNOWLEDGE BASE
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Your experience powers the analysis.
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  BidForge uses your actual skills, projects,
                  certifications, and portfolio evidence when
                  evaluating opportunities.
                </p>
              </div>

              <a
                href="/profile"
                className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Manage →
              </a>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <KnowledgeItem
                label="Skills"
                value={skillsCountFallback(stats, "skills")}
              />

              <KnowledgeItem
                label="Projects"
                value={skillsCountFallback(stats, "projects")}
              />

              <KnowledgeItem
                label="Certifications"
                value={skillsCountFallback(
                  stats,
                  "certifications",
                )}
              />

              <KnowledgeItem
                label="Portfolio"
                value={skillsCountFallback(
                  stats,
                  "portfolio",
                )}
              />
            </div>
          </section>

          {/* Getting Started */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              WORKFLOW
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              From opportunity to proposal.
            </h2>

            <div className="mt-6 space-y-5">
              <WorkflowStep
                number="01"
                title="Analyze the opportunity"
                description="Understand the requirements, match them against your experience, and identify missing information."
                href="/analyze"
              />

              <WorkflowStep
                number="02"
                title="Review the analysis"
                description="Use the evidence and client questions to decide how you want to approach the opportunity."
              />

              <WorkflowStep
                number="03"
                title="Build your proposal"
                description="Turn the opportunity analysis into a personalized proposal without fabricated claims."
                href="/proposal"
              />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-500">
        {description}
      </p>
    </div>
  );
}

function OpportunityRow({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  const formattedDate = new Date(
    opportunity.created_at,
  ).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <a
      href={`/analyze?opportunity=${opportunity.id}`}
      className="group block px-5 py-5 transition hover:bg-gray-50 dark:hover:bg-white/[0.025]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-medium text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {opportunity.title}
            </h3>

            <StatusBadge status={opportunity.status} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-500">
            <span>
              {opportunity.project_type ||
                "Project type not specified"}
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block dark:bg-gray-600" />

            <span>
              {opportunity.budget ||
                "Budget not specified"}
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-gray-300 sm:block dark:bg-gray-600" />

            <span>
              {opportunity.timeline ||
                "Timeline not specified"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 lg:justify-end">
          <span className="text-xs text-gray-400 dark:text-gray-600">
            {formattedDate}
          </span>

          <span className="text-sm text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-gray-600">
            →
          </span>
        </div>
      </div>
    </a>
  );
}

function StatusBadge({
  status,
}: {
  status: Opportunity["status"];
}) {
  const config = {
    analyzed: {
      label: "Analyzed",
      className:
        "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    },
    proposal_drafted: {
      label: "Proposal Drafted",
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
    },
    proposal_sent: {
      label: "Proposal Sent",
      className:
        "bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300",
    },
    archived: {
      label: "Archived",
      className:
        "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400",
    },
  }[status];

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function EmptyOpportunities() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.02]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-400/10">
        ✦
      </div>

      <h3 className="mt-5 font-medium text-gray-900 dark:text-white">
        No opportunities yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
        Paste a freelance job description into BidForge and
        we'll analyze it against your real experience.
      </p>

      <a
        href="/analyze"
        className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
      >
        Analyze your first opportunity →
      </a>
    </div>
  );
}

function KnowledgeItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
      <p className="text-xs text-gray-500 dark:text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
  href,
}: {
  number: string;
  title: string;
  description: string;
  href?: string;
}) {
  const content = (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-medium">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-xl transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
      >
        {content}
      </a>
    );
  }

  return content;
}

/*
 * The dashboard currently receives the combined Knowledge Base
 * count from the database. These helper values preserve the
 * existing dashboard structure while we prepare the next
 * Knowledge Base statistics pass.
 */
function skillsCountFallback(
  stats: DashboardStats,
  type:
    | "skills"
    | "projects"
    | "certifications"
    | "portfolio",
) {
  /*
   * For now the individual counts are not stored in DashboardStats.
   * Return the total only for the overall Knowledge Base view.
   *
   * The individual database counts will be surfaced directly
   * once the dashboard statistics object is expanded.
   */
  if (stats.knowledgeBase === 0) {
    return 0;
  }

  return type === "skills" ? stats.knowledgeBase : 0;
}
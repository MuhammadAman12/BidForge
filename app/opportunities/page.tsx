"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type OpportunityStatus =
  | "analyzed"
  | "proposal_drafted"
  | "proposal_sent"
  | "archived";

type Opportunity = {
  id: number;
  profile_id: string;
  title: string | null;
  job_description: string;
  source: string | null;
  budget: string | null;
  timeline: string | null;
  project_type: string | null;
  status: OpportunityStatus;
  created_at: string;
  updated_at: string;
};

type ProposalStatus = "draft" | "sent" | "archived";

type ProposalSummary = {
  opportunity_id: number;
  status: ProposalStatus;
};

type FilterStatus = "all" | OpportunityStatus;

type SortOption = "newest" | "oldest" | "title";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusLabel(status: OpportunityStatus) {
  switch (status) {
    case "analyzed":
      return "Analyzed";
    case "proposal_drafted":
      return "Proposal drafted";
    case "proposal_sent":
      return "Proposal sent";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

function getStatusClass(status: OpportunityStatus) {
  switch (status) {
    case "analyzed":
      return "bg-primary-soft text-primary";
    case "proposal_drafted":
      return "bg-warning-soft text-warning";
    case "proposal_sent":
      return "bg-success-soft text-success";
    case "archived":
      return "bg-surface-subtle text-muted";
    default:
      return "bg-surface-subtle text-muted";
  }
}

function getProposalStatusLabel(status: ProposalStatus) {
  switch (status) {
    case "draft":
      return "Draft";
    case "sent":
      return "Sent";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

export default function OpportunitiesPage() {
  const router = useRouter();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [proposalStatuses, setProposalStatuses] = useState<
    Record<number, ProposalStatus>
  >({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOpportunities() {
      setLoading(true);
      setError("");

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (cancelled) {
        return;
      }

      if (userError) {
        setError(`Authentication failed: ${userError.message}`);
        setLoading(false);
        return;
      }

      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (profileError) {
        setError(`Profile query failed: ${profileError.message}`);
        setLoading(false);
        return;
      }

      if (!profileData) {
        setError("No freelancer profile was found for this account.");
        setLoading(false);
        return;
      }

      const { data: opportunityData, error: opportunityError } =
        await supabase
          .from("opportunities")
          .select(
            "id, profile_id, title, job_description, source, budget, timeline, project_type, status, created_at, updated_at"
          )
          .eq("profile_id", profileData.id)
          .order("created_at", { ascending: false });

      if (cancelled) {
        return;
      }

      if (opportunityError) {
        setError(
          `Opportunity query failed: ${opportunityError.message}`
        );
        setLoading(false);
        return;
      }

      const loadedOpportunities = (opportunityData ??
        []) as Opportunity[];

      setOpportunities(loadedOpportunities);

      if (loadedOpportunities.length > 0) {
        const opportunityIds = loadedOpportunities.map(
          (opportunity) => opportunity.id
        );

        const { data: proposalData, error: proposalError } =
          await supabase
            .from("proposals")
            .select("opportunity_id, status")
            .eq("profile_id", profileData.id)
            .in("opportunity_id", opportunityIds);

        if (!cancelled && proposalError) {
          setError(
            `Proposal status query failed: ${proposalError.message}`
          );
          setLoading(false);
          return;
        }

        if (!cancelled) {
          const statusMap: Record<number, ProposalStatus> = {};

          ((proposalData ?? []) as ProposalSummary[]).forEach(
            (proposal) => {
              statusMap[proposal.opportunity_id] = proposal.status;
            }
          );

          setProposalStatuses(statusMap);
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadOpportunities();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const filteredOpportunities = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = opportunities.filter((opportunity) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        opportunity.title?.toLowerCase().includes(normalizedSearch) ||
        opportunity.job_description
          .toLowerCase()
          .includes(normalizedSearch) ||
        opportunity.project_type
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        opportunity.budget?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        opportunity.status === statusFilter;

      return Boolean(matchesSearch && matchesStatus);
    });

    return [...filtered].sort((a, b) => {
      if (sortOption === "oldest") {
        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
      }

      if (sortOption === "title") {
        return (a.title ?? "").localeCompare(b.title ?? "");
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });
  }, [opportunities, search, statusFilter, sortOption]);

  const statusCounts = useMemo(() => {
    return {
      all: opportunities.length,
      analyzed: opportunities.filter(
        (opportunity) => opportunity.status === "analyzed"
      ).length,
      proposal_drafted: opportunities.filter(
        (opportunity) => opportunity.status === "proposal_drafted"
      ).length,
      proposal_sent: opportunities.filter(
        (opportunity) => opportunity.status === "proposal_sent"
      ).length,
      archived: opportunities.filter(
        (opportunity) => opportunity.status === "archived"
      ).length,
    };
  }, [opportunities]);

  return (
    <AppShell>
      <div className="min-h-full bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">
                Opportunity history
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Opportunities
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Review the freelance opportunities you&apos;ve analyzed,
                track proposal progress, and reopen any opportunity when
                you&apos;re ready to continue.
              </p>
            </div>

            <Link
              href="/analyze"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
            >
              Analyze Opportunity
            </Link>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Total
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {statusCounts.all}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Analyzed
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {statusCounts.analyzed}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Drafted
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {statusCounts.proposal_drafted}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Sent
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {statusCounts.proposal_sent}
              </p>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-border bg-surface p-3 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_170px]">
              <div className="relative">
                <label htmlFor="opportunity-search" className="sr-only">
                  Search opportunities
                </label>

                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>

                <input
                  id="opportunity-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search opportunities..."
                  className="h-10 w-full rounded-lg border border-border bg-surface-subtle pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <label className="sr-only" htmlFor="status-filter">
                Filter by status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as FilterStatus
                  )
                }
                className="h-10 rounded-lg border border-border bg-surface-subtle px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="all">
                  All statuses ({statusCounts.all})
                </option>
                <option value="analyzed">
                  Analyzed ({statusCounts.analyzed})
                </option>
                <option value="proposal_drafted">
                  Proposal drafted ({statusCounts.proposal_drafted})
                </option>
                <option value="proposal_sent">
                  Proposal sent ({statusCounts.proposal_sent})
                </option>
                <option value="archived">
                  Archived ({statusCounts.archived})
                </option>
              </select>

              <label className="sr-only" htmlFor="sort-opportunities">
                Sort opportunities
              </label>

              <select
                id="sort-opportunities"
                value={sortOption}
                onChange={(event) =>
                  setSortOption(event.target.value as SortOption)
                }
                className="h-10 rounded-lg border border-border bg-surface-subtle px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title A–Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />

              <p className="mt-4 text-sm font-medium text-foreground">
                Loading opportunities...
              </p>

              <p className="mt-1 text-sm text-muted">
                Fetching your saved opportunities.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger-soft p-6">
              <p className="text-sm font-semibold text-danger">
                Couldn&apos;t load opportunities
              </p>

              <p className="mt-1 text-sm leading-6 text-danger/80">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-danger/20 bg-surface px-3 text-sm font-semibold text-danger transition hover:bg-danger-soft"
              >
                Try again
              </button>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 5h16v14H4z" />
                  <path d="M8 9h8M8 13h5" />
                </svg>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-foreground">
                No opportunities yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                Analyze your first freelance opportunity and BidForge
                will keep the analysis here so you can return to it later.
              </p>

              <Link
                href="/analyze"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                Analyze your first opportunity
              </Link>
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">
                No matching opportunities
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                Try a different search term or clear the current status
                filter.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="mt-5 inline-flex h-9 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-foreground transition hover:bg-surface-subtle"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <div className="hidden grid-cols-[minmax(0,1fr)_160px_170px_110px] gap-4 border-b border-border bg-surface-subtle px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted lg:grid">
                <span>Opportunity</span>
                <span>Progress</span>
                <span>Details</span>
                <span className="text-right">Created</span>
              </div>

              <div className="divide-y divide-border">
                {filteredOpportunities.map((opportunity) => {
                  const proposalStatus =
                    proposalStatuses[opportunity.id];

                  return (
                    <button
                      key={opportunity.id}
                      type="button"
                      onClick={() =>
                        router.push(
                          `/opportunity/${opportunity.id}`
                        )
                      }
                      className="group block w-full text-left transition hover:bg-surface-subtle"
                    >
                      <div className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_160px_170px_110px] lg:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                              {opportunity.title ||
                                "Untitled opportunity"}
                            </h2>

                            <span
                              className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusClass(
                                opportunity.status
                              )}`}
                            >
                              {getStatusLabel(opportunity.status)}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-5 text-muted">
                            {opportunity.job_description}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted">
                            Proposal
                          </p>

                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {proposalStatus
                              ? getProposalStatusLabel(
                                  proposalStatus
                                )
                              : "Not started"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted">
                            Project
                          </p>

                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {opportunity.project_type ||
                              "Not specified"}
                          </p>

                          <p className="mt-0.5 text-xs text-muted">
                            {opportunity.budget ||
                              "Budget not specified"}
                            {" · "}
                            {opportunity.timeline ||
                              "Timeline not specified"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 lg:block lg:text-right">
                          <div>
                            <p className="text-xs font-medium text-muted">
                              Created
                            </p>

                            <p className="mt-1 text-sm font-medium text-foreground">
                              {formatDate(opportunity.created_at)}
                            </p>
                          </div>

                          <span className="text-sm font-semibold text-primary lg:mt-2 lg:block">
                            Open →
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!loading &&
            !error &&
            opportunities.length > 0 &&
            filteredOpportunities.length > 0 && (
              <p className="mt-4 text-center text-xs text-muted">
                Showing {filteredOpportunities.length} of{" "}
                {opportunities.length} opportunities
              </p>
            )}
        </div>
      </div>
    </AppShell>
  );
}
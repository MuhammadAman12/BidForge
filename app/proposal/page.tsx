"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string;
  professional_title: string;
  bio: string;
  hourly_rate: number;
  availability: string;
};

type Skill = {
  id: number;
  skill_name: string;
  skill_level: string;
  years_experience: number;
};

type Project = {
  id: number;
  project_name: string;
  description: string;
  technologies: string[];
  client_industry: string;
  project_url: string | null;
};

type Certification = {
  id: number;
  certification_name: string;
  issuing_organization: string;
  issue_date: string;
  credential_url: string | null;
};

type PortfolioLink = {
  id: number;
  platform: string | null;
  url: string;
  label: string | null;
};

type OpportunityAnalysis = {
  skillMatch?: string[];
  experienceMatch?: string[];
  matchedSkills?: string[];
  relevantExperience?: string[];
  relevantProjects?: string[];
  matchedTechnologies?: string[];
  requirements?: string[];
  concerns?: string[];
  missingInformation?: string[];
  questionsToAsk?: string[];
  questions?: string[];
  proposalStrategy?: string;
};

type Opportunity = {
  id: number;
  title: string;
  job_description: string;
  budget: string | null;
  timeline: string | null;
  project_type: string | null;
  status: string;
  analysis: OpportunityAnalysis | null;
};

type Proposal = {
  id: number;
  profile_id: string;
  opportunity_id: number;
  proposal_text: string;
  status: "draft" | "sent" | "archived";
};

type ProposalVersion = {
  id: number;
  proposal_id: number;
  version_number: number;
  content: string;
  created_at: string;
};

function generateProposal(
  opportunity: Opportunity,
  profile: Profile,
  skills: Skill[],
  projects: Project[],
  analysis: OpportunityAnalysis
): string {
  const matchedSkillNames = analysis.matchedSkills ?? analysis.skillMatch ?? [];

  const verifiedSkills = skills.filter((skill) =>
    matchedSkillNames.some(
      (matchedSkill) =>
        matchedSkill.toLowerCase() === skill.skill_name.toLowerCase()
    )
  );

  const relevantProjects = projects.filter(project =>
    (analysis.relevantProjects ?? []).includes(project.project_name)
  );

  const skillsText =
    verifiedSkills.length > 0
      ? verifiedSkills
          .slice(0, 5)
          .map((skill) => skill.skill_name)
          .join(", ")
      : "the relevant technologies and requirements";

  const projectsText =
    relevantProjects.length > 0
      ? relevantProjects
          .slice(0, 2)
          .map((project) => project.project_name)
          .join(" and ")
      : "";

  const strategy =
    analysis.proposalStrategy ??
    "Focus on the client's stated requirements, demonstrate relevant experience, and keep the proposal concise and specific.";

  return `Hi,

I’d be interested in helping with ${opportunity.title}.

${verifiedSkills.length ? `My listed skills relevant to this brief include ${skillsText}.` : "I would like to clarify the required skills and assess my fit before committing."} I would first confirm the scope and deliverables before committing to the implementation.

${
  projectsText
    ? `A relevant example from my experience is ${projectsText}, which gives me practical exposure to this type of work.`
    : "I would be happy to discuss the requirements and clarify where my experience fits the work."
}

My approach would be to first confirm the key requirements and expected outcome, then break the work into clear implementation steps so progress and deliverables remain easy to track.

${strategy}

I’d be happy to discuss the project further and clarify any details that are still open.

Best regards,
${profile.full_name}`;
}

export default function ProposalPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [portfolioLinks, setPortfolioLinks] = useState<PortfolioLink[]>([]);

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [versions, setVersions] = useState<ProposalVersion[]>([]);
  const [proposalText, setProposalText] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProposalWorkspace(selectedOpportunityId: number) {
    try {
      setLoading(true);
      setError("");
      setSaveMessage("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be logged in to use the proposal workspace.");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, professional_title, bio, hourly_rate, availability"
        )
        .eq("user_id", user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error(
          profileError?.message || "Unable to load your freelancer profile."
        );
      }

      setProfile(profileData);

      const { data: opportunityData, error: opportunityError } =
        await supabase
          .from("opportunities")
          .select(
            "id, title, job_description, budget, timeline, project_type, status, analysis"
          )
          .eq("id", selectedOpportunityId)
          .eq("profile_id", profileData.id)
          .single();

      if (opportunityError || !opportunityData) {
        throw new Error(
          opportunityError?.message || "Unable to load the selected opportunity."
        );
      }

      const loadedOpportunity = opportunityData as Opportunity;

      setOpportunity(loadedOpportunity);

      const [
        skillsResult,
        projectsResult,
        certificationsResult,
        portfolioResult,
      ] = await Promise.all([
        supabase
          .from("skills")
          .select("id, skill_name, skill_level, years_experience")
          .eq("profile_id", profileData.id),

        supabase
          .from("projects")
          .select(
            "id, project_name, description, technologies, client_industry, project_url"
          )
          .eq("profile_id", profileData.id),

        supabase
          .from("certifications")
          .select(
            "id, certification_name, issuing_organization, issue_date, credential_url"
          )
          .eq("profile_id", profileData.id),

        supabase
          .from("portfolio_links")
          .select("id, platform, url, label")
          .eq("profile_id", profileData.id),
      ]);

      if (skillsResult.error) {
        throw new Error(`Skills query failed: ${skillsResult.error.message}`);
      }

      if (projectsResult.error) {
        throw new Error(
          `Projects query failed: ${projectsResult.error.message}`
        );
      }

      if (certificationsResult.error) {
        throw new Error(
          `Certifications query failed: ${certificationsResult.error.message}`
        );
      }

      if (portfolioResult.error) {
        throw new Error(
          `Portfolio query failed: ${portfolioResult.error.message}`
        );
      }

      const loadedSkills = (skillsResult.data ?? []) as Skill[];
      const loadedProjects = (projectsResult.data ?? []) as Project[];
      const loadedCertifications =
        (certificationsResult.data ?? []) as Certification[];
      const loadedPortfolioLinks =
        (portfolioResult.data ?? []) as PortfolioLink[];

      setSkills(loadedSkills);
      setProjects(loadedProjects);
      setCertifications(loadedCertifications);
      setPortfolioLinks(loadedPortfolioLinks);

      const { data: proposalData, error: proposalError } = await supabase
        .from("proposals")
        .select(
          "id, profile_id, opportunity_id, proposal_text, status"
        )
        .eq("opportunity_id", selectedOpportunityId)
        .eq("profile_id", profileData.id)
        .maybeSingle();

      if (proposalError) {
        throw new Error(
          `Proposal query failed: ${proposalError.message}`
        );
      }

      let currentProposal = proposalData as Proposal | null;

      /*
       * If this opportunity does not yet have a proposal,
       * generate the initial proposal BEFORE inserting the row.
       *
       * proposal_text is NOT NULL in the existing database schema.
       */
      if (!currentProposal) {
        const generatedProposal = generateProposal(
          loadedOpportunity,
          profileData as Profile,
          loadedSkills,
          loadedProjects,
          (loadedOpportunity.analysis ?? {}) as OpportunityAnalysis
        );

        const { data: createdProposal, error: createProposalError } =
          await supabase
            .from("proposals")
            .insert({
              profile_id: profileData.id,
              opportunity_id: selectedOpportunityId,
              proposal_text: generatedProposal,
              status: "draft",
            })
            .select(
              "id, profile_id, opportunity_id, proposal_text, status"
            )
            .single();

        if (createProposalError || !createdProposal) {
          throw new Error(
            createProposalError?.message ||
              "Unable to create the proposal."
          );
        }

        currentProposal = createdProposal as Proposal;
      }

      setProposal(currentProposal);

      const { data: versionData, error: versionError } = await supabase
        .from("proposal_versions")
        .select(
          "id, proposal_id, version_number, content, created_at"
        )
        .eq("proposal_id", currentProposal.id)
        .order("version_number", { ascending: false });

      if (versionError) {
        throw new Error(
          `Proposal versions query failed: ${versionError.message}`
        );
      }

      const loadedVersions = (versionData ?? []) as ProposalVersion[];

      setVersions(loadedVersions);

      /*
       * Prefer version history when available.
       * Otherwise use the current proposal_text from the existing
       * proposals table.
       */
      if (loadedVersions.length > 0) {
        setProposalText(loadedVersions[0].content);
      } else {
        setProposalText(currentProposal.proposal_text);

        /*
         * Existing proposals created before versioning may not have
         * a proposal_versions row yet. We leave that alone until the
         * user explicitly clicks Save Draft.
         */
      }
    } catch (workspaceError) {
      console.error("Proposal workspace error:", workspaceError);

      setError(
        workspaceError instanceof Error
          ? workspaceError.message
          : "Failed to load the proposal workspace."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function initialize() {
      await Promise.resolve();
    const storedOpportunityId = sessionStorage.getItem(
      "bidforge-opportunity-id"
    );

    if (!storedOpportunityId) {
      setError(
        "No opportunity was selected. Please return to the dashboard and open an opportunity."
      );
      setLoading(false);
      return;
    }

    const parsedId = Number(storedOpportunityId);

    if (!Number.isFinite(parsedId)) {
      setError("The selected opportunity ID is invalid.");
      setLoading(false);
      return;
    }

    loadProposalWorkspace(parsedId);
    }
    void initialize();
  }, []);


  const analysis = useMemo<OpportunityAnalysis>(() => {
    return (opportunity?.analysis ?? {}) as OpportunityAnalysis;
  }, [opportunity]);

  const matchedSkillNames = useMemo(() => analysis.matchedSkills ?? analysis.skillMatch ?? [], [analysis]);

  const verifiedSkills = useMemo(() => {
    return skills.filter((skill) =>
      matchedSkillNames.some(
        (matchedSkill) =>
          matchedSkill
            .toLowerCase()
            .includes(skill.skill_name.toLowerCase()) ||
          skill.skill_name
            .toLowerCase()
            .includes(matchedSkill.toLowerCase())
      )
    );
  }, [skills, matchedSkillNames]);

  const relevantProjects = useMemo(() => {
    return projects.filter((project) => {
      const projectText = [
        project.project_name,
        project.description,
        project.client_industry,
        ...(project.technologies ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return matchedSkillNames.some((skill) =>
        projectText.includes(skill.toLowerCase())
      );
    });
  }, [projects, matchedSkillNames]);

  async function saveDraft() {
    if (!proposal || !profile || !opportunity) {
      return;
    }

    if (!proposalText.trim()) {
      setSaveMessage("Proposal content cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setSaveMessage("");
      setError("");

      const nextVersionNumber =
        versions.length > 0
          ? Math.max(...versions.map((version) => version.version_number)) + 1
          : 1;

      /*
       * First update the existing proposals row.
       *
       * proposal_text is the current/latest proposal.
       */
      const { data: updatedProposal, error: proposalUpdateError } =
        await supabase
          .from("proposals")
          .update({
            proposal_text: proposalText.trim(),
            status: "draft",
            updated_at: new Date().toISOString(),
          })
          .eq("id", proposal.id)
          .eq("profile_id", profile.id)
          .select(
            "id, profile_id, opportunity_id, proposal_text, status"
          )
          .single();

      if (proposalUpdateError || !updatedProposal) {
        throw new Error(
          proposalUpdateError?.message ||
            "Unable to update the proposal."
        );
      }

      /*
       * Then create a version snapshot.
       */
      const { data: newVersion, error: versionError } = await supabase
        .from("proposal_versions")
        .insert({
          proposal_id: proposal.id,
          version_number: nextVersionNumber,
          content: proposalText.trim(),
        })
        .select(
          "id, proposal_id, version_number, content, created_at"
        )
        .single();

      if (versionError || !newVersion) {
        throw new Error(
          versionError?.message ||
            "Proposal was updated, but its version could not be saved."
        );
      }

      /*
       * Mark the opportunity as having a drafted proposal.
       */
      const { error: opportunityUpdateError } = await supabase
        .from("opportunities")
        .update({
          status: "proposal_drafted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", opportunity.id)
        .eq("profile_id", profile.id);

      if (opportunityUpdateError) {
        throw new Error(
          `Proposal saved, but opportunity status could not be updated: ${opportunityUpdateError.message}`
        );
      }

      setProposal(updatedProposal as Proposal);

      setVersions((currentVersions) => [
        newVersion as ProposalVersion,
        ...currentVersions,
      ]);

      setSaveMessage(
        `Draft saved successfully as Version ${nextVersionNumber}.`
      );
    } catch (saveError) {
      console.error("Save draft error:", saveError);

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save the proposal."
      );
    } finally {
      setSaving(false);
    }
  }

  function regenerateProposal() {
    if (!opportunity || !profile) {
      return;
    }

    setRegenerating(true);
    setSaveMessage("");
    setError("");

    window.setTimeout(() => {
      const generated = generateProposal(
        opportunity,
        profile,
        skills,
        projects,
        analysis
      );

      setProposalText(generated);

      setSaveMessage(
        "New proposal draft generated. Review it and click Save Draft to keep it."
      );

      setRegenerating(false);
    }, 450);
  }

  async function copyProposal() {
    if (!proposalText.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(proposalText);

      setSaveMessage("Proposal copied to clipboard.");
    } catch {
      setSaveMessage(
        "Copy failed. Please select the proposal text manually."
      );
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />

            <p className="text-sm text-muted">
              Loading proposal workspace...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error && !opportunity) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-2xl border border-danger/20 bg-danger-soft p-6">
            <h1 className="text-lg font-semibold text-foreground">
              Unable to load proposal workspace
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted">
              {error}
            </p>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!profile || !opportunity || !proposal) {
    return null;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(`/opportunity/${opportunity.id}`)
              }
              className="mb-3 text-sm font-medium text-muted transition hover:text-foreground"
            >
              ← Back to Opportunity
            </button>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Proposal Workspace
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
              Build a proposal from the saved opportunity analysis and your
              verified freelancer knowledge base.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted">
              {versions.length > 0
                ? `Version ${versions[0].version_number}`
                : "Unsaved draft"}
            </span>

            <button
              type="button"
              onClick={copyProposal}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:border-border-strong hover:bg-surface-subtle"
            >
              Copy Proposal
            </button>

            <button
              type="button"
              onClick={regenerateProposal}
              disabled={regenerating}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:border-border-strong hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-60"
            >
              {regenerating ? "Regenerating..." : "Regenerate"}
            </button>

            <button
              type="button"
              onClick={saveDraft}
              disabled={saving}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
          </div>
        </div>

        {(saveMessage || error) && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-danger/20 bg-danger-soft text-danger"
                : "border-success/20 bg-success-soft text-success"
            }`}
          >
            {error || saveMessage}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <div className="border-b border-border px-6 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Proposal
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-foreground">
                      {opportunity.title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {opportunity.project_type && (
                      <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                        {opportunity.project_type}
                      </span>
                    )}

                    {opportunity.budget && (
                      <span className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-medium text-muted">
                        {opportunity.budget}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <textarea
                  value={proposalText}
                  onChange={(event) => {
                    setProposalText(event.target.value);
                    setSaveMessage("");
                  }}
                  className="min-h-[680px] w-full resize-y rounded-xl border border-border bg-surface-subtle p-5 text-sm leading-7 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="Your proposal will appear here..."
                />

                <div className="mt-3 flex items-center justify-between text-xs text-muted">
                  <span>
                    {
                      proposalText
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean).length
                    }{" "}
                    words
                  </span>

                  <span>
                    Changes are not saved until you click Save Draft.
                  </span>
                </div>
              </div>
            </div>

            {versions.length > 0 && (
              <div className="mt-6 rounded-2xl border border-border bg-surface shadow-sm">
                <div className="border-b border-border px-6 py-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Version History
                  </h3>

                  <p className="mt-1 text-xs text-muted">
                    Saved versions of this proposal.
                  </p>
                </div>

                <div className="divide-y divide-border">
                  {versions.map((version) => (
                    <button
                      key={version.id}
                      type="button"
                      onClick={() => {
                        setProposalText(version.content);

                        setSaveMessage(
                          `Loaded Version ${version.version_number}. Click Save Draft if you want to create a new saved version from it.`
                        );
                      }}
                      className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-surface-subtle"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Version {version.version_number}
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          {new Date(
                            version.created_at
                          ).toLocaleString()}
                        </p>
                      </div>

                      <span className="text-xs font-medium text-primary">
                        Load
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Opportunity
              </p>

              <h3 className="mt-2 text-base font-semibold leading-6 text-foreground">
                {opportunity.title}
              </h3>

              <div className="mt-4 space-y-3">
                {opportunity.timeline && (
                  <div>
                    <p className="text-xs text-muted">Timeline</p>

                    <p className="mt-1 text-sm font-medium text-foreground">
                      {opportunity.timeline}
                    </p>
                  </div>
                )}

                {opportunity.budget && (
                  <div>
                    <p className="text-xs text-muted">Budget</p>

                    <p className="mt-1 text-sm font-medium text-foreground">
                      {opportunity.budget}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Verified Skills
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Matched against your Knowledge Base.
                  </p>
                </div>

                <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                  {verifiedSkills.length}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {verifiedSkills.length > 0 ? (
                  verifiedSkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-lg border border-border bg-surface-subtle px-2.5 py-1.5 text-xs font-medium text-foreground"
                    >
                      {skill.skill_name}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted">
                    No direct verified skill match found.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Relevant Projects
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Projects connected to the matched requirements.
                  </p>
                </div>

                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                  {relevantProjects.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {relevantProjects.length > 0 ? (
                  relevantProjects.slice(0, 4).map((project) => (
                    <div
                      key={project.id}
                      className="rounded-xl border border-border bg-surface-subtle p-3"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {project.project_name}
                      </p>

                      <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted">
                        {project.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">
                    No directly matched projects found.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Client Questions
              </p>

              <div className="mt-4 space-y-3">
                {(analysis.questions ?? analysis.questionsToAsk) &&
                (analysis.questions ?? analysis.questionsToAsk ?? []).length > 0 ? (
                  (analysis.questions ?? analysis.questionsToAsk ?? []).map((question, index) => (
                    <div
                      key={`${question}-${index}`}
                      className="flex gap-3"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[10px] font-bold text-primary">
                        {index + 1}
                      </span>

                      <p className="text-sm leading-5 text-muted">
                        {question}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">
                    No additional client questions were identified.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-warning/20 bg-warning-soft p-5">
              <p className="text-sm font-semibold text-foreground">
                Review before sending
              </p>

              <p className="mt-2 text-xs leading-5 text-muted">
                BidForge uses information from your Knowledge Base and the
                saved opportunity analysis. Review the proposal carefully
                before sending it to the client.
              </p>
            </div>

            {certifications.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Certifications
                </p>

                <div className="mt-4 space-y-3">
                  {certifications.slice(0, 3).map((certification) => (
                    <div key={certification.id}>
                      <p className="text-sm font-medium text-foreground">
                        {certification.certification_name}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        {certification.issuing_organization}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {portfolioLinks.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Portfolio
                </p>

                <div className="mt-4 space-y-3">
                  {portfolioLinks.slice(0, 4).map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-border bg-surface-subtle p-3 transition hover:border-border-strong"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {link.label || link.platform || "Portfolio"}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted">
                        {link.url}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";

type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  professional_title: string;
  bio: string;
  hourly_rate: number | null;
  availability: string;
};

type Skill = {
  id: number;
  profile_id: string;
  skill_name: string;
  skill_level: string | null;
  years_experience: number | null;
};

type Project = {
  id: number;
  profile_id: string;
  project_name: string;
  description: string | null;
  technologies: string[] | null;
  project_url: string | null;
  client_industry: string | null;
  created_at: string;
};

type Certification = {
  id: number;
  profile_id: string;
  certification_name: string;
  issuing_organization: string | null;
  issue_date: string | null;
  credential_url: string | null;
  created_at: string;
};

type PortfolioLink = {
  id: number;
  profile_id: string;
  platform: string;
  url: string;
  label: string | null;
  created_at: string;
};

type IconProps = {
  size?: number;
  className?: string;
};

function UserIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function SparklesIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.2 4.1L7 8.3l3.8 1.2L12 14l1.2-4.5L17 8.3l-3.8-1.2L12 3Z" />
      <path d="m19 13-.7 2.3L16 16l2.3.7L19 19l.7-2.3L22 16l-2.3-.7L19 13Z" />
      <path d="m5 14-.7 2.3L2 17l2.3.7L5 20l.7-2.3L8 17l-2.3-.7L5 14Z" />
    </svg>
  );
}

function PlusIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

function ExternalIcon({ size = 14, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 5h5v5" />
      <path d="m19 5-8 8" />
      <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function CheckIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function BriefcaseIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}

function AwardIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="5" />
      <path d="m8.5 12.5-1 8 4.5-2.5 4.5 2.5-1-8" />
    </svg>
  );
}

function LinkIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
      <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 7 20l1.1-1.1" />
    </svg>
  );
}

function SectionIcon({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "violet" | "green" | "amber";
}) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    green:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  };

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold text-[var(--foreground)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{hint}</p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-light)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]";

const textareaClass =
  "w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-light)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]";

const selectClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-50";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);
  const [addingProject, setAddingProject] = useState(false);
  const [addingCertification, setAddingCertification] = useState(false);
  const [addingPortfolio, setAddingPortfolio] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  const [fullName, setFullName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState("");

  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTechnologies, setProjectTechnologies] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [clientIndustry, setClientIndustry] = useState("");

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certificationName, setCertificationName] = useState("");
  const [issuingOrganization, setIssuingOrganization] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");

  const [portfolioLinks, setPortfolioLinks] = useState<PortfolioLink[]>([]);
  const [portfolioPlatform, setPortfolioPlatform] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [portfolioLabel, setPortfolioLabel] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
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

    setUserEmail(user.email ?? "");

    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (existingProfile) {
      setProfile(existingProfile);

      setFullName(existingProfile.full_name ?? "");
      setProfessionalTitle(existingProfile.professional_title ?? "");
      setBio(existingProfile.bio ?? "");
      setHourlyRate(
        existingProfile.hourly_rate !== null &&
          existingProfile.hourly_rate !== undefined
          ? String(existingProfile.hourly_rate)
          : "",
      );
      setAvailability(existingProfile.availability ?? "");

      await Promise.all([
        loadSkills(existingProfile.id),
        loadProjects(existingProfile.id),
        loadCertifications(existingProfile.id),
        loadPortfolioLinks(existingProfile.id),
      ]);
    }

    setLoading(false);
  }

  async function loadSkills(profileId: string) {
    const { data, error: skillsError } = await supabase
      .from("skills")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: true });

    if (skillsError) {
      setError(skillsError.message);
      return;
    }

    setSkills(data ?? []);
  }

  async function loadProjects(profileId: string) {
    const { data, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: true });

    if (projectsError) {
      setError(projectsError.message);
      return;
    }

    setProjects(data ?? []);
  }

  async function loadCertifications(profileId: string) {
    const { data, error: certificationsError } = await supabase
      .from("certifications")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: true });

    if (certificationsError) {
      setError(certificationsError.message);
      return;
    }

    setCertifications(data ?? []);
  }

  async function loadPortfolioLinks(profileId: string) {
    const { data, error: portfolioError } = await supabase
      .from("portfolio_links")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: true });

    if (portfolioError) {
      setError(portfolioError.message);
      return;
    }

    setPortfolioLinks(data ?? []);
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSavingProfile(true);
    setMessage("");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      setSavingProfile(false);
      return;
    }

    if (!professionalTitle.trim()) {
      setError("Please enter your professional title.");
      setSavingProfile(false);
      return;
    }

    const profileData = {
      user_id: user.id,
      full_name: fullName.trim(),
      professional_title: professionalTitle.trim(),
      bio: bio.trim(),
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      availability: availability.trim(),
      updated_at: new Date().toISOString(),
    };

    if (profile) {
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
        setSavingProfile(false);
        return;
      }

      setProfile(data);
      setMessage("Profile updated successfully.");
    } else {
      const { data, error: insertError } = await supabase
        .from("profiles")
        .insert({
          ...profileData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setSavingProfile(false);
        return;
      }

      setProfile(data);

      await Promise.all([
        loadSkills(data.id),
        loadProjects(data.id),
        loadCertifications(data.id),
        loadPortfolioLinks(data.id),
      ]);

      setMessage("Profile created successfully.");
    }

    setSavingProfile(false);
  }

  async function handleAddSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAddingSkill(true);
    setMessage("");
    setError("");

    if (!profile) {
      setError("Please save your profile before adding skills.");
      setAddingSkill(false);
      return;
    }

    if (!skillName.trim()) {
      setError("Please enter a skill name.");
      setAddingSkill(false);
      return;
    }

    if (!skillLevel) {
      setError("Please select a skill level.");
      setAddingSkill(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("skills")
      .insert({
        profile_id: profile.id,
        skill_name: skillName.trim(),
        skill_level: skillLevel,
        years_experience: yearsExperience ? Number(yearsExperience) : null,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setAddingSkill(false);
      return;
    }

    setSkills((currentSkills) => [...currentSkills, data]);

    setSkillName("");
    setSkillLevel("");
    setYearsExperience("");

    setMessage("Skill added successfully.");
    setAddingSkill(false);
  }

  async function handleDeleteSkill(skillId: number) {
    setMessage("");
    setError("");

    const { error: deleteError } = await supabase
      .from("skills")
      .delete()
      .eq("id", skillId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSkills((currentSkills) =>
      currentSkills.filter((skill) => skill.id !== skillId),
    );

    setMessage("Skill removed successfully.");
  }

  async function handleAddProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAddingProject(true);
    setMessage("");
    setError("");

    if (!profile) {
      setError("Please save your profile before adding projects.");
      setAddingProject(false);
      return;
    }

    if (!projectName.trim()) {
      setError("Please enter a project name.");
      setAddingProject(false);
      return;
    }

    if (!projectDescription.trim()) {
      setError("Please enter a project description.");
      setAddingProject(false);
      return;
    }

    const technologies = projectTechnologies
      .split(",")
      .map((technology) => technology.trim())
      .filter(Boolean);

    const { data, error: insertError } = await supabase
      .from("projects")
      .insert({
        profile_id: profile.id,
        project_name: projectName.trim(),
        description: projectDescription.trim(),
        technologies,
        project_url: projectUrl.trim() || null,
        client_industry: clientIndustry.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setAddingProject(false);
      return;
    }

    setProjects((currentProjects) => [...currentProjects, data]);

    setProjectName("");
    setProjectDescription("");
    setProjectTechnologies("");
    setProjectUrl("");
    setClientIndustry("");

    setMessage("Project added successfully.");
    setAddingProject(false);
  }

  async function handleDeleteProject(projectId: number) {
    setMessage("");
    setError("");

    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== projectId),
    );

    setMessage("Project removed successfully.");
  }

  async function handleAddCertification(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setAddingCertification(true);
    setMessage("");
    setError("");

    if (!profile) {
      setError("Please save your profile before adding certifications.");
      setAddingCertification(false);
      return;
    }

    if (!certificationName.trim()) {
      setError("Please enter a certification name.");
      setAddingCertification(false);
      return;
    }

    if (!issuingOrganization.trim()) {
      setError("Please enter the issuing organization.");
      setAddingCertification(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("certifications")
      .insert({
        profile_id: profile.id,
        certification_name: certificationName.trim(),
        issuing_organization: issuingOrganization.trim(),
        issue_date: issueDate || null,
        credential_url: credentialUrl.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setAddingCertification(false);
      return;
    }

    setCertifications((currentCertifications) => [
      ...currentCertifications,
      data,
    ]);

    setCertificationName("");
    setIssuingOrganization("");
    setIssueDate("");
    setCredentialUrl("");

    setMessage("Certification added successfully.");
    setAddingCertification(false);
  }

  async function handleDeleteCertification(certificationId: number) {
    setMessage("");
    setError("");

    const { error: deleteError } = await supabase
      .from("certifications")
      .delete()
      .eq("id", certificationId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setCertifications((currentCertifications) =>
      currentCertifications.filter(
        (certification) => certification.id !== certificationId,
      ),
    );

    setMessage("Certification removed successfully.");
  }

  async function handleAddPortfolio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAddingPortfolio(true);
    setMessage("");
    setError("");

    if (!profile) {
      setError("Please save your profile before adding portfolio links.");
      setAddingPortfolio(false);
      return;
    }

    if (!portfolioPlatform.trim()) {
      setError("Please enter a portfolio platform.");
      setAddingPortfolio(false);
      return;
    }

    if (!portfolioUrl.trim()) {
      setError("Please enter a portfolio URL.");
      setAddingPortfolio(false);
      return;
    }

    let validatedUrl: URL;

    try {
      validatedUrl = new URL(portfolioUrl.trim());

      if (
        validatedUrl.protocol !== "http:" &&
        validatedUrl.protocol !== "https:"
      ) {
        throw new Error("Invalid protocol");
      }
    } catch {
      setError(
        "Please enter a valid portfolio URL starting with https:// or http://.",
      );
      setAddingPortfolio(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("portfolio_links")
      .insert({
        profile_id: profile.id,
        platform: portfolioPlatform.trim(),
        url: validatedUrl.toString(),
        label: portfolioLabel.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setAddingPortfolio(false);
      return;
    }

    setPortfolioLinks((currentLinks) => [...currentLinks, data]);

    setPortfolioPlatform("");
    setPortfolioUrl("");
    setPortfolioLabel("");

    setMessage("Portfolio link added successfully.");
    setAddingPortfolio(false);
  }

  async function handleDeletePortfolio(portfolioId: number) {
    setMessage("");
    setError("");

    const { error: deleteError } = await supabase
      .from("portfolio_links")
      .delete()
      .eq("id", portfolioId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setPortfolioLinks((currentLinks) =>
      currentLinks.filter((link) => link.id !== portfolioId),
    );

    setMessage("Portfolio link removed successfully.");
  }

  const knowledgeScore = useMemo(() => {
    let score = 0;

    if (profile?.full_name?.trim()) score += 15;
    if (profile?.professional_title?.trim()) score += 15;
    if (profile?.bio?.trim()) score += 15;
    if (skills.length > 0) score += 20;
    if (projects.length > 0) score += 20;
    if (certifications.length > 0) score += 7;
    if (portfolioLinks.length > 0) score += 8;

    return Math.min(score, 100);
  }, [profile, skills, projects, certifications, portfolioLinks]);

  const totalEvidence =
    skills.length +
    projects.length +
    certifications.length +
    portfolioLinks.length;

  if (loading) {
    return (
      <AppShell title="Knowledge Base">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
            <p className="text-sm text-[var(--muted)]">
              Loading your knowledge base...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Knowledge Base">
      <div className="w-full">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)]">
                <SparklesIcon size={14} className="text-[var(--primary)]" />
                Freelancer Knowledge Base
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Make your experience usable.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                Keep your professional information accurate and evidence-based.
                BidForge uses this knowledge when analyzing opportunities and
                building personalized proposals.
              </p>

              {userEmail && (
                <p className="mt-3 text-xs text-[var(--muted-light)]">
                  Signed in as {userEmail}
                </p>
              )}
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Knowledge readiness
                  </p>
                  <p className="mt-1 text-2xl font-bold">{knowledgeScore}%</p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)]">
                  {knowledgeScore}
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
                  style={{ width: `${knowledgeScore}%` }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                {totalEvidence === 0
                  ? "Add your first piece of professional evidence to get started."
                  : `${totalEvidence} pieces of professional evidence are available to BidForge.`}
              </p>
            </div>
          </div>
        </div>

        {/* STATUS */}
        {(message || error) && (
          <div
            className={`mb-8 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400"
            }`}
          >
            <div className="mt-0.5">
              {error ? (
                <span className="font-bold">!</span>
              ) : (
                <CheckIcon size={16} />
              )}
            </div>
            <span>{error || message}</span>
          </div>
        )}

        {/* QUICK NAV */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Profile",
              value: profile ? "Configured" : "Needs setup",
              icon: <UserIcon />,
              href: "#profile",
            },
            {
              label: "Skills",
              value: `${skills.length} added`,
              icon: <SparklesIcon />,
              href: "#skills",
            },
            {
              label: "Projects",
              value: `${projects.length} added`,
              icon: <BriefcaseIcon />,
              href: "#projects",
            },
            {
              label: "Portfolio",
              value: `${portfolioLinks.length} links`,
              icon: <LinkIcon />,
              href: "#portfolio",
            },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--muted)] transition group-hover:text-[var(--primary)]">
                  {item.icon}
                </div>

                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {item.value}
                  </p>
                </div>
              </div>

              <span className="text-[var(--muted-light)] transition group-hover:translate-x-0.5 group-hover:text-[var(--primary)]">
                →
              </span>
            </a>
          ))}
        </div>

        <div className="space-y-6">
          {/* PROFILE */}
          <section
            id="profile"
            className="scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
          >
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <SectionIcon>
                  <UserIcon />
                </SectionIcon>

                <div>
                  <h2 className="font-semibold">Professional profile</h2>
                  <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                    The core identity BidForge uses when understanding your
                    professional background.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-5 sm:p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Full name" required>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="e.g. Muhammad Aman"
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="Professional title" required>
                  <input
                    type="text"
                    value={professionalTitle}
                    onChange={(event) =>
                      setProfessionalTitle(event.target.value)
                    }
                    placeholder="e.g. Full-Stack Developer"
                    required
                    className={inputClass}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field
                    label="Professional bio"
                    hint="Focus on your real strengths, experience, industries, and the type of work you actually do."
                  >
                    <textarea
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      placeholder="Describe your professional background, strengths, and the type of work you do."
                      rows={5}
                      className={textareaClass}
                    />
                  </Field>
                </div>

                <Field label="Hourly rate">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
                      $
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={hourlyRate}
                      onChange={(event) => setHourlyRate(event.target.value)}
                      placeholder="25"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </Field>

                <Field label="Availability">
                  <select
                    value={availability}
                    onChange={(event) => setAvailability(event.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select availability</option>
                    <option value="Available now">Available now</option>
                    <option value="Available within a week">
                      Available within a week
                    </option>
                    <option value="Available within a month">
                      Available within a month
                    </option>
                    <option value="Limited availability">
                      Limited availability
                    </option>
                  </select>
                </Field>
              </div>

              <div className="mt-6 flex flex-col justify-between gap-4 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center">
                <p className="text-xs text-[var(--muted)]">
                  Keep this information current. It becomes part of your
                  proposal context.
                </p>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className={primaryButtonClass}
                >
                  {savingProfile
                    ? "Saving..."
                    : profile
                      ? "Save changes"
                      : "Create profile"}
                </button>
              </div>
            </form>
          </section>

          {/* SKILLS */}
          <section
            id="skills"
            className="scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
          >
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <SectionIcon tone="violet">
                    <SparklesIcon />
                  </SectionIcon>

                  <div>
                    <h2 className="font-semibold">Skills</h2>
                    <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                      Add only skills you can genuinely support with your
                      experience.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
                  {skills.length}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <form
                onSubmit={handleAddSkill}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
              >
                <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
                  <Field label="Skill" required>
                    <input
                      type="text"
                      value={skillName}
                      onChange={(event) => setSkillName(event.target.value)}
                      placeholder="e.g. React"
                      required
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Level" required>
                    <select
                      value={skillLevel}
                      onChange={(event) => setSkillLevel(event.target.value)}
                      required
                      className={selectClass}
                    >
                      <option value="">Select level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </Field>

                  <Field label="Years">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={yearsExperience}
                      onChange={(event) =>
                        setYearsExperience(event.target.value)
                      }
                      placeholder="e.g. 2"
                      className={inputClass}
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={addingSkill || !profile}
                    className={secondaryButtonClass}
                  >
                    <PlusIcon />
                    {addingSkill ? "Adding" : "Add"}
                  </button>
                </div>
              </form>

              <div className="mt-5">
                {skills.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--border)] px-5 py-10 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--muted)]">
                      <SparklesIcon />
                    </div>
                    <p className="mt-3 text-sm font-semibold">
                      No skills yet
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Add your first skill above.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--border-strong)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {skill.skill_name}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {skill.skill_level && (
                                <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--primary)]">
                                  {skill.skill_level}
                                </span>
                              )}

                              {skill.years_experience !== null && (
                                <span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]">
                                  {skill.years_experience}{" "}
                                  {skill.years_experience === 1
                                    ? "year"
                                    : "years"}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteSkill(skill.id)}
                            aria-label={`Remove ${skill.skill_name}`}
                            className="rounded-lg p-2 text-[var(--muted-light)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                          >
                            <TrashIcon size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PROJECTS */}
          <section
            id="projects"
            className="scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
          >
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <SectionIcon tone="blue">
                    <BriefcaseIcon />
                  </SectionIcon>

                  <div>
                    <h2 className="font-semibold">Experience & projects</h2>
                    <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                      Give BidForge concrete evidence it can reference when
                      building proposals.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
                  {projects.length}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <form
                onSubmit={handleAddProject}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
              >
                <div className="space-y-4">
                  <Field label="Project name" required>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(event) => setProjectName(event.target.value)}
                      placeholder="e.g. Customer Management Dashboard"
                      required
                      className={inputClass}
                    />
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Client industry">
                      <input
                        type="text"
                        value={clientIndustry}
                        onChange={(event) =>
                          setClientIndustry(event.target.value)
                        }
                        placeholder="e.g. SaaS, Healthcare, Finance"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Project URL">
                      <input
                        type="url"
                        value={projectUrl}
                        onChange={(event) => setProjectUrl(event.target.value)}
                        placeholder="https://github.com/..."
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Technologies"
                    hint="Separate technologies with commas."
                  >
                    <input
                      type="text"
                      value={projectTechnologies}
                      onChange={(event) =>
                        setProjectTechnologies(event.target.value)
                      }
                      placeholder="React, Next.js, Node.js, PostgreSQL"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Project description" required>
                    <textarea
                      value={projectDescription}
                      onChange={(event) =>
                        setProjectDescription(event.target.value)
                      }
                      placeholder="Describe what you built, the problem it solved, and your role."
                      rows={4}
                      required
                      className={textareaClass}
                    />
                  </Field>

                  <div className="flex justify-end border-t border-[var(--border)] pt-4">
                    <button
                      type="submit"
                      disabled={addingProject || !profile}
                      className={primaryButtonClass}
                    >
                      <PlusIcon />
                      {addingProject ? "Adding project..." : "Add project"}
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-5">
                {projects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--border)] px-5 py-10 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--muted)]">
                      <BriefcaseIcon />
                    </div>
                    <p className="mt-3 text-sm font-semibold">
                      No projects yet
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Add real projects that demonstrate your experience.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <article
                        key={project.id}
                        className="rounded-xl border border-[var(--border)] p-4 transition hover:border-[var(--border-strong)] sm:p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold">
                                {project.project_name}
                              </h3>

                              {project.client_industry && (
                                <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--primary)]">
                                  {project.client_industry}
                                </span>
                              )}
                            </div>

                            {project.description && (
                              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                                {project.description}
                              </p>
                            )}

                            {project.technologies &&
                              project.technologies.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {project.technologies.map(
                                    (technology, index) => (
                                      <span
                                        key={`${technology}-${index}`}
                                        className="rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]"
                                      >
                                        {technology}
                                      </span>
                                    ),
                                  )}
                                </div>
                              )}

                            {project.project_url && (
                              <a
                                href={project.project_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
                              >
                                View project
                                <ExternalIcon size={13} />
                              </a>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project.id)}
                            className="self-start rounded-lg p-2 text-[var(--muted-light)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                            aria-label={`Remove ${project.project_name}`}
                          >
                            <TrashIcon size={15} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* CERTIFICATIONS */}
          <section
            id="certifications"
            className="scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
          >
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <SectionIcon tone="amber">
                    <AwardIcon />
                  </SectionIcon>

                  <div>
                    <h2 className="font-semibold">Certifications</h2>
                    <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                      Store credentials you actually hold so they can support
                      relevant proposals.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
                  {certifications.length}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <form
                onSubmit={handleAddCertification}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Certification name" required>
                    <input
                      type="text"
                      value={certificationName}
                      onChange={(event) =>
                        setCertificationName(event.target.value)
                      }
                      placeholder="e.g. AWS Certified Cloud Practitioner"
                      required
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Issuing organization" required>
                    <input
                      type="text"
                      value={issuingOrganization}
                      onChange={(event) =>
                        setIssuingOrganization(event.target.value)
                      }
                      placeholder="e.g. Amazon Web Services"
                      required
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Issue date">
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(event) => setIssueDate(event.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Credential URL">
                    <input
                      type="url"
                      value={credentialUrl}
                      onChange={(event) =>
                        setCredentialUrl(event.target.value)
                      }
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="mt-4 flex justify-end border-t border-[var(--border)] pt-4">
                  <button
                    type="submit"
                    disabled={addingCertification || !profile}
                    className={primaryButtonClass}
                  >
                    <PlusIcon />
                    {addingCertification
                      ? "Adding..."
                      : "Add certification"}
                  </button>
                </div>
              </form>

              <div className="mt-5">
                {certifications.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--border)] px-5 py-10 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--muted)]">
                      <AwardIcon />
                    </div>
                    <p className="mt-3 text-sm font-semibold">
                      No certifications yet
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Credentials are optional but can strengthen relevant
                      proposals.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {certifications.map((certification) => (
                      <article
                        key={certification.id}
                        className="rounded-xl border border-[var(--border)] p-4 transition hover:border-[var(--border-strong)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold">
                              {certification.certification_name}
                            </h3>

                            {certification.issuing_organization && (
                              <p className="mt-1 text-xs text-[var(--muted)]">
                                {certification.issuing_organization}
                              </p>
                            )}

                            {certification.issue_date && (
                              <p className="mt-3 text-xs text-[var(--muted)]">
                                Issued{" "}
                                {new Date(
                                  `${certification.issue_date}T00:00:00`,
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            )}

                            {certification.credential_url && (
                              <a
                                href={certification.credential_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
                              >
                                View credential
                                <ExternalIcon size={13} />
                              </a>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteCertification(certification.id)
                            }
                            className="rounded-lg p-2 text-[var(--muted-light)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                            aria-label={`Remove ${certification.certification_name}`}
                          >
                            <TrashIcon size={15} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PORTFOLIO */}
          <section
            id="portfolio"
            className="scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
          >
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <SectionIcon tone="green">
                    <LinkIcon />
                  </SectionIcon>

                  <div>
                    <h2 className="font-semibold">Portfolio & public work</h2>
                    <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                      Connect the public work you want associated with your
                      professional profile.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-[var(--surface-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
                  {portfolioLinks.length}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <form
                onSubmit={handleAddPortfolio}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Platform" required>
                    <input
                      type="text"
                      value={portfolioPlatform}
                      onChange={(event) =>
                        setPortfolioPlatform(event.target.value)
                      }
                      placeholder="e.g. GitHub, Behance, Personal Website"
                      required
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Label">
                    <input
                      type="text"
                      value={portfolioLabel}
                      onChange={(event) =>
                        setPortfolioLabel(event.target.value)
                      }
                      placeholder="e.g. GitHub Profile"
                      className={inputClass}
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Portfolio URL" required>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(event) =>
                          setPortfolioUrl(event.target.value)
                        }
                        placeholder="https://github.com/..."
                        required
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>

                <div className="mt-4 flex justify-end border-t border-[var(--border)] pt-4">
                  <button
                    type="submit"
                    disabled={addingPortfolio || !profile}
                    className={primaryButtonClass}
                  >
                    <PlusIcon />
                    {addingPortfolio ? "Adding..." : "Add portfolio link"}
                  </button>
                </div>
              </form>

              <div className="mt-5">
                {portfolioLinks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--border)] px-5 py-10 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-subtle)] text-[var(--muted)]">
                      <LinkIcon />
                    </div>
                    <p className="mt-3 text-sm font-semibold">
                      No portfolio links yet
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Add GitHub, personal websites, or other public work.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {portfolioLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4 transition hover:border-[var(--border-strong)] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <LinkIcon size={16} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold">
                                {link.label ||
                                  link.platform ||
                                  "Portfolio Link"}
                              </p>

                              {link.platform && link.label && (
                                <span className="rounded-full bg-[var(--surface-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                                  {link.platform}
                                </span>
                              )}
                            </div>

                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block max-w-xl truncate text-xs text-[var(--primary)] hover:underline"
                            >
                              {link.url}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--primary)]"
                            aria-label={`Open ${link.label || link.platform}`}
                          >
                            <ExternalIcon />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeletePortfolio(link.id)}
                            className="rounded-lg p-2 text-[var(--muted-light)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                            aria-label={`Remove ${link.label || link.platform}`}
                          >
                            <TrashIcon size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* KNOWLEDGE BASE HEALTH */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
              <div className="flex items-start gap-3">
                <SectionIcon tone="green">
                  <CheckIcon />
                </SectionIcon>

                <div>
                  <h2 className="font-semibold">Knowledge base health</h2>
                  <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                    A quick view of the information currently available to
                    BidForge.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-px overflow-hidden bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Profile",
                  value: profile ? "Available" : "Incomplete",
                  complete: Boolean(
                    profile?.full_name &&
                      profile.professional_title &&
                      profile.bio,
                  ),
                  icon: <UserIcon size={17} />,
                },
                {
                  label: "Skills",
                  value:
                    skills.length > 0
                      ? `${skills.length} skill${skills.length === 1 ? "" : "s"}`
                      : "None added",
                  complete: skills.length > 0,
                  icon: <SparklesIcon size={17} />,
                },
                {
                  label: "Projects",
                  value:
                    projects.length > 0
                      ? `${projects.length} project${
                          projects.length === 1 ? "" : "s"
                        }`
                      : "None added",
                  complete: projects.length > 0,
                  icon: <BriefcaseIcon size={17} />,
                },
                {
                  label: "Public work",
                  value:
                    portfolioLinks.length > 0
                      ? `${portfolioLinks.length} link${
                          portfolioLinks.length === 1 ? "" : "s"
                        }`
                      : "None added",
                  complete: portfolioLinks.length > 0,
                  icon: <LinkIcon size={17} />,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[var(--surface)] p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-subtle)] text-[var(--muted)]">
                      {item.icon}
                    </div>

                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        item.complete
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                      }`}
                    >
                      {item.complete ? (
                        <CheckIcon size={13} />
                      ) : (
                        <span className="text-xs font-bold">!</span>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {item.label}
                  </p>

                  <p className="mt-1 text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border)] px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-2 text-xs leading-5 text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
                <span>
                  BidForge should only use information you have actually
                  provided.
                </span>

                <span className="font-medium text-[var(--foreground)]">
                  Evidence-based proposals
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
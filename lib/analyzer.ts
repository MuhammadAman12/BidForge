export type KnowledgeBase = {
  profile: {
    full_name: string;
    professional_title: string;
    bio: string;
    hourly_rate: number | null;
    availability: string;
  } | null;
  skills: {
    skill_name: string;
    skill_level: string | null;
    years_experience: number | null;
  }[];
  projects: {
    project_name: string;
    description: string | null;
    technologies: string[] | null;
    client_industry: string | null;
    project_url: string | null;
  }[];
  certifications: {
    certification_name: string;
    issuing_organization: string | null;
  }[];
  portfolioLinks: {
    platform: string;
    url: string;
    label: string | null;
  }[];
};

export type OpportunityAnalysis = {
  projectType: string;
  skills: string[];
  technologies: string[];
  budget: string;
  timeline: string;
  requirements: string[];
  concerns: string[];
  missingInformation: string[];
  questions: string[];
  proposalStrategy: string;

  matchedSkills: string[];
  missingSkills: string[];
  relevantProjects: string[];
  evidence: string[];
  knowledgeBaseUsed: boolean;
};

const TECHNOLOGIES = [
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "REST API",
  "REST APIs",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Python",
  "Django",
  "FastAPI",
  "Java",
  "Spring Boot",
  "PHP",
  "Laravel",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "AWS",
  "Azure",
  "Docker",
  "Firebase",
  "Supabase",
];

const SKILLS = [
  "full-stack development",
  "frontend development",
  "backend development",
  "web development",
  "dashboard development",
  "API integration",
  "REST API development",
  "database development",
  "authentication",
  "responsive design",
  "UI development",
  "software testing",
  "QA testing",
  "debugging",
  "SaaS development",
];

function findMatches(text: string, list: string[]) {
  const lowerText = text.toLowerCase();

  return list.filter((item) =>
    lowerText.includes(item.toLowerCase()),
  );
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim();
}

function containsTerm(text: string, term: string) {
  const normalizedText = normalize(text);
  const normalizedTerm = normalize(term);

  return (
    normalizedText.includes(normalizedTerm) ||
    normalizedTerm
      .split(" ")
      .filter(Boolean)
      .some((word) => word.length >= 4 && normalizedText.includes(word))
  );
}

function extractBudget(text: string) {
  const patterns = [
    /\$[\d,]+\s*[-–]\s*\$[\d,]+/i,
    /budget\s*[:\-]?\s*\$?[\d,]+\s*[-–]\s*\$?[\d,]+/i,
    /€[\d,]+\s*[-–]\s*€[\d,]+/i,
    /£[\d,]+\s*[-–]\s*£[\d,]+/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return match[0]
        .replace(/^budget\s*[:\-]?\s*/i, "")
        .trim();
    }
  }

  return "Not specified";
}

function extractTimeline(text: string) {
  const patterns = [
    /\d+\s*[-–]\s*\d+\s*(?:days?|weeks?|months?)/i,
    /\d+\s*(?:days?|weeks?|months?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return match[0];
    }
  }

  return "Not specified";
}

function detectProjectType(text: string) {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("dashboard") ||
    lowerText.includes("admin panel")
  ) {
    return "Web Dashboard";
  }

  if (
    lowerText.includes("saas") ||
    lowerText.includes("software as a service")
  ) {
    return "SaaS Application";
  }

  if (
    lowerText.includes("mobile app") ||
    lowerText.includes("ios") ||
    lowerText.includes("android")
  ) {
    return "Mobile Application";
  }

  if (
    lowerText.includes("website") ||
    lowerText.includes("web application") ||
    lowerText.includes("web app")
  ) {
    return "Web Application";
  }

  if (
    lowerText.includes("api") ||
    lowerText.includes("backend")
  ) {
    return "Backend / API Development";
  }

  return "Software Development";
}

function detectRequirements(
  text: string,
  technologies: string[],
  skills: string[],
) {
  const requirements: string[] = [];

  for (const technology of technologies) {
    requirements.push(`${technology} experience`);
  }

  for (const skill of skills) {
    requirements.push(
      skill.charAt(0).toUpperCase() + skill.slice(1),
    );
  }

  const lowerText = text.toLowerCase();

  if (lowerText.includes("communicat")) {
    requirements.push("Clear client communication");
  }

  if (
    lowerText.includes("maintainable") ||
    lowerText.includes("clean code")
  ) {
    requirements.push("Clean, maintainable code");
  }

  if (
    lowerText.includes("progress update") ||
    lowerText.includes("regular update")
  ) {
    requirements.push("Regular progress updates");
  }

  return [...new Set(requirements)].slice(0, 10);
}

function detectConcerns(
  text: string,
  budget: string,
  timeline: string,
) {
  const concerns: string[] = [];
  const lowerText = text.toLowerCase();

  if (budget === "Not specified") {
    concerns.push("The client has not specified a clear budget.");
  }

  if (timeline === "Not specified") {
    concerns.push("The project timeline is not clearly defined.");
  }

  if (
    lowerText.includes("existing api") &&
    !lowerText.includes("api documentation")
  ) {
    concerns.push(
      "Existing APIs are mentioned, but their documentation and readiness are unclear.",
    );
  }

  if (
    lowerText.includes("existing code") &&
    !lowerText.includes("codebase")
  ) {
    concerns.push(
      "The existing codebase and its current condition should be clarified.",
    );
  }

  if (
    lowerText.includes("analytics") &&
    !lowerText.includes("what") &&
    !lowerText.includes("specific")
  ) {
    concerns.push(
      "The expected analytics requirements may need clarification.",
    );
  }

  return concerns;
}

function detectMissingInformation(
  text: string,
  budget: string,
  timeline: string,
) {
  const missing: string[] = [];
  const lowerText = text.toLowerCase();

  if (budget === "Not specified") {
    missing.push("Project budget");
  }

  if (timeline === "Not specified") {
    missing.push("Expected timeline");
  }

  if (
    lowerText.includes("authentication") &&
    !lowerText.includes("auth system")
  ) {
    missing.push("Authentication implementation details");
  }

  if (
    lowerText.includes("api") &&
    !lowerText.includes("documentation")
  ) {
    missing.push("Existing API documentation");
  }

  if (
    lowerText.includes("analytics") &&
    !lowerText.includes("metrics")
  ) {
    missing.push("Specific analytics and metrics");
  }

  if (!lowerText.includes("deliverable")) {
    missing.push("Detailed final deliverables");
  }

  return missing;
}

function generateQuestions(
  missingInformation: string[],
) {
  const questions: string[] = [];

  if (missingInformation.includes("Project budget")) {
    questions.push(
      "What budget range have you allocated for the complete project?",
    );
  }

  if (missingInformation.includes("Expected timeline")) {
    questions.push(
      "What timeline are you working with for the project?",
    );
  }

  if (
    missingInformation.includes(
      "Authentication implementation details",
    )
  ) {
    questions.push(
      "Is authentication already implemented, or should it be developed as part of the project?",
    );
  }

  if (
    missingInformation.includes(
      "Existing API documentation",
    )
  ) {
    questions.push(
      "Could you provide documentation or examples for the existing APIs?",
    );
  }

  if (
    missingInformation.includes(
      "Specific analytics and metrics",
    )
  ) {
    questions.push(
      "Which analytics, metrics, or reports should the dashboard display?",
    );
  }

  if (
    missingInformation.includes(
      "Detailed final deliverables",
    )
  ) {
    questions.push(
      "What are the exact deliverables you expect at project completion?",
    );
  }

  return questions.slice(0, 5);
}

function generateStrategy(
  projectType: string,
  technologies: string[],
  concerns: string[],
) {
  const technologyText =
    technologies.length > 0
      ? technologies.slice(0, 4).join(", ")
      : "the technologies mentioned by the client";

  const concernText =
    concerns.length > 0
      ? "Address the unclear parts of the scope before committing to the final estimate."
      : "Focus on demonstrating relevant experience and a clear implementation approach.";

  return `Position the proposal around relevant ${projectType.toLowerCase()} experience, especially ${technologyText}. ${concernText}`;
}

function analyzeKnowledgeBase(
  jobDescription: string,
  knowledgeBase: KnowledgeBase,
  jobTechnologies: string[],
  jobSkills: string[],
) {
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const evidence: string[] = [];
  const relevantProjects: string[] = [];

  const freelancerSkills = knowledgeBase.skills;

  for (const requestedSkill of jobSkills) {
    const matchingSkill = freelancerSkills.find((skill) =>
      containsTerm(skill.skill_name, requestedSkill),
    );

    if (matchingSkill) {
      matchedSkills.push(requestedSkill);

      const experienceText =
        matchingSkill.years_experience !== null
          ? `${matchingSkill.years_experience} ${
              matchingSkill.years_experience === 1
                ? "year"
                : "years"
            } of experience`
          : "experience listed";

      const levelText = matchingSkill.skill_level
        ? ` at ${matchingSkill.skill_level} level`
        : "";

      evidence.push(
        `${requestedSkill}: ${experienceText}${levelText} in your Knowledge Base.`,
      );
    } else {
      missingSkills.push(requestedSkill);
    }
  }

  for (const requestedTechnology of jobTechnologies) {
    const matchingSkill = freelancerSkills.find((skill) =>
      containsTerm(skill.skill_name, requestedTechnology),
    );

    const matchingProject = knowledgeBase.projects.find(
      (project) =>
        project.technologies?.some((technology) =>
          containsTerm(technology, requestedTechnology),
        ) ||
        containsTerm(
          `${project.project_name} ${project.description ?? ""}`,
          requestedTechnology,
        ),
    );

    if (matchingSkill || matchingProject) {
      if (!matchedSkills.includes(requestedTechnology)) {
        matchedSkills.push(requestedTechnology);
      }

      if (matchingSkill) {
        evidence.push(
          `${requestedTechnology}: found in your listed skills.`,
        );
      } else if (matchingProject) {
        evidence.push(
          `${requestedTechnology}: found in the technologies or description of "${matchingProject.project_name}".`,
        );
      }
    } else {
      if (!missingSkills.includes(requestedTechnology)) {
        missingSkills.push(requestedTechnology);
      }
    }
  }

  for (const project of knowledgeBase.projects) {
    const projectText = [
      project.project_name,
      project.description ?? "",
      ...(project.technologies ?? []),
      project.client_industry ?? "",
    ].join(" ");

    const hasTechnologyMatch = jobTechnologies.some(
      (technology) => containsTerm(projectText, technology),
    );

    const hasSkillMatch = jobSkills.some(
      (skill) => containsTerm(projectText, skill),
    );

    const hasProjectTypeMatch =
      jobDescription.toLowerCase().includes("dashboard") &&
      projectText.toLowerCase().includes("dashboard");

    if (
      hasTechnologyMatch ||
      hasSkillMatch ||
      hasProjectTypeMatch
    ) {
      relevantProjects.push(project.project_name);

      const reasons: string[] = [];

      if (hasTechnologyMatch) {
        reasons.push("matching technology");
      }

      if (hasSkillMatch) {
        reasons.push("matching skill");
      }

      if (hasProjectTypeMatch) {
        reasons.push("matching project type");
      }

      evidence.push(
        `Relevant project: "${project.project_name}" (${reasons.join(
          ", ",
        )}).`,
      );
    }
  }

  return {
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills: [...new Set(missingSkills)].slice(0, 10),
    relevantProjects: [...new Set(relevantProjects)].slice(0, 5),
    evidence: [...new Set(evidence)].slice(0, 12),
  };
}

export function analyzeOpportunity(
  jobDescription: string,
): OpportunityAnalysis {
  const text = jobDescription.trim();

  const technologies = findMatches(text, TECHNOLOGIES);
  const skills = findMatches(text, SKILLS);

  const budget = extractBudget(text);
  const timeline = extractTimeline(text);
  const projectType = detectProjectType(text);

  const requirements = detectRequirements(
    text,
    technologies,
    skills,
  );

  const concerns = detectConcerns(
    text,
    budget,
    timeline,
  );

  const missingInformation = detectMissingInformation(
    text,
    budget,
    timeline,
  );

  const questions = generateQuestions(
    missingInformation,
  );

  const proposalStrategy = generateStrategy(
    projectType,
    technologies,
    concerns,
  );

  return {
    projectType,
    skills,
    technologies,
    budget,
    timeline,
    requirements,
    concerns,
    missingInformation,
    questions,
    proposalStrategy,
    matchedSkills: [],
    missingSkills: [],
    relevantProjects: [],
    evidence: [],
    knowledgeBaseUsed: false,
  };
}

export function analyzeOpportunityWithKnowledgeBase(
  jobDescription: string,
  knowledgeBase: KnowledgeBase,
): OpportunityAnalysis {
  const baseAnalysis = analyzeOpportunity(jobDescription);

  const knowledgeAnalysis = analyzeKnowledgeBase(
    jobDescription,
    knowledgeBase,
    baseAnalysis.technologies,
    baseAnalysis.skills,
  );

  return {
    ...baseAnalysis,
    ...knowledgeAnalysis,
    knowledgeBaseUsed: true,
  };
}
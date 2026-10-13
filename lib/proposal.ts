import { analyzeOpportunityWithKnowledgeBase, type KnowledgeBase } from "./analyzer";

/** Build client-facing copy from current evidence, never from internal strategy notes. */
export function generateProposal(
  opportunity: { title: string; job_description: string },
  profile: { full_name: string },
  skills: KnowledgeBase["skills"],
  projects: KnowledgeBase["projects"],
): string {
  const analysis = analyzeOpportunityWithKnowledgeBase(opportunity.job_description, {
    profile: null, skills, projects, certifications: [], portfolioLinks: [],
  });
  const paragraphs = ["Hi,", `I’m interested in your ${opportunity.title.trim() || "project"}.`];

  if (analysis.matchedSkills.length) {
    paragraphs.push(`My relevant experience includes ${analysis.matchedSkills.slice(0, 5).join(", ")}.`);
  }

  const relevantProjects = projects.filter(project => analysis.relevantProjects.includes(project.project_name));
  for (const project of relevantProjects.slice(0, 2)) {
    // Explain the overlap rather than claiming the projects have identical scope.
    const projectAnalysis = analyzeOpportunityWithKnowledgeBase(opportunity.job_description, {
      profile: null, skills: [], projects: [project], certifications: [], portfolioLinks: [],
    });
    const overlap = projectAnalysis.matchedSkills.slice(0, 4);
    if (overlap.length) {
      paragraphs.push(`In ${project.project_name}, I worked with ${overlap.join(", ")}, which overlaps with your requirements.`);
    }
  }

  if (!analysis.matchedSkills.length) {
    paragraphs.push("Could we discuss the technical requirements first so I can assess whether my experience is a good fit?");
  } else if (analysis.missingSkills.length) {
    paragraphs.push(`Before committing to the full scope, I’d like to discuss the requirements around ${analysis.missingSkills.slice(0, 4).join(", ")} and confirm which parts I can take on.`);
  }

  paragraphs.push("I’d start by agreeing on the deliverables and acceptance criteria, then divide the work into milestones with review points.");
  const questions = analysis.questions.slice(0, 2);
  if (questions.length) paragraphs.push(`A couple of questions to clarify the scope:\n${questions.map(question => `- ${question}`).join("\n")}`);
  paragraphs.push("Once those details are clear, we can agree on an estimate and next steps.");
  paragraphs.push(["Best regards,", profile.full_name.trim()].filter(Boolean).join("\n"));
  return paragraphs.join("\n\n");
}

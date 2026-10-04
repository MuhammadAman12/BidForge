import { supabase } from "@/lib/supabase";
import { analyzeOpportunityWithKnowledgeBase, type KnowledgeBase, type OpportunityAnalysis } from "@/lib/analyzer";

export class SignInRequired extends Error {}
export type AnalysisContext = { profileId: string; knowledgeBase: KnowledgeBase };
export async function loadAnalysisContext(): Promise<AnalysisContext> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user) throw new SignInRequired("Sign in to analyze an opportunity.");
  if (error) throw error;
  const profileResult = await supabase.from("profiles").select("id, full_name, professional_title, bio, hourly_rate, availability").eq("user_id", user.id).maybeSingle();
  if (profileResult.error) throw profileResult.error;
  if (!profileResult.data) throw new Error("Create your profile in the Knowledge Base before analyzing an opportunity.");
  const profile = profileResult.data;
  const results = await Promise.all([
    supabase.from("skills").select("skill_name, skill_level, years_experience").eq("profile_id", profile.id),
    supabase.from("projects").select("project_name, description, technologies, client_industry, project_url").eq("profile_id", profile.id),
    supabase.from("certifications").select("certification_name, issuing_organization").eq("profile_id", profile.id),
    supabase.from("portfolio_links").select("platform, url, label").eq("profile_id", profile.id),
  ]);
  for (const result of results) if (result.error) throw result.error;
  return { profileId: profile.id, knowledgeBase: {
    profile: { full_name: profile.full_name ?? "", professional_title: profile.professional_title ?? "", bio: profile.bio ?? "", hourly_rate: profile.hourly_rate, availability: profile.availability ?? "" },
    skills: results[0].data ?? [], projects: results[1].data ?? [], certifications: results[2].data ?? [], portfolioLinks: (results[3].data ?? []).map(link => ({...link, platform: link.platform ?? ""})),
  } };
}
export function runAnalysis(description: string, context: AnalysisContext) {
  return analyzeOpportunityWithKnowledgeBase(description, context.knowledgeBase);
}
export async function saveAnalyzedOpportunity(input: { title: string; description: string; source: string }, analysis: OpportunityAnalysis, context: AnalysisContext) {
  if (!input.title.trim() || !input.description.trim()) {
    throw new Error("Enter an opportunity title and description before saving.");
  }
  if (input.title.length > 200 || input.source.length > 200 || input.description.length > 30000) {
    throw new Error("The opportunity exceeds the supported input length.");
  }
  const { data, error } = await supabase.from("opportunities").insert({
    profile_id: context.profileId, title: input.title.trim(), job_description: input.description.trim(), source: input.source.trim() || null,
    budget: analysis.budget, timeline: analysis.timeline, project_type: analysis.projectType, analysis, status: "analyzed",
  }).select("id").single();
  if (error) throw error;
  if (!data?.id) throw new Error("The server did not return the saved opportunity ID. Check your opportunities before retrying.");
  return data.id as number;
}

"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { OpportunityAnalysis } from "@/lib/analyzer";
import { loadAnalysisContext, runAnalysis, saveAnalyzedOpportunity, SignInRequired, type AnalysisContext } from "@/services/opportunity-analysis";
const message = (error: unknown) => error instanceof Error ? error.message : typeof error === "object" && error && "message" in error ? String(error.message) : "Something went wrong. Please try again.";
export function useOpportunityAnalysis() {
  const router = useRouter();
  const [context, setContext] = useState<AnalysisContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState({ title: "", description: "", source: "" });
  const [analysis, setAnalysis] = useState<OpportunityAnalysis | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  useEffect(() => {
    let cancelled = false;
    const existingId = new URLSearchParams(window.location.search).get("opportunity");
    if (existingId && /^\d+$/.test(existingId)) { router.replace(`/opportunity/${existingId}`); return; }
    loadAnalysisContext().then(value => {
      if (cancelled) return;
      setContext(value);
      // Browser storage is optional; privacy settings must not disable analysis.
      try {
        const description = sessionStorage.getItem("bidforge-job") ?? "";
        setInput(current => ({ ...current, description }));
      } catch { /* The user can still paste the brief manually. */ }
    }).catch(err => {
      if (cancelled) return;
      if (err instanceof SignInRequired) router.replace("/login");
      else setError(message(err));
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [router]);
  function updateInput(field: keyof typeof input, value: string) {
    setInput(current => ({ ...current, [field]: value })); setAnalysis(null); setError("");
  }
  function analyze() {
    if (!context || !input.title.trim() || !input.description.trim()) return;
    setError(""); setAnalysis(runAnalysis(input.description, context));
  }
  async function save() {
    if (!context || !analysis || savingRef.current) return;
    savingRef.current = true; setSaving(true); setError("");
    try {
      const id = await saveAnalyzedOpportunity(input, analysis, context);
      // The database write succeeded. A storage exception must not invite a
      // retry that inserts a second opportunity.
      try { sessionStorage.removeItem("bidforge-job"); } catch { /* Optional cache. */ }
      router.push(`/opportunity/${id}`);
    } catch (err) { setError(message(err)); }
    finally { savingRef.current = false; setSaving(false); }
  }
  return { input, updateInput, analysis, analyze, save, loading, saving, error, ready: !!context, context };
}

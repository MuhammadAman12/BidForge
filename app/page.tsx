"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useBidForgeTheme } from "@/app/theme-provider";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const { theme, toggleTheme } = useBidForgeTheme();
  const router = useRouter();

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return;

    sessionStorage.setItem("bidforge-job", jobDescription);
    router.push("/analyze");
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-[#08090d] dark:text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-xl font-semibold tracking-tight">
          <span>Bid</span>
          <span className="text-blue-500">Forge</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:border-gray-300 hover:text-gray-900 sm:block dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:text-white">
            How it works
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:border-white/20 dark:hover:bg-white/[0.08]"
            aria-label={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-20 text-center">
        <div className="mb-6 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
          Freelance opportunity intelligence
        </div>

        <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Know before you bid.
          <br />
          <span className="text-blue-500 dark:text-blue-400">
            Build better proposals.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
          Paste a freelance job or client brief. BidForge analyzes the
          opportunity, identifies potential concerns, and helps you build a
          personalized proposal.
        </p>

        <div className="mt-12 w-full max-w-3xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-xl shadow-gray-200/60 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-2xl dark:shadow-black/20">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste an Upwork job or client brief here..."
              className="min-h-[220px] w-full resize-none rounded-xl bg-transparent p-5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-600"
            />

            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-3 pt-3 sm:flex-row dark:border-white/10">
              <span className="text-sm text-gray-500">
                Free to try • No credit card
              </span>

              <button
                onClick={handleAnalyze}
                disabled={!jobDescription.trim()}
                className="rounded-xl bg-blue-500 px-6 py-3 font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-blue-400"
              >
                Analyze Opportunity →
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-600">
          Try a real job description to see what BidForge finds.
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-3">
          <Feature
            title="Opportunity Analysis"
            description="Understand the requirements, scope, budget information, and potential concerns before spending time on a proposal."
          />

          <Feature
            title="Personalized Proposals"
            description="Build proposals around your actual skills, experience, projects, and portfolio instead of generic AI text."
          />

          <Feature
            title="Freelancer Knowledge Base"
            description="Keep your professional experience in one place so future proposals can become faster and more relevant."
          />
        </div>
      </section>

      <footer className="border-t border-gray-200 px-6 py-8 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-600">
        © {new Date().getFullYear()} BidForge
      </footer>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-500">
        {description}
      </p>
    </div>
  );
}
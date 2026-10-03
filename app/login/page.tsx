"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("bidforge-theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);

      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    setTheme(newTheme);
    localStorage.setItem("bidforge-theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "signup") {
        const { error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (signUpError) {
          throw signUpError;
        }

        setMessage(
          "Account created successfully. Redirecting to your profile..."
        );

        setTimeout(() => {
          router.push("/profile");
        }, 800);

        return;
      }

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        throw loginError;
      }

      router.push("/profile");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-[#08090d] dark:text-white">
      <nav className="border-b border-gray-200 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            <span>Bid</span>
            <span className="text-blue-500 dark:text-blue-400">
              Forge
            </span>
          </a>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:border-white/20 dark:hover:bg-white/[0.08]"
            aria-label={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-medium text-blue-500 dark:text-blue-400">
              {mode === "login"
                ? "WELCOME BACK"
                : "GET STARTED"}
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              {mode === "login"
                ? "Sign in to BidForge"
                : "Create your BidForge account"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              {mode === "login"
                ? "Access your freelancer profile and proposal workspace."
                : "Build your freelancer profile and create personalized proposals."}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-gray-600"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="••••••••"
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  minLength={6}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-gray-600"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Minimum 6 characters.
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.08] dark:text-red-300">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700 dark:border-green-400/20 dark:bg-green-400/[0.08] dark:text-green-300">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-500 px-5 py-3 font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </form>

            <div className="mt-6 border-t border-gray-200 pt-6 text-center dark:border-white/10">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </p>

              <button
                type="button"
                onClick={switchMode}
                className="mt-2 text-sm font-medium text-blue-500 transition hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {mode === "login"
                  ? "Create an account"
                  : "Sign in instead"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-gray-500 transition hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
            >
              ← Back to BidForge
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
"use client";

import { useState } from "react";
import { UrlForm } from "@/components/url-form";
import { AnalysisResult } from "@/components/analysis-result";
import type { AnalysisResponse } from "@/types/analysis";
import { analyzeCompany } from "@/lib/api";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setError(null);
    setLoading(true);
    try {
      const result = await analyzeCompany(url);
      setAnalysis(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred.";
      setError(message);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-[900px] flex-col px-4 py-12 sm:px-6">
      <header className="mb-10 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
          AI Opportunity Analyzer
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-secondary">
          Generate a structured, consultant-grade view of where AI can create value,
          grounded in public signals.
        </p>
      </header>

      <section className="mb-6">
        <UrlForm onAnalyze={handleAnalyze} loading={loading} />
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </section>

      <section className="flex-1 pb-12">
        <AnalysisResult data={analysis} />
      </section>

      <footer className="mt-14 border-t border-border pt-5 text-xs leading-relaxed text-secondary">
        <p>
          This is an advisory tool. It uses only public website content and large
          language models; outputs are directional, not guarantees.
        </p>
      </footer>
    </main>
  );
}


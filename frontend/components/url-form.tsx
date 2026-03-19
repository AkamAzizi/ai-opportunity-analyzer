"use client";

import { FormEvent, useState } from "react";

interface UrlFormProps {
  onAnalyze: (url: string) => Promise<void> | void;
  loading: boolean;
}

export function UrlForm({ onAnalyze, loading }: UrlFormProps) {
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!url) return;
    await onAnalyze(url.trim());
  };

  const hasError = touched && !url;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
    >
      <label className="text-xs font-medium uppercase tracking-wide text-secondary">
        Company website URL
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          required
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => setTouched(true)}
          className="flex-1 rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-primary outline-none placeholder:text-secondary focus:border-accent focus:ring-2 focus:ring-accent/25"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>
      {hasError ? (
        <p className="text-xs text-red-400">
          Please paste a valid public website URL.
        </p>
      ) : (
        <p className="text-xs text-secondary">
          No authentication. Public marketing sites work best.
        </p>
      )}
    </form>
  );
}


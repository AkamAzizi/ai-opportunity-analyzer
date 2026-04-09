import type { AnalysisResponse } from "@/types/analysis";

export async function analyzeCompany(url: string): Promise<AnalysisResponse> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  if (!res.ok) {
    const message =
      (await res.json().catch(() => null))?.detail || "Failed to analyze company.";
    throw new Error(message);
  }

  return res.json();
}


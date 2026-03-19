import type { AnalysisResponse } from "@/types/analysis";

const DEFAULT_BACKEND_URL = "http://localhost:8000";

export async function analyzeCompany(url: string): Promise<AnalysisResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;

  const res = await fetch(`${backendUrl}/api/analyze`, {
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


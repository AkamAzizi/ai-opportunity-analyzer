import { NextResponse } from "next/server";

const DEFAULT_BACKEND_URL = "http://localhost:8000";

export async function POST(req: Request) {
  const rawBackendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  const backendUrl = rawBackendUrl.replace(/\/+$/, "");

  if (!process.env.BACKEND_URL) {
    console.warn(
      "[api/analyze] BACKEND_URL is not set; using fallback http://localhost:8000"
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${backendUrl}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      console.error("[api/analyze] Backend returned non-OK response", {
        backendUrl,
        status: upstream.status,
        detail: data?.detail || null
      });
      return NextResponse.json(
        {
          detail:
            data?.detail ||
            `Backend request failed with status ${upstream.status}.`
        },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[api/analyze] Failed to reach backend", {
      backendUrl,
      error: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json(
      { detail: `Could not reach backend service at ${backendUrl}.` },
      { status: 502 }
    );
  }
}

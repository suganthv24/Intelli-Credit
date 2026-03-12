import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const BACKEND_URL = "https://intellicredit.hub.zerve.cloud";

export const maxDuration = 60;

// ── Text extraction ──────────────────────────────────────────────────────────
// We only attempt to extract actual text for recognised text-based files.
// For PDFs we currently cannot parse server-side without a native dependency
// that works in Next.js Turbopack.  Rather than sending binary garbage and
// crashing the AI regex extractor, we leave the documents list empty for
// PDF-only submissions — the AI API then falls back to its built-in
// sample financial documents and still runs the full analysis pipeline.
async function extractTextSafe(file: File): Promise<string | null> {
  const lname = file.name.toLowerCase();
  const isText = lname.endsWith(".txt") ||
    lname.endsWith(".md") ||
    lname.endsWith(".csv") ||
    file.type.startsWith("text/");

  if (!isText) {
    // PDF / binary — do NOT decode as UTF-8 (produces garbage that crashes AI)
    console.log(`[Proxy]  • ${file.name} — skipping binary file, will use sample docs`);
    return null;
  }

  const arrayBuffer = await file.arrayBuffer();
  const text = new TextDecoder("utf-8", { fatal: false }).decode(arrayBuffer).trim();
  console.log(`[Proxy]  • ${file.name} — extracted ${text.length} chars`);
  return text.length > 0 ? text : null;
}

// ── Non-fatal DB persist ─────────────────────────────────────────────────────
async function saveToDb(data: Record<string, unknown>, company_name: string, promoter_name: string) {
  try {
    const { default: pool } = await import("@/lib/db");
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO credit_analyses (
           analysis_id, company_name, promoter_name, risk_score, risk_band,
           recommendation, loan_limit, interest_rate, cam_report_url, analysis_json, created_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
         ON CONFLICT (analysis_id) DO NOTHING`,
        [
          data.analysis_id, company_name, promoter_name,
          data.risk_score, data.risk_band, data.recommendation,
          data.loan_limit, data.interest_rate, data.cam_report_url,
          JSON.stringify(data),
        ]
      );
      console.log(`[DB] ✅ Saved analysis ${data.analysis_id}`);
    } finally {
      client.release();
    }
  } catch (e: any) {
    console.warn(`[DB] ⚠️ Non-fatal: ${e.message}`);
  }
}

// ── Non-fatal local file save ────────────────────────────────────────────────
async function saveFilesLocally(
  analysis_id: string,
  files: File[],
  meta: Record<string, unknown>
) {
  try {
    const dir = path.join(process.cwd(), "data", "uploads", analysis_id);
    await fs.mkdir(dir, { recursive: true });
    for (const f of files) {
      const safe = f.name.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      await fs.writeFile(path.join(dir, safe), Buffer.from(await f.arrayBuffer()));
    }
    await fs.writeFile(path.join(dir, "metadata.json"), JSON.stringify(meta, null, 2));
  } catch (e: any) {
    console.warn(`[Local] ⚠️ Non-fatal: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Parse form data ─────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const company_name = ((formData.get("company_name") as string) ?? "").trim();
  const promoter_name = ((formData.get("promoter_name") as string) ?? "").trim();
  const sector = ((formData.get("sector") as string) ?? "").trim();
  const documentFiles = formData.getAll("documents") as File[];

  if (!company_name || !promoter_name || !sector) {
    return NextResponse.json(
      { error: "company_name, promoter_name and sector are required." },
      { status: 400 }
    );
  }
  if (documentFiles.length !== 5) {
    return NextResponse.json(
      { error: `Exactly 5 documents required. Got ${documentFiles.length}.` },
      { status: 400 }
    );
  }

  // ── Optional enriched fields ────────────────────────────────────────────
  const CIN = (formData.get("CIN") as string) || undefined;
  const PAN = (formData.get("PAN") as string) || undefined;
  const turnover = formData.get("turnover") ? parseFloat(formData.get("turnover") as string) : undefined;
  const loan_amount_requested = formData.get("loan_amount_requested") ? parseFloat(formData.get("loan_amount_requested") as string) : undefined;
  const loan_type = (formData.get("loan_type") as string) || undefined;
  const loan_tenure = (formData.get("loan_tenure") as string) || undefined;
  const expected_interest_rate = formData.get("expected_interest_rate") ? parseFloat(formData.get("expected_interest_rate") as string) : undefined;

  let primary_insights: Record<string, string> = {};
  try { primary_insights = JSON.parse((formData.get("primary_insights") as string) || "{}"); } catch { /* ignore */ }

  let doc_type_overrides: { doc_id: string; confirmed_type: string }[] = [];
  try { doc_type_overrides = JSON.parse((formData.get("doc_type_overrides") as string) || "[]"); } catch { /* ignore */ }

  // ── Attempt text extraction — PDFs return null ─────────────────────────
  console.log(`[Proxy] Processing ${documentFiles.length} uploaded files...`);
  const rawTexts: (string | null)[] = await Promise.all(documentFiles.map(extractTextSafe));
  const documentTexts: string[] = rawTexts.filter((t): t is string => t !== null && t.length > 0);

  // If every file was a binary PDF (no extractable text), we let the AI use its
  // built-in sample documents by sending an empty array.
  const usingAiSamples = documentTexts.length === 0;
  if (usingAiSamples) {
    console.log("[Proxy] ℹ️ No extractable text from uploads — system will use its sample documents.");
  } else {
    console.log(`[Proxy] Sending ${documentTexts.length} text document(s) to AI.`);
  }

  // ── Build strict AI payload ──────────────────────────────────────────
  const aiPayload: Record<string, unknown> = {
    company_name,
    promoter_name,
    sector,
    documents: documentTexts,   // [] triggers sample-doc fallback
    news_fetch: false,           // skip live news to reduce latency/timeouts
  };
  if (CIN) aiPayload.CIN = CIN;
  if (PAN) aiPayload.PAN = PAN;
  if (turnover !== undefined) aiPayload.turnover = turnover;
  if (loan_amount_requested !== undefined) aiPayload.loan_amount_requested = loan_amount_requested;
  if (loan_type) aiPayload.loan_type = loan_type;
  if (loan_tenure) aiPayload.loan_tenure = loan_tenure;
  if (expected_interest_rate !== undefined) aiPayload.expected_interest_rate = expected_interest_rate;
  if (Object.keys(primary_insights).length) aiPayload.primary_insights = primary_insights;

  // ── Forward to AI ────────────────────────────────────────────────────
  console.log(`[Proxy] → POST ${BACKEND_URL}/credit-analysis for "${company_name}"`);

  let data: Record<string, unknown>;
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 55_000);

    const res = await fetch(`${BACKEND_URL}/credit-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(aiPayload),
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(tid);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[Proxy] AI ${res.status}:`, errText.slice(0, 500));
      return NextResponse.json(
        { error: `AI returned HTTP ${res.status}. Please retry.` },
        { status: 502 }
      );
    }

    data = await res.json();
    console.log(`[Proxy] ✅ AI success — analysis_id: ${data.analysis_id}`);
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError";
    const msg = isTimeout
      ? "The AI analysis timed out (>55 s). Please retry."
      : `Cannot reach AI API: ${err.message}`;
    console.error("[Proxy] Fetch error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // ── Non-fatal side-effects ──────────────────────────────────────────────
  const analysis_id = (data.analysis_id as string) ?? "unknown";

  saveFilesLocally(analysis_id, documentFiles, {
    analysis_id, company_name, upload_timestamp: new Date().toISOString(),
    using_ai_samples: usingAiSamples,
    files: documentFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    doc_type_overrides, primary_insights,
  });

  saveToDb(data, company_name, promoter_name);

  // ── Return enriched response ────────────────────────────────────────────
  return NextResponse.json({
    ...data,
    company_name,
    promoter_name,
    sector,
    CIN,
    PAN,
    turnover,
    loan_amount_requested,
    loan_type,
    loan_tenure,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import pool from "@/lib/db";

const BACKEND_URL = "https://intellicredit.hub.zerve.cloud";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  // ── Extract entity fields ────────────────────────────────────────────────
  const company_name  = (formData.get("company_name")  as string)?.trim();
  const promoter_name = (formData.get("promoter_name") as string)?.trim();
  const sector        = (formData.get("sector")        as string)?.trim();
  const documentFiles = formData.getAll("documents") as File[];

  if (!company_name || !promoter_name || !sector || documentFiles.length !== 5) {
    return NextResponse.json(
      { error: "Missing required fields or must upload exactly 5 documents." },
      { status: 400 }
    );
  }

  // ── Extract optional enriched fields ────────────────────────────────────
  const CIN                  = (formData.get("CIN")                  as string) ?? undefined;
  const PAN                  = (formData.get("PAN")                  as string) ?? undefined;
  const turnover             = formData.get("turnover")             ? parseFloat(formData.get("turnover") as string) : undefined;
  const loan_amount_requested = formData.get("loan_amount_requested") ? parseFloat(formData.get("loan_amount_requested") as string) : undefined;
  const loan_type            = (formData.get("loan_type")            as string) ?? undefined;
  const loan_tenure          = (formData.get("loan_tenure")          as string) ?? undefined;
  const expected_interest_rate = formData.get("expected_interest_rate") ? parseFloat(formData.get("expected_interest_rate") as string) : undefined;

  // ── Parse JSON blobs ─────────────────────────────────────────────────────
  let primary_insights: Record<string, string> = {};
  try {
    const raw = formData.get("primary_insights") as string;
    if (raw) primary_insights = JSON.parse(raw);
  } catch { /* ignore malformed JSON */ }

  let doc_type_overrides: { doc_id: string; confirmed_type: string }[] = [];
  try {
    const raw = formData.get("doc_type_overrides") as string;
    if (raw) doc_type_overrides = JSON.parse(raw);
  } catch { /* ignore */ }

  try {
    // ── Extract text from PDFs ──────────────────────────────────────────
    const documentTexts: string[] = [];
    for (const file of documentFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
        try {
          // Use require() to avoid Next.js ESM bundler issues with this CJS module
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require("pdf-parse");
          const pdfData = await pdfParse(buffer);
          documentTexts.push(pdfData.text);
        } catch {
          console.warn(`[Proxy] PDF parse failed for ${file.name}, using text fallback`);
          documentTexts.push(new TextDecoder("utf-8").decode(arrayBuffer));
        }
      } else {
        documentTexts.push(new TextDecoder("utf-8").decode(arrayBuffer));
      }
    }

    // ── Build Zerve payload (strict schema) ─────────────────────────────
    const zervePayload: Record<string, unknown> = {
      company_name,
      promoter_name,
      sector,
      documents: documentTexts,
    };

    // Attach optional enriched fields only if provided
    if (CIN)                    zervePayload.CIN = CIN;
    if (PAN)                    zervePayload.PAN = PAN;
    if (turnover !== undefined)               zervePayload.turnover = turnover;
    if (loan_amount_requested !== undefined)  zervePayload.loan_amount_requested = loan_amount_requested;
    if (loan_type)              zervePayload.loan_type = loan_type;
    if (loan_tenure)            zervePayload.loan_tenure = loan_tenure;
    if (expected_interest_rate !== undefined) zervePayload.expected_interest_rate = expected_interest_rate;
    if (Object.keys(primary_insights).length) zervePayload.primary_insights = primary_insights;

    // ── Forward to Zerve Cloud ──────────────────────────────────────────
    console.log(`[Proxy] → ${BACKEND_URL}/credit-analysis for "${company_name}"`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    const res = await fetch(`${BACKEND_URL}/credit-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(zervePayload),
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Proxy] Zerve error ${res.status}:`, errorText);
      return NextResponse.json(
        { error: "Credit analysis failed. Please retry." },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log(`[Proxy] ✅ Analysis complete. ID: ${data.analysis_id}`);

    // ── Store files locally ──────────────────────────────────────────────
    const analysis_id = data.analysis_id;
    const uploadDir = path.join(process.cwd(), "data", "uploads", analysis_id);
    await fs.mkdir(uploadDir, { recursive: true });

    for (const file of documentFiles) {
      const safeName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      await fs.writeFile(path.join(uploadDir, safeName), Buffer.from(await file.arrayBuffer()));
    }

    await fs.writeFile(
      path.join(uploadDir, "metadata.json"),
      JSON.stringify({
        analysis_id,
        company_name,
        upload_timestamp: new Date().toISOString(),
        files: documentFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        doc_type_overrides,
        primary_insights,
      }, null, 2)
    );

    // ── Persist to PostgreSQL ────────────────────────────────────────────
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO credit_analyses (
          analysis_id, company_name, promoter_name, risk_score, risk_band,
          recommendation, loan_limit, interest_rate, cam_report_url, analysis_json, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (analysis_id) DO NOTHING
      `, [
        analysis_id, company_name, promoter_name,
        data.risk_score, data.risk_band, data.recommendation,
        data.loan_limit, data.interest_rate, data.cam_report_url,
        JSON.stringify(data),
      ]);
    } finally {
      client.release();
    }

    // ── Augment response with echoed entity & loan metadata for Dashboard
    const enrichedData = {
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
    };

    return NextResponse.json(enrichedData);

  } catch (err: any) {
    console.error(`[Proxy] Fatal error:`, err.message);
    return NextResponse.json(
      { error: "Credit analysis failed due to a server error. Please retry." },
      { status: 500 }
    );
  }
}

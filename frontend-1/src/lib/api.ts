import type { CreditAnalysis } from "@/store/creditStore";

/**
 * Calls the Next.js API proxy route which forwards the request
 * to the internal AI backend server-side, storing the files and DB record.
 */
export async function analyzeCompany(formData: FormData): Promise<CreditAnalysis> {
  console.log("[AI] Calling /api/analyze proxy with FormData...");

  const res = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(errorData.error || `Analysis failed (${res.status})`);
  }

  const data = await res.json();
  console.log("[AI] Analysis response received successfully");
  return data;
}

export async function getAnalysis(analysisId: string): Promise<CreditAnalysis> {
  try {
    const res = await fetch(`/api/analysis/${analysisId}`);
    if (!res.ok) {
      throw new Error("Failed to retrieve analysis.");
    }
    return await res.json();
  } catch (err: any) {
    throw err;
  }
}

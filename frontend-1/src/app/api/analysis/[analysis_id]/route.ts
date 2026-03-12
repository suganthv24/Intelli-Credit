import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ analysis_id: string }> }
) {
  const { analysis_id } = await context.params;

  if (!analysis_id) {
    return NextResponse.json({ error: "Missing analysis_id parameter" }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT analysis_json FROM credit_analyses WHERE analysis_id = $1",
        [analysis_id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
      }

      return NextResponse.json(result.rows[0].analysis_json);
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error(`[Analysis Fetch] Error reading from PostgreSQL:`, err.message);
    return NextResponse.json({ error: "Failed to retrieve analysis due to a server error." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://intellicredit.hub.zerve.cloud";

/**
 * Proxy route for downloading CAM report PDFs from the Zerve backend.
 * Now includes a fallback to a dummy PDF if the backend is unreachable.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = await params;

  if (!filename) {
    return NextResponse.json(
      { error: "Missing 'filename' path parameter" },
      { status: 400 }
    );
  }

  // ── Try the real Zerve cloud backend first ────────────────────────────────
  try {
    const fetchPath = `/reports/${filename}`;
    console.log(`[Report Proxy] Fetching ${BACKEND_URL}${fetchPath} ...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const res = await fetch(`${BACKEND_URL}${fetchPath}`, {
      signal: controller.signal,
      // @ts-ignore
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "application/pdf";
      const blob = await res.arrayBuffer();
      
      console.log(`[Report Proxy] ✅ Live PDF served: ${filename}`);
      
      return new NextResponse(blob, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": blob.byteLength.toString(),
        },
      });
    }
    
    console.warn(`[Report Proxy] Backend responded ${res.status}, generating demo PDF`);
  } catch (err: any) {
    console.warn(`[Report Proxy] Backend unreachable: ${err.message}, generating demo PDF`);
  }

  // ── Fallback: Generate a very simple dummy PDF file ───────────────────────
  // A minimal valid PDF header/content so the browser recognizes it
  const dummyPdf = `%PDF-1.4
1 0 obj < < /Type /Catalog /Pages 2 0 R > > endobj
2 0 obj < < /Type /Pages /Kids [3 0 R] /Count 1 > > endobj
3 0 obj < < /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R > > endobj
4 0 obj < < /Length 50 > > stream
BT /F1 24 Tf 100 700 Td (Demo Credit Appraisal Memo - ${filename}) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000115 00000 n
0000000215 00000 n
trailer < < /Size 5 /Root 1 0 R > >
startxref
315
%%EOF`;

  const encoder = new TextEncoder();
  const pdfBytes = encoder.encode(dummyPdf);

  console.log(`[Report Proxy] 🎁 Serving demo PDF: ${filename}`);

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBytes.byteLength.toString(),
      "X-Demo-Mode": "true",
    },
  });
}

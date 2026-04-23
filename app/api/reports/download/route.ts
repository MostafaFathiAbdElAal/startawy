import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // --- Auth Check ---
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("id");
    const type = searchParams.get("type");

    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }

    if (type === 'library') {
      // --- Permission Check ---
      const dbUser = await prisma.user.findUnique({
        where: { id: userPayload.id },
        include: { 
          founder: {
            include: {
              payments: { orderBy: { transDate: 'desc' }, take: 1 }
            }
          } 
        }
      });

      const isPremium =
        dbUser?.type === 'CONSULTANT' ||
        dbUser?.type === 'ADMIN' ||
        (dbUser?.founder?.payments?.[0]?.amount ?? 0) >= 299;

      if (!isPremium) {
        return NextResponse.json({ 
          error: "Action Forbidden", 
          message: "Please upgrade to Premium Plan to download full research reports." 
        }, { status: 403 });
      }

      // --- Fetch Report from DB ---
      const report = await prisma.startawyReport.findUnique({
        where: { id: parseInt(reportId) }
      });

      if (!report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }

      // --- Extract PDF URL and title from JSON metadata ---
      let pdfUrl = "";
      let reportTitle = report.industry || "startawy-report";
      try {
        const metadata = JSON.parse(report.link);
        pdfUrl = metadata.pdfUrl || "";
        if (metadata.title) reportTitle = metadata.title;
      } catch {
        if (report.link.startsWith('http')) pdfUrl = report.link;
      }

      if (!pdfUrl) {
        return NextResponse.json({ error: "Download link not available" }, { status: 400 });
      }

      const safeFilename = `${reportTitle.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_.]/g, '').toLowerCase()}.pdf`;

      // --- Server-side proxy: fetch from Cloudinary and stream to client ---
      // Now that PDF delivery is enabled in Cloudinary, this fetch succeeds.
      // This avoids browser CORS restrictions and keeps the user on the page.
      console.log(`[DOWNLOAD] Fetching: ${pdfUrl}`);
      const cloudRes = await fetch(pdfUrl);

      if (!cloudRes.ok) {
        console.error(`[DOWNLOAD] Cloudinary fetch failed: ${cloudRes.status} for ${pdfUrl}`);
        return NextResponse.json(
          { error: "File unavailable", details: `Cloudinary returned ${cloudRes.status}` },
          { status: 502 }
        );
      }

      const buffer = await cloudRes.arrayBuffer();
      console.log(`[DOWNLOAD] Success — streaming ${buffer.byteLength} bytes as "${safeFilename}"`);

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${safeFilename}"`,
          "Content-Length": buffer.byteLength.toString(),
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });

  } catch (error) {
    console.error("[DOWNLOAD] System Error:", error);
    return NextResponse.json({ 
      error: "Server Error", 
      details: error instanceof Error ? error.message : "Unknown" 
    }, { status: 500 });
  }
}

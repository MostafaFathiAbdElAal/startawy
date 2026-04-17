import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("id");
    const type = searchParams.get("type"); // 'custom' or 'library'

    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }

    // Access Control check for library reports
    if (type === 'library') {
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

      const lastPayment = dbUser?.founder?.payments[0];
      const isPremium = lastPayment?.amount === 299;

      if (!isPremium) {
        return NextResponse.json({ 
          error: "Action Forbidden", 
          message: "Please upgrade to Premium Plan to download full research reports." 
        }, { status: 403 });
      }

      // Fetch the real Cloudinary link from the DB
      const report = await prisma.startawyReport.findUnique({
        where: { id: parseInt(reportId) }
      });

      if (!report) {
         return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }

      try {
        const metadata = JSON.parse(report.link);
        if (metadata.pdfUrl) {
            // Redirect to the actual Cloudinary PDF URL
            return NextResponse.redirect(new URL(metadata.pdfUrl));
        }
      } catch (e) {
        // Fallback if not JSON or legacy format
        if (report.link.startsWith('http')) {
            return NextResponse.redirect(new URL(report.link));
        }
      }
    }

    // Fallback for custom reports or errors
    const fileContent = `Startawy ${type} Report\nID: ${reportId}\nNote: Direct cloud access prioritized over static generation.`;
    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="startawy-report-${reportId}.txt"`,
      },
    });

  } catch (error) {
    console.error("Download Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

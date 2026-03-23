import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";

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

    // In a real app we would fetch the report S3 URL or generate PDF
    // For this demonstration, we'll return a mock text file acting as a report.
    const fileContent = `Startawy ${type === 'custom' ? 'Founder' : 'Market'} Report\n\nReport ID: ${reportId}\nGenerated on: ${new Date().toISOString()}\n\nThis is a securely downloaded mock report for the requested data.`;
    
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

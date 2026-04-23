import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    // Check if this user already viewed this report
    const existingView = await prisma.reportView.findUnique({
      where: {
        reportId_userId: {
          reportId: parseInt(reportId),
          userId: userPayload.id
        }
      }
    });

    let updatedReport;

    if (!existingView) {
      // Create unique view record and increment main counter
      await prisma.reportView.create({
        data: {
          reportId: parseInt(reportId),
          userId: userPayload.id
        }
      });

      updatedReport = await prisma.startawyReport.update({
        where: { id: parseInt(reportId) },
        data: {
          views: {
            increment: 1
          }
        },
        select: {
          views: true
        }
      });
    } else {
      // Already viewed, just get current count
      updatedReport = await prisma.startawyReport.findUnique({
        where: { id: parseInt(reportId) },
        select: {
          views: true
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      views: updatedReport?.views || 0 
    });

  } catch (error) {
    console.error("Report View API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const userPayload = await verifyAuth(token);

    const isOwner = !!userPayload?.isOwner;

    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "SYSTEM_ADMIN" && !isOwner)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, category } = body;

    // Validate Status & Category according to PDF workflows
    const validStatuses = ["PENDING", "REVIEWED", "ACTION_TAKEN"];
    const validCategories = ["POSITIVE", "SUGGESTION", "COMPLAINT"];

    if (status && !validStatuses.includes(status)) {
       return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    if (category && !validCategories.includes(category)) {
       return NextResponse.json({ error: "Invalid category value." }, { status: 400 });
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id: parseInt(id) },
      data: {
        comment: body.comment || undefined,
        rating: body.rating || undefined,
      },
    });

    return NextResponse.json({ success: true, feedback: updatedFeedback });
  } catch (error) {
    console.error("[ADMIN_FEEDBACK_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Failed to update feedback status." }, { status: 500 });
  }
}

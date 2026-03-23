import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";

// GET all feedback (Admin only)
export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    return NextResponse.json(feedbacks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

// DELETE a specific feedback (Admin only)
export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userPayload.id as string) }
    });

    if (!user || user.type !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.feedback.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
  }
}

// User submitting feedback (Founders/Consultants)
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { rating, comment } = body;

    const feedback = await prisma.feedback.create({
      data: {
        userId: parseInt(userPayload.id as string),
        rating: parseInt(rating),
        comment
      }
    });

    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

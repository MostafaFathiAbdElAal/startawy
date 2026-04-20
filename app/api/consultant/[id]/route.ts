import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const consultantId = parseInt(id, 10);

    if (isNaN(consultantId)) {
      return NextResponse.json({ error: "Invalid Consultant ID" }, { status: 400 });
    }

    const consultant = await prisma.consultant.findUnique({
      where: { id: consultantId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        },
        _count: {
          select: { sessions: { where: { paymentStatus: 'PAID' } } }
        }
      }
    });

    if (!consultant) {
      return NextResponse.json({ error: "Consultant not found" }, { status: 404 });
    }

    // Process structured data for the API response
    const responseData = {
      id: consultant.id,
      name: consultant.user.name,
      email: consultant.user.email,
      image: consultant.user.image,
      specialization: consultant.specialization,
      yearsOfExp: consultant.yearsOfExp,
      sessionRate: consultant.sessionRate,
      bio: consultant.bio || "No biography available.",
      rating: consultant.rating ?? 5.0,
      reviewCount: consultant.reviewCount ?? 0,
      availability: consultant.availability,
      sessionsCompleted: consultant._count.sessions,
      expertise: consultant.expertise ? consultant.expertise.split(';') : [],
      certifications: consultant.certifications ? consultant.certifications.split(';') : [],
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[API] Consultant Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

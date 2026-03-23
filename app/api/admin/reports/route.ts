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

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userPayload.id as string) }
    });

    if (!user || user.type !== 'ADMIN') {
      return NextResponse.json({ error: "Access Denied. Admins Only." }, { status: 403 });
    }

    const body = await req.json();
    const { title, industry, description, pages, image } = body;

    if (!industry || !title) {
      return NextResponse.json({ error: "Industry Category and Title are required." }, { status: 400 });
    }

    // Insert into DB. We map the input conceptually because StartawyReport schema only has id, industry, uploadDate, link.
    // However since we MUST stick to the schema: StartawyReport { id, industry, uploadDate, link } 
    // We will save 'title' etc. inside 'link' as JSON string for now since we cannot migrate DB here.
    const metaDataString = JSON.stringify({
      title,
      description,
      pages: parseInt(pages) || 10,
      image: image || "https://images.unsplash.com/photo-1618044733300-9472054094ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
    });

    const newReport = await prisma.startawyReport.create({
      data: {
        industry: industry,
        link: metaDataString,
      }
    });

    return NextResponse.json({ success: true, report: newReport });
  } catch (error) {
    console.error("Admin Report Upload Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

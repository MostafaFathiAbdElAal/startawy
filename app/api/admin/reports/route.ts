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

    const isOwner = !!userPayload.isOwner;
    if (userPayload.role !== 'ADMIN' && !isOwner) {
      return NextResponse.json({ error: "Access Denied. Admins Only." }, { status: 403 });
    }

    const body = await req.json();
    const { title, industry, description, pages, image, link } = body;

    if (!industry || !title || !link) {
      return NextResponse.json({ error: "Title, Industry, and PDF file are required." }, { status: 400 });
    }

    // High Compatibility Storage Strategy:
    // We pack all metadata + the actual PDF link into the 'link' column as JSON.
    const metaData = {
      title,
      description,
      pages: parseInt(pages) || 1 || 10,
      image: image || "https://images.unsplash.com/photo-1618044733300-9472054094ee",
      pdfUrl: link // The Cloudinary URL for the PDF
    };

    const newReport = await prisma.startawyReport.create({
      data: {
        industry: industry,
        link: JSON.stringify(metaData),
      }
    });

    return NextResponse.json({ success: true, report: newReport });
  } catch (error) {
    console.error("Admin Report Upload Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

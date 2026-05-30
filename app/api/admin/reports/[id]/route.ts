import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import cloudinary from "@/lib/cloudinary";

export const runtime = 'nodejs';

function extractPublicId(url: string): string | null {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    
    const afterUpload = parts[1];
    const subParts = afterUpload.split("/");
    
    let startIndex = 0;
    if (subParts[0].startsWith("v") && !isNaN(Number(subParts[0].substring(1)))) {
      startIndex = 1;
    }
    
    const publicIdWithExt = subParts.slice(startIndex).join("/");
    const lastDotIndex = publicIdWithExt.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      return publicIdWithExt.substring(0, lastDotIndex);
    }
    return publicIdWithExt;
  } catch (e) {
    console.error("Error extracting Cloudinary public ID:", e);
    return null;
  }
}

async function deleteFromCloudinary(url: string) {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  
  const isRaw = url.includes("/raw/upload/");
  const resourceType = isRaw ? "raw" : "image";
  
  try {
    console.log(`Deleting Cloudinary asset: ${publicId} (${resourceType})`);
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Failed to delete asset ${publicId} from Cloudinary:`, error);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userPayload.role !== 'ADMIN' && !userPayload.isOwner) {
      return NextResponse.json({ error: "Access Denied. Admins Only." }, { status: 403 });
    }

    const resolvedParams = await Promise.resolve(context.params);
    const reportId = parseInt(resolvedParams.id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
    }

    const existingReport = await prisma.startawyReport.findUnique({
      where: { id: reportId }
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Attempt to delete associated files from Cloudinary
    try {
      const parsed = JSON.parse(existingReport.link);
      if (parsed.pdfUrl) await deleteFromCloudinary(parsed.pdfUrl);
      if (parsed.image) await deleteFromCloudinary(parsed.image);
    } catch (parseError) {
      console.warn("Could not parse link JSON for Cloudinary deletion (fallback to legacy raw link):", parseError);
      if (existingReport.link && existingReport.link.startsWith("http")) {
        await deleteFromCloudinary(existingReport.link);
      }
    }

    // Delete database record
    await prisma.startawyReport.delete({
      where: { id: reportId }
    });

    return NextResponse.json({ success: true, message: "Report and associated assets deleted successfully." });
  } catch (error) {
    console.error("Delete Report API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userPayload.role !== 'ADMIN' && !userPayload.isOwner) {
      return NextResponse.json({ error: "Access Denied. Admins Only." }, { status: 403 });
    }

    const resolvedParams = await Promise.resolve(context.params);
    const reportId = parseInt(resolvedParams.id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });
    }

    const existingReport = await prisma.startawyReport.findUnique({
      where: { id: reportId }
    });

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, industry, description, pages, image } = body;

    interface ReportMetadata {
      title?: string;
      description?: string;
      pages?: number;
      image?: string;
      pdfUrl?: string;
    }

    // Parse existing metadata from the link column
    let metadata: ReportMetadata = {};
    try {
      const parsed = JSON.parse(existingReport.link);
      metadata = parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      metadata = {};
    }

    // If a new image is provided, delete the old one from Cloudinary (if applicable)
    if (image !== undefined && image !== metadata.image) {
      if (metadata.image && metadata.image.includes("cloudinary.com")) {
        await deleteFromCloudinary(metadata.image);
      }
      metadata.image = image;
    }

    // Update only the provided metadata fields
    if (title !== undefined) metadata.title = title;
    if (description !== undefined) metadata.description = description;
    if (pages !== undefined) metadata.pages = parseInt(pages) || metadata.pages;

    // Update the report in the database
    const updateData: { link: string; industry?: string } = {
      link: JSON.stringify(metadata),
    };

    if (industry !== undefined) {
      updateData.industry = industry;
    }

    await prisma.startawyReport.update({
      where: { id: reportId },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: "Report updated successfully." });
  } catch (error) {
    console.error("Update Report API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

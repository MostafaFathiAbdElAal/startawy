import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size too large. Max 10MB allowed." }, { status: 400 });
    }

    // Validate type: JPG, PNG, WEBP, and PDF are allowed
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP and PDF are allowed." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    interface CloudinaryResult {
      secure_url: string;
      public_id: string;
    }

    // Upload to Cloudinary under verification_documents
    const result = await new Promise<CloudinaryResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "verification_documents",
          resource_type: "auto", // Automatically detect file type (image or pdf/raw)
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryResult);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url
    });

  } catch (error: unknown) {
    console.error("Document Upload Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload document";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized. Admins only." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Detect file type to set correct resource_type
    // Use 'auto' to let Cloudinary handle detection and page counting
    const uploadResourceType = 'auto';

    // Upload to Cloudinary using a Promise to handle the stream
    const result = await new Promise<{ secure_url: string; public_id: string; pages?: number }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "startawy_library",
          resource_type: uploadResourceType,
          pages: true, // Request page count
        },
        (error, result) => {
          if (error) reject(error);
          else {
            console.log("Cloudinary Upload Success:", result);
            resolve(result as { secure_url: string; public_id: string; pages?: number });
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url,
      public_id: result.public_id,
      pages: result.pages
    });

  } catch (error: unknown) {
    console.error("Cloudinary Upload Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

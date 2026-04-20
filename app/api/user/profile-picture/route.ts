import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

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

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size too large. Max 5MB allowed." }, { status: 400 });
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG and WEBP are allowed." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary with specific transformations for profile pictures
    interface CloudinaryResult {
      secure_url: string;
      public_id: string;
    }

    const result = await new Promise<CloudinaryResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "profile_pictures",
          gravity: "face", // Center crop on the face
          width: 400,
          height: 400,
          crop: "fill", // Fill the 400x400 area
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryResult);
        }
      );
      uploadStream.end(buffer);
    });

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: Number(userPayload.id) },
      data: {
        image: result.secure_url
      }
    });

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url,
      user: {
        id: updatedUser.id,
        image: updatedUser.image
      }
    });

  } catch (error: unknown) {
    console.error("Profile Picture Upload Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload profile picture";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

"use server";

import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth-utils";
import { UserService } from "@/lib/services/userService";
import { revalidatePath } from "next/cache";
import type { UserWithRelations, UpdateProfileData } from "@/lib/types";

export async function getProfileData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const decoded = await verifyAuth(token);

  if (!decoded) return null;

  const profile = await UserService.getFullProfile(parseInt(decoded.id as string));
  
  if (!profile) return null;

  // IMPORTANT: Avoid circular references which crash the Next.js serializer.
  // We provide a complete user object to satisfy legacy requirements in layout and components.
  return { 
    ...profile, 
    user: { 
      id: profile.id,
      email: profile.email,
      name: profile.name,
      type: profile.type,
      phone: profile.phone,
      image: profile.image,
      googleId: profile.googleId,
      isEmailVerified: profile.isEmailVerified,
      isPhoneVerified: profile.isPhoneVerified,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      // Include relations to satisfy ProtectedLayout checks
      founder: profile.founder,
      consultant: profile.consultant,
      admin: profile.admin,
      isOwner: !!profile.admin?.isOwner
    } 
  };
}

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const decoded = await verifyAuth(token);

  if (!decoded) return { success: false, error: "Unauthorized" };

  const data: UpdateProfileData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    businessName: formData.get("businessName") as string,
    businessSector: formData.get("businessSector") as string,
    description: formData.get("description") as string,
  };

  try {
    await UserService.updateUserProfile(parseInt(decoded.id as string), data);
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to update profile" };
  }
}

"use server";

import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth-utils";
import { UserService } from "@/lib/services/userService";
import { revalidatePath } from "next/cache";
import type { UpdateProfileData } from "@/lib/types";

export async function getProfileData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const decoded = await verifyAuth(token);

  if (!decoded) return null;

  const profile = await UserService.getFullProfile(Number(decoded.id));
  
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
      image: profile.image?.includes('googleusercontent') ? null : profile.image,
      googleId: profile.googleId,
      isEmailVerified: profile.isEmailVerified,
      isPhoneVerified: profile.isPhoneVerified,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      password: null, // Critical to satisfy UserWithRelations
      founder: profile.founder,
      consultant: profile.consultant,
      admin: profile.admin,
      isOwner: !!profile.admin?.isOwner
    },
    stats: {
      sessions: profile.founder?.sessions?.length || profile.consultant?.sessions?.length || 0,
      reports: profile.founder?.reports?.length || 0,
      projects: profile.founder?.budgetAnalyses?.length || 0
    },
    subscription: profile.founder?.payments?.[0]?.subscription || null,
    activePlan: (() => {
      if (profile.type !== 'FOUNDER') return 'Professional';
      const latestPayment = profile.founder?.payments?.[0];
      const sub = latestPayment?.subscription;
      const isActive = sub?.status === 'ACTIVE' && new Date() < new Date(sub.endDate);
      if (!isActive || (latestPayment?.amount || 0) === 0) return 'Free Plan';
      if ((latestPayment?.amount || 0) >= 299) return 'Premium';
      if ((latestPayment?.amount || 0) === 99) return 'Basic';
      return 'Free Plan';

    })(),
    hasPaidPlan: (() => {
      if (profile.type === 'ADMIN') return true;
      if (profile.type !== 'FOUNDER') return false;
      const latestPayment = profile.founder?.payments?.[0];
      const sub = latestPayment?.subscription;
      return sub?.status === 'ACTIVE' && new Date() < new Date(sub.endDate) && (latestPayment?.amount || 0) > 0;
    })(),
    hasPremiumPlan: (() => {
      if (profile.type === 'ADMIN') return true;
      if (profile.type !== 'FOUNDER') return true; // Consultants get access
      const latestPayment = profile.founder?.payments?.[0];
      const sub = latestPayment?.subscription;
      const isActive = sub?.status === 'ACTIVE' && new Date() < new Date(sub.endDate);
      if (!isActive) return false;
      return (latestPayment?.amount || 0) >= 299; // Strict Premium check
    })()
  };
}

export async function updateProfile(data: UpdateProfileData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const decoded = await verifyAuth(token);

  if (!decoded) return { success: false, error: "Unauthorized" };

  try {
    await UserService.updateUserProfile(Number(decoded.id), data);
    revalidatePath("/profile");
    return { success: true, message: "Profile updated successfully!" };
  } catch (err) {
    console.error("[PROFILE_UPDATE_ERROR]", err);
    return { success: false, error: "Failed to update profile" };
  }
}

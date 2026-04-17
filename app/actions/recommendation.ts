'use server';

import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { RecommendationService } from "@/lib/services/recommendationService";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function sendRecommendation(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const decoded = await verifyAuth(token);

  if (!decoded || decoded.role !== "CONSULTANT") {
    return { error: "Unauthorized" };
  }

  const consultant = await prisma.consultant.findUnique({
    where: { userId: Number(decoded.id) }
  });

  if (!consultant) return { error: "Consultant profile not found" };

  const founderId = Number(formData.get("founderId"));
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as string;
  const impact = formData.get("impact") as string;

  try {
    await RecommendationService.createRecommendation({
      consultantId: consultant.id,
      founderId,
      title,
      content,
      category,
      priority,
      impact,
    });

    revalidatePath("/consultant/recommendations");
    revalidatePath("/founder/recommendations");
    return { success: true };
  } catch (error) {
    console.error("Failed to send recommendation:", error);
    return { error: "Database error" };
  }
}

export async function getFounderRecommendations() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const decoded = await verifyAuth(token);

  if (!decoded || decoded.role !== "FOUNDER") {
    return null;
  }

  const founder = await prisma.startupFounder.findUnique({
    where: { userId: Number(decoded.id) }
  });

  if (!founder) return null;

  return await RecommendationService.getRecommendationsForFounder(founder.id);
}

export async function getConsultantRecommendations() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const decoded = await verifyAuth(token);

  if (!decoded || decoded.role !== "CONSULTANT") {
    return null;
  }

  const consultant = await prisma.consultant.findUnique({
    where: { userId: Number(decoded.id) }
  });

  if (!consultant) return null;

  return await RecommendationService.getRecommendationsByConsultant(consultant.id);
}

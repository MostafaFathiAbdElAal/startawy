import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";

// A temporary or internal secret endpoint to quickly give admin privileges.
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: "Please login first to acquire admin privileges." }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userPayload.id },
      data: { type: 'ADMIN' },
    });

    return NextResponse.json({ 
      success: true, 
      message: "You are now an Admin. Go to /admin/dashboard to begin.",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Admin Setup Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

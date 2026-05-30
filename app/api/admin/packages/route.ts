import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { price: 'asc' }
    });
    return NextResponse.json(packages);
  } catch {
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, price, duration } = body;

    if (!id) return NextResponse.json({ error: "Package ID required" }, { status: 400 });

    const updatedPackage = await prisma.package.update({
      where: { id: parseInt(id) },
      data: {
        price: parseFloat(price.toString()),
        duration
      }
    });

    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}

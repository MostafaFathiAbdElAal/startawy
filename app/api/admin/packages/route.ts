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

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isOwner = !!userPayload.isOwner;

    if (userPayload.role !== 'ADMIN' && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { type, price, duration, description } = body;

    const newPackage = await prisma.package.create({
      data: {
        type,
        price: parseFloat(price),
        duration,
        description
      }
    });

    return NextResponse.json(newPackage);
  } catch {
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  
      await prisma.package.delete({
        where: { id: parseInt(id) }
      });
  
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
    }
  }

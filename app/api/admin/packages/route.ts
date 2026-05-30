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
    const { id, type, price, duration, description } = body;

    if (!id) return NextResponse.json({ error: "Package ID required" }, { status: 400 });

    const existingPkg = await prisma.package.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const coreTitles = ["Free Trial", "Basic", "Premium"];
    const isCore = coreTitles.includes(existingPkg.type);

    const dataToUpdate: {
      price: number;
      duration: string;
      description: string;
      type?: string;
    } = {
      price: parseFloat(price.toString()),
      duration,
      description
    };

    // Only allow updating type (title) if the package is not one of the core packages
    if (!isCore && type) {
      dataToUpdate.type = type;
    }

    const updatedPackage = await prisma.package.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, price, duration, description } = body;

    if (!type || price === undefined || !duration || !description) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const newPackage = await prisma.package.create({
      data: {
        type,
        price: parseFloat(price.toString()),
        duration,
        description
      }
    });

    return NextResponse.json(newPackage);
  } catch (error) {
    console.error("Create Error:", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Package ID required" }, { status: 400 });

    const existingPkg = await prisma.package.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const coreTitles = ["Free Trial", "Basic", "Premium"];
    if (coreTitles.includes(existingPkg.type)) {
      return NextResponse.json({ error: "Core packages cannot be deleted" }, { status: 400 });
    }

    await prisma.package.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }
}

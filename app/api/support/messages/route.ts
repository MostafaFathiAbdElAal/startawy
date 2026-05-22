import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET_KEY = process.env.STARTAWY_SECRET_KEY || 'STARTAWY_SECRET_123456';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const secret = req.headers.get('x-secret-key');

    // Security Check
    if (secret !== SECRET_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!sessionId) {
        return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    try {
        const messages = await prisma.supportMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json({ messages });
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2024') {
            return NextResponse.json({ error: "Server is busy" }, { status: 503 });
        }
        console.error("[SUPPORT_GET_ERROR]", error);
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const secret = req.headers.get('x-secret-key');
    
    // Security Check
    if (secret !== SECRET_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { sessionId, sender, text } = body;

        if (!sessionId || !sender || !text) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const msg = await prisma.supportMessage.create({
            data: { sessionId, sender, text }
        });
        
        return NextResponse.json({ success: true, id: msg.id });
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2024') {
            return NextResponse.json({ error: "Server is busy" }, { status: 503 });
        }
        console.error("[SUPPORT_POST_ERROR]", error);
        return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }
}

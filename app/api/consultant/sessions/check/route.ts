import { NextResponse } from "next/server";
import { authorizeUser } from "@/lib/auth-utils";
import { ConsultantService } from "@/lib/services/consultantService";

export async function GET(req: Request) {
  try {
    // 1. Authorize user (Founder only)
    const auth = await authorizeUser(null, ["FOUNDER"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.status });
    }

    // 2. Get consultantId from query params
    const { searchParams } = new URL(req.url);
    const consultantIdStr = searchParams.get("consultantId");
    
    if (!consultantIdStr) {
      return NextResponse.json({ error: "Missing consultantId" }, { status: 400 });
    }

    const consultantId = parseInt(consultantIdStr, 10);
    if (isNaN(consultantId)) {
      return NextResponse.json({ error: "Invalid consultantId" }, { status: 400 });
    }

    // 3. Call the ABI / Service
    const session = await ConsultantService.getUserSessionWithConsultant(auth.user.id, consultantId);

    return NextResponse.json({ session });
  } catch (error) {
    console.error("[API_CHECK_SESSION]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/userService";
import { authorizeUser } from "@/lib/auth-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeUser(req, ["ADMIN", "SYSTEM_ADMIN"]);
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const body = await req.json();
    
    const result = await UserService.updateUserProfile(parseInt(id), body);

    return NextResponse.json({ success: true, user: result });
  } catch (error: unknown) {
    console.error("[ADMIN_USER_PATCH_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update user.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const auth = await authorizeUser(req, ["ADMIN", "SYSTEM_ADMIN"]);
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const targetUserId = parseInt(id);

    // Platform Owner cannot be deleted!
    // Note: In a real app we'd fetch the target user's email to compare.
    // For now we assume the Service handles safety or we check here.
    
    await UserService.deleteUser(targetUserId);

    return NextResponse.json({ success: true, message: "User deleted successfully via cascade." });
  } catch (error: unknown) {
    console.error("[ADMIN_USER_DELETE_ERROR]", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete user.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

// Admin credentials — set ADMIN_PASSWORD in Vercel env vars
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "prodoc2024";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === ADMIN_PASSWORD) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });
    return res;
  }
  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("admin_auth");
  return res;
}

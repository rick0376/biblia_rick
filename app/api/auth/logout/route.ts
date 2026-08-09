import { NextResponse } from "next/server";
import { BIBLE_AUTH_COOKIE } from "../../../../lib/auth/config";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: BIBLE_AUTH_COOKIE,
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return response;
}

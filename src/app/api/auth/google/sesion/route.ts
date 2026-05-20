import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("rl_at")?.value;
  const refreshToken = request.cookies.get("rl_rt")?.value;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "no_session" }, { status: 400 });
  }

  const response = NextResponse.json({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  response.cookies.delete("rl_at");
  response.cookies.delete("rl_rt");

  return response;
}

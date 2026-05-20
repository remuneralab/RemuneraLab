import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL!;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const errorUrl = `${origin}/auth/callback`;

  if (oauthError || !code) {
    return NextResponse.redirect(
      `${errorUrl}?error=${oauthError ?? "no_code"}`,
    );
  }

  const storedState = request.cookies.get("rl_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${errorUrl}?error=invalid_state`);
  }

  // Exchange code for Google tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${origin}/auth/callback/google`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${errorUrl}?error=token_exchange`);
  }

  const { id_token } = await tokenRes.json();

  // Exchange Google id_token for Supabase session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const { data, error: sbError } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: id_token,
  });

  if (sbError || !data.session) {
    console.error("[google/callback] signInWithIdToken failed:", sbError?.message, sbError?.status);
    const msg = encodeURIComponent(sbError?.message ?? "no_session");
    return NextResponse.redirect(`${errorUrl}?error=supabase_auth&msg=${msg}`);
  }

  const { access_token, refresh_token } = data.session;

  const response = NextResponse.redirect(`${origin}/auth/google/sesion`);

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60,
    path: "/",
  };

  response.cookies.set("rl_at", access_token, cookieOpts);
  response.cookies.set("rl_rt", refresh_token, cookieOpts);
  response.cookies.delete("rl_state");

  return response;
}

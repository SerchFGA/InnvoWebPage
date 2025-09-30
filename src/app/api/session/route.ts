import { NextResponse } from "next/server";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "innvo_session",
  cookieOptions: { secure: process.env.NODE_ENV === "production" },
};

export async function GET() {
  const store = await cookies();
  const session = await getIronSession<{ isLoggedIn: boolean }>(store, sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = true;
    await session.save(); // persiste cookie en la respuesta
  }

  return NextResponse.json({ isLoggedIn: session.isLoggedIn });
}

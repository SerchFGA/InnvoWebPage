import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn: boolean;
  username: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "innovo-session",
  cookieOptions: { secure: process.env.NODE_ENV === "production" },
};

export async function getSession() {
  const store = await cookies();
  const session = await getIronSession<SessionData>(store, sessionOptions);
  
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
    session.username = '';
  }
  return session;
}

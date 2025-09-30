import { getIronSession, type IronSessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn: boolean;
  username: string;
}

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "innovo-session",
  cookieOptions: { secure: process.env.NODE_ENV === "production" },
};

export async function getSession() {
  const store = await cookies(); // Next 15 retorna Promise<ReadonlyRequestCookies>
  // Cast controlado para compatibilidad con iron-session
  const session = await getIronSession<SessionData>(store as unknown as any, sessionOptions);
  
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
    session.username = '';
  }
  return session;
}
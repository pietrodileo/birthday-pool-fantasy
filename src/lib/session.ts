import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "birthday_pool_session";
const DAY_IN_SECONDS = 60 * 60 * 24;

export type Session =
  | {
      role: "guest";
      participantId: string;
      displayName: string;
      exp: number;
    }
  | {
      role: "admin";
      adminId: string;
      username: string;
      exp: number;
    };

export type SessionInput =
  | Omit<Extract<Session, { role: "guest" }>, "exp">
  | Omit<Extract<Session, { role: "admin" }>, "exp">;

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("Missing SESSION_SECRET.");
  }

  return secret;
}

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export async function setSession(session: SessionInput) {
  const exp = Math.floor(Date.now() / 1000) + DAY_IN_SECONDS;
  const payload = base64url(JSON.stringify({ ...session, exp }));
  const signature = sign(payload);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DAY_IN_SECONDS
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  const [payload, signature] = raw.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;

    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

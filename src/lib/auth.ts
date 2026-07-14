import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "dev-secret-cambia-esto";
const key = new TextEncoder().encode(secretKey);
const COOKIE_NAME = "pos_session";

export type SessionPayload = {
  userId: string;
  nombre: string;
  rol: "CAJERO" | "ADMIN";
};

export async function crearSesion(payload: SessionPayload) {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(key);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function obtenerSesion(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  cookies().delete(COOKIE_NAME);
}

export { COOKIE_NAME };

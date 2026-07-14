import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "dev-secret-cambia-esto";
const key = new TextEncoder().encode(secretKey);

async function getSesion(req: NextRequest) {
  const token = req.cookies.get("pos_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as { userId: string; nombre: string; rol: "CAJERO" | "ADMIN" };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sesion = await getSesion(req);

  const esRutaProtegida = pathname.startsWith("/caja") || pathname.startsWith("/admin");

  if (esRutaProtegida && !sesion) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && sesion?.rol !== "ADMIN") {
    return NextResponse.redirect(new URL("/caja", req.url));
  }

  if (pathname === "/login" && sesion) {
    return NextResponse.redirect(new URL(sesion.rol === "ADMIN" ? "/admin" : "/caja", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/caja/:path*", "/admin/:path*", "/login"],
};

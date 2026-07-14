import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { crearSesion } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { usuario, password } = await req.json();
    if (!usuario || !password) {
      return NextResponse.json({ error: "Usuario y contraseña son requeridos" }, { status: 400 });
    }

    const user = await prisma.usuario.findUnique({ where: { usuario } });
    if (!user || !user.activo) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const valido = await bcrypt.compare(password, user.passwordHash);
    if (!valido) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    await crearSesion({ userId: user.id, nombre: user.nombre, rol: user.rol });

    return NextResponse.json({
      ok: true,
      rol: user.rol,
      nombre: user.nombre,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

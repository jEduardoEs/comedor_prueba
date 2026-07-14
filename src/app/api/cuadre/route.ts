import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Un cajero solo ve su propio cuadre; un admin puede ver todos
  const where =
    sesion.rol === "ADMIN" ? {} : { usuarioId: sesion.userId };

  const cuadres = await prisma.cuadreCaja.findMany({
    where,
    include: { usuario: { select: { nombre: true } } },
    orderBy: { fecha: "desc" },
    take: 30,
  });

  return NextResponse.json(cuadres);
}

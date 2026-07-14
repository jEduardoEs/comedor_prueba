import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";

export async function GET() {
  const sesion = await obtenerSesion();
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const mesas = await prisma.mesa.findMany({
    orderBy: { numero: "asc" },
    include: {
      ordenes: {
        where: { estado: "ABIERTA" },
        select: { id: true, total: true },
      },
    },
  });

  return NextResponse.json(mesas);
}

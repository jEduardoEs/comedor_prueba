import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sesion = await obtenerSesion();
  if (!sesion || sesion.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const rango = req.nextUrl.searchParams.get("rango") || "semana"; // semana | mes

  const desde = new Date();
  if (rango === "mes") {
    desde.setDate(desde.getDate() - 30);
  } else {
    desde.setDate(desde.getDate() - 7);
  }
  desde.setHours(0, 0, 0, 0);

  const pagos = await prisma.pago.findMany({
    where: { fecha: { gte: desde } },
    select: { fecha: true, monto: true },
  });

  // Agrupar ventas por día
  const ventasPorDia: Record<string, number> = {};
  for (const p of pagos) {
    const dia = p.fecha.toISOString().slice(0, 10);
    ventasPorDia[dia] = (ventasPorDia[dia] || 0) + Number(p.monto);
  }
  const serie = Object.entries(ventasPorDia)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([fecha, total]) => ({ fecha, total }));

  const totalVentas = pagos.reduce((acc, p) => acc + Number(p.monto), 0);

  // Producto más vendido en el rango
  const items = await prisma.ordenItem.findMany({
    where: { orden: { estado: "PAGADA", cerradoEn: { gte: desde } } },
    include: { producto: true },
  });

  const cantidadPorProducto: Record<string, { nombre: string; cantidad: number; total: number }> = {};
  for (const it of items) {
    const key = it.productoId;
    if (!cantidadPorProducto[key]) {
      cantidadPorProducto[key] = { nombre: it.producto.nombre, cantidad: 0, total: 0 };
    }
    cantidadPorProducto[key].cantidad += it.cantidad;
    cantidadPorProducto[key].total += Number(it.precioUnitario) * it.cantidad;
  }

  const productosMasVendidos = Object.values(cantidadPorProducto)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  return NextResponse.json({
    rango,
    totalVentas,
    numeroVentas: pagos.length,
    serie,
    productosMasVendidos,
  });
}

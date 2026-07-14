import { prisma } from "@/lib/prisma";

export async function recalcularTotal(ordenId: string) {
  const items = await prisma.ordenItem.findMany({ where: { ordenId } });
  const total = items.reduce((acc, it) => acc + Number(it.precioUnitario) * it.cantidad, 0);
  await prisma.orden.update({ where: { id: ordenId }, data: { total } });
}

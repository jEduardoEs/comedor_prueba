import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Usuarios iniciales
  const adminPass = await bcrypt.hash("admin123", 10);
  const cajeroPass = await bcrypt.hash("caja123", 10);

  await prisma.usuario.upsert({
    where: { usuario: "admin" },
    update: {},
    create: {
      nombre: "Administrador",
      usuario: "admin",
      passwordHash: adminPass,
      rol: "ADMIN",
    },
  });

  await prisma.usuario.upsert({
    where: { usuario: "caja1" },
    update: {},
    create: {
      nombre: "Cajero Uno",
      usuario: "caja1",
      passwordHash: cajeroPass,
      rol: "CAJERO",
    },
  });

  // Mesas 1-10
  for (let i = 1; i <= 10; i++) {
    await prisma.mesa.upsert({
      where: { numero: i },
      update: {},
      create: { numero: i },
    });
  }

  // Categorias y productos de ejemplo
  const entradas = await prisma.categoria.upsert({
    where: { nombre: "Entradas" },
    update: {},
    create: { nombre: "Entradas", orden: 1 },
  });
  const platosFuertes = await prisma.categoria.upsert({
    where: { nombre: "Platos Fuertes" },
    update: {},
    create: { nombre: "Platos Fuertes", orden: 2 },
  });
  const bebidas = await prisma.categoria.upsert({
    where: { nombre: "Bebidas" },
    update: {},
    create: { nombre: "Bebidas", orden: 3 },
  });

  const productos = [
    { nombre: "Nachos con queso", precio: 35.0, categoriaId: entradas.id },
    { nombre: "Alitas BBQ (8pz)", precio: 55.0, categoriaId: entradas.id },
    { nombre: "Churrasco", precio: 95.0, categoriaId: platosFuertes.id },
    { nombre: "Pechuga a la plancha", precio: 65.0, categoriaId: platosFuertes.id },
    { nombre: "Gaseosa", precio: 12.0, categoriaId: bebidas.id },
    { nombre: "Cerveza", precio: 20.0, categoriaId: bebidas.id },
  ];

  for (const p of productos) {
    const existe = await prisma.producto.findFirst({ where: { nombre: p.nombre } });
    if (!existe) {
      await prisma.producto.create({ data: p });
    }
  }

  console.log("Seed completado. Usuarios: admin/admin123 (ADMIN), caja1/caja123 (CAJERO)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

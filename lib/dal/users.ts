import "server-only";

import { getDb } from "@/src/prisma/db";
import { hashPassword } from "@/lib/admin/password";

export type AdminActor = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export async function findUserById(id: number): Promise<AdminActor | null> {
  const db = getDb();
  const user = await db.user.findFirst({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function findUserForLogin(email: string) {
  const db = getDb();
  return db.user.findFirst({
    where: { email: email.toLowerCase() },
    select: { id: true, name: true, email: true, role: true, passwordHash: true },
  });
}

export async function bootstrapAdminIfEmpty() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "";
  const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim();
  if (!email || !name || password.length < 10) return;

  const db = getDb();
  const existing = await db.user.findFirst({ orderBy: { id: "asc" }, select: { id: true } });
  if (existing) return;
  await db.user.create({
    data: {
      email,
      name,
      role: "owner",
      passwordHash: hashPassword(password),
    },
  });
}

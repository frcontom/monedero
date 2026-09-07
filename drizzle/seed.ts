import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "./schema";

config({ path: ".env.local" });

async function main() {
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;
  if (!email || !password) {
    console.error("Faltan SEED_USER_EMAIL / SEED_USER_PASSWORD en .env.local");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password debe tener mínimo 8 caracteres");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
  });
  const db = drizzle(pool);

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    console.log("Usuario ya existe:", email);
  } else {
    const passwordHash = await hash(password, 12);
    await db.insert(users).values({ email, passwordHash });
    console.log("Usuario creado:", email);
  }

  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
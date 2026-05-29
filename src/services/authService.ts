import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/client";
import { tenants } from "../db/schema/tenants";
import { apiKeys } from "../db/schema/apiKeys";
import { eq } from "drizzle-orm";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

export const registerTenant = async (
  name: string,
  email: string,
  password: string,
) => {
  const existing = await db
    .select()
    .from(tenants)
    .where(eq(tenants.email, email))
    .limit(1);

  if (existing.length) throw new AppError("Email aready registered", 409);

  const hashed = await bcrypt.hash(password, 12);

  const [tenant] = await db
    .insert(tenants)
    .values({ name, email, password: hashed })
    .returning();

  const key = `mm${uuidv4().replace(/-/g, "")}`;
  await db.insert(apiKeys).values({
    tenantId: tenant.id,
    key,
    name: "default Key",
  });

  const token = jwt.sign(
    {
      id: tenant.id,
      email: tenant.email,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

  return {
    tenant: { id: tenant.id, name: tenant.name, email: tenant.email },
    token,
    apiKey: key,
  };
};

export const loginTenant = async (email: string, password: string) => {
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.email, email))
    .limit(1);

  if (!tenant) throw new AppError("Invalid Credentails", 401);

  const token = jwt.sign(
    { id: tenant.id, email: tenant.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

  return {
    tenant: { id: tenant.id, name: tenant.name, email: tenant.email },
    token,
  };
};

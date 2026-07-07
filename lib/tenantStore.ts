import fs from "fs/promises";
import path from "path";
import type { TenantSite } from "../src/types";

const TENANTS_DIR = path.join(process.cwd(), "data", "tenants");

function tenantFilePath(slug: string): string {
  return path.join(TENANTS_DIR, `${slug}.json`);
}

export async function ensureTenantsDir(): Promise<void> {
  await fs.mkdir(TENANTS_DIR, { recursive: true });
}

export async function readTenant(slug: string): Promise<TenantSite | null> {
  try {
    const raw = await fs.readFile(tenantFilePath(slug), "utf-8");
    return JSON.parse(raw) as TenantSite;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

export async function writeTenant(tenant: TenantSite): Promise<void> {
  await ensureTenantsDir();
  await fs.writeFile(tenantFilePath(tenant.slug), JSON.stringify(tenant, null, 2), "utf-8");
}

export async function tenantExists(slug: string): Promise<boolean> {
  const tenant = await readTenant(slug);
  return tenant !== null;
}

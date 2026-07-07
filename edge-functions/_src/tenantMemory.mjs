/** ponytail: Edge runtime has no filesystem — in-memory only, resets on cold start. */
const tenants = new Map();

export function readTenant(slug) {
  return tenants.get(slug) ?? null;
}

export function writeTenant(tenant) {
  tenants.set(tenant.slug, tenant);
}

export function tenantExists(slug) {
  return tenants.has(slug);
}

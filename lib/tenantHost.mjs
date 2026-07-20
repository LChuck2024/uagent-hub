const ROOT_DOMAIN = (process.env.VITE_TENANT_DOMAIN || "uagent.net").toLowerCase();

const RESERVED_SLUGS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "cdn",
  "static",
  "mail",
  "dev",
  "staging",
  "storm",
  "hub",
  "agents",
  "omni",
  "portal",
  "store",
  "edu",
  "audit",
  "life",
]);

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;

export function isValidSlug(slug) {
  return SLUG_PATTERN.test(slug) && !RESERVED_SLUGS.has(slug);
}

/** Parse tenant slug from *.uagent.net or *.localhost hostnames. */
export function parseTenantFromHostname(hostname) {
  const host = String(hostname || "").split(":")[0].toLowerCase();

  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) {
    return null;
  }

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = host.slice(0, -(ROOT_DOMAIN.length + 1));
    if (slug && !slug.includes(".") && isValidSlug(slug)) {
      return slug;
    }
    return null;
  }

  if (host.endsWith(".localhost") || host.endsWith(".127.0.0.1")) {
    const slug = host.split(".")[0];
    if (slug && isValidSlug(slug)) {
      return slug;
    }
  }

  if (host === "localhost" || host === "127.0.0.1") {
    return null;
  }

  return null;
}

export function resolveTenantSlug(hostname) {
  return parseTenantFromHostname(hostname);
}

export function getRootDomain() {
  return ROOT_DOMAIN;
}

export function isDevEnvironment(hostname, nodeEnv = process.env.NODE_ENV) {
  if (nodeEnv !== "production") {
    return true;
  }
  const host = String(hostname || "").split(":")[0].toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost");
}

export function buildTenantUrls(slug, hostname, port = "3000") {
  const rootDomain = (process.env.VITE_TENANT_DOMAIN || "uagent.net").toLowerCase();
  const host = String(hostname || "").split(":")[0].toLowerCase();
  const isDev =
    process.env.NODE_ENV !== "production" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".localhost");

  if (isDev) {
    const portSuffix = port ? `:${port}` : "";
    return {
      siteUrl: `http://${slug}.localhost${portSuffix}`,
      adminUrl: `http://${slug}.localhost${portSuffix}/admin`,
    };
  }

  return {
    siteUrl: `https://${slug}.${rootDomain}`,
    adminUrl: `https://${slug}.${rootDomain}/admin`,
  };
}

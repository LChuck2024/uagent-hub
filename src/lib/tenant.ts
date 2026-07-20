const ROOT_DOMAIN = (import.meta.env.VITE_TENANT_DOMAIN || "uagent.net").toLowerCase();
const DEV_PORT = import.meta.env.VITE_DEV_PORT || "3000";

/** Product / infra subdomains — cannot be used as tenant clone slugs */
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

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && !RESERVED_SLUGS.has(slug);
}

export function getRootDomain(): string {
  return ROOT_DOMAIN;
}

export function isDevEnvironment(): boolean {
  return import.meta.env.DEV;
}

/** Parse tenant slug from hostname (*.uagent.net or *.localhost). */
export function parseTenantFromHostname(hostname: string): string | null {
  const host = hostname.split(":")[0].toLowerCase();

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

export function getTenantSlug(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return parseTenantFromHostname(window.location.hostname);
}

export function isMainSite(): boolean {
  return getTenantSlug() === null;
}

export function buildTenantSiteUrl(slug: string, port = DEV_PORT): string {
  if (isDevEnvironment()) {
    const portSuffix = port ? `:${port}` : "";
    return `http://${slug}.localhost${portSuffix}`;
  }
  return `https://${slug}.${ROOT_DOMAIN}`;
}

export function buildTenantAdminUrl(slug: string, port = DEV_PORT): string {
  return `${buildTenantSiteUrl(slug, port)}/admin`;
}

/** @deprecated use buildTenantSiteUrl */
export function buildTenantOrigin(slug: string): string {
  const port =
    typeof window !== "undefined" && window.location.port
      ? window.location.port
      : DEV_PORT;
  return buildTenantSiteUrl(slug, port);
}

export function buildTenantUrls(slug: string, port = DEV_PORT) {
  return {
    siteUrl: buildTenantSiteUrl(slug, port),
    adminUrl: buildTenantAdminUrl(slug, port),
  };
}

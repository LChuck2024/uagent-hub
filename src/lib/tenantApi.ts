import { TenantSitePublic } from "../types";
import { readJsonResponse } from "./api";

export async function fetchTenant(slug: string): Promise<TenantSitePublic> {
  const res = await fetch(`/api/tenant/${slug}`);
  const data = await readJsonResponse<{ tenant: TenantSitePublic }>(
    res,
    "无法加载站点配置。",
  );
  return data.tenant;
}

export async function updateTenant(
  slug: string,
  adminPin: string,
  updates: Partial<TenantSitePublic>,
): Promise<TenantSitePublic> {
  const res = await fetch(`/api/tenant/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminPin, ...updates }),
  });
  const data = await readJsonResponse<{ tenant: TenantSitePublic }>(
    res,
    "保存失败，请检查 PIN 码或稍后再试。",
  );
  return data.tenant;
}

export async function verifyTenantPin(
  slug: string,
  adminPin: string,
  current: TenantSitePublic,
): Promise<boolean> {
  try {
    await updateTenant(slug, adminPin, { title: current.title });
    return true;
  } catch {
    return false;
  }
}

const PIN_KEY_PREFIX = "uagent_admin_pin_";

export function getStoredPin(slug: string): string | null {
  return sessionStorage.getItem(`${PIN_KEY_PREFIX}${slug}`);
}

export function storePin(slug: string, pin: string): void {
  sessionStorage.setItem(`${PIN_KEY_PREFIX}${slug}`, pin);
}

export function clearStoredPin(slug: string): void {
  sessionStorage.removeItem(`${PIN_KEY_PREFIX}${slug}`);
}

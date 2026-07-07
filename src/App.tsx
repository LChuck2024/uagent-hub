import { getTenantSlug } from "./lib/tenant";
import { MainRoutes } from "./router/MainRoutes";
import { TenantRoutes } from "./router/TenantRoutes";

export default function App() {
  const tenantSlug = getTenantSlug();

  if (tenantSlug) {
    return <TenantRoutes slug={tenantSlug} />;
  }

  return <MainRoutes />;
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TenantSitePublic } from "../types";
import { fetchTenant } from "../lib/tenantApi";
import { getRootDomain } from "../lib/tenant";
import { TenantChat } from "../components/TenantChat";
import { PricingCard } from "../components/PricingCard";
import { Settings, Loader2 } from "lucide-react";

interface TenantLandingProps {
  slug: string;
}

export function TenantLanding({ slug }: TenantLandingProps) {
  const [tenant, setTenant] = useState<TenantSitePublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rootDomain = getRootDomain();
  // Tenant hosts cannot use relative "/" — point back to apex main site
  const mainOrigin = import.meta.env.DEV
    ? `http://localhost:${typeof window !== "undefined" && window.location.port ? window.location.port : "3000"}`
    : `https://${rootDomain}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchTenant(slug);
        if (!cancelled) {
          setTenant(data);
          document.title = data.title;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "站点加载失败");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-600 animate-spin" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col items-center justify-center px-4 gap-3">
        <p className="text-stone-500 text-sm">{error || "站点不存在"}</p>
        <a href={mainOrigin} className="text-xs text-stone-600 hover:text-stone-700">
          返回 uAgent
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-200/30 via-stone-100 to-stone-100 pointer-events-none" />

      {/* Header — buyer branding only, no platform nav */}
      <header className="relative z-10 border-b border-stone-200 bg-stone-50 backdrop-blur-md px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0">{tenant.logo}</span>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-lg text-stone-900 truncate">{tenant.title}</h1>
              <p className="text-xs text-stone-500 line-clamp-1">{tenant.welcomeMessage}</p>
            </div>
          </div>
          <Link
            to="/admin"
            className="shrink-0 p-2 rounded-lg border border-stone-200 text-stone-500 hover:text-orange-700 hover:border-orange-300 transition-colors"
            title="管理后台"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main — chat + pricing sidebar */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 py-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 h-full">
          <div className="glass-panel rounded-2xl border border-stone-200 p-4 md:p-6 flex flex-col min-h-[calc(100vh-12rem)]">
            <TenantChat
              tenantSlug={slug}
              siteTitle={tenant.title}
              welcomeMessage={tenant.welcomeMessage}
            />
          </div>

          <PricingCard pricing={tenant.pricing} variant="sidebar" />
        </div>

        {/* Mobile pricing banner */}
        <div className="mt-4 lg:hidden">
          <PricingCard pricing={tenant.pricing} variant="banner" />
        </div>
      </main>
    </div>
  );
}

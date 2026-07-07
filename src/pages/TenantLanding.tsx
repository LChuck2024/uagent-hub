import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TenantSitePublic } from "../types";
import { fetchTenant } from "../lib/tenantApi";
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
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col items-center justify-center px-4 gap-3">
        <p className="text-slate-400 text-sm">{error || "站点不存在"}</p>
        <a href="https://uagent.site" className="text-xs text-violet-400 hover:text-violet-300">
          返回 uAgent 商店
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/15 via-slate-950/20 to-slate-950 pointer-events-none" />

      {/* Header — buyer branding only, no platform nav */}
      <header className="relative z-10 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0">{tenant.logo}</span>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-lg text-white truncate">{tenant.title}</h1>
              <p className="text-xs text-slate-400 line-clamp-1">{tenant.welcomeMessage}</p>
            </div>
          </div>
          <Link
            to="/admin"
            className="shrink-0 p-2 rounded-lg border border-slate-800 text-slate-500 hover:text-violet-400 hover:border-violet-500/40 transition-colors"
            title="管理后台"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main — chat + pricing sidebar */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 py-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 h-full">
          <div className="glass-panel rounded-2xl border border-slate-800/80 p-4 md:p-6 flex flex-col min-h-[calc(100vh-12rem)]">
            <TenantChat tenantSlug={slug} siteTitle={tenant.title} />
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

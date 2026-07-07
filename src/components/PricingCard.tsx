import { TenantPricing } from "../types";
import { Crown, Sparkles, Zap } from "lucide-react";

interface PricingCardProps {
  pricing: TenantPricing;
  variant?: "sidebar" | "banner";
}

export function PricingCard({ pricing, variant = "sidebar" }: PricingCardProps) {
  const isFree = pricing.mode === "free";

  const content = (
    <>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-amber-500/20 to-violet-600/20 border border-amber-500/30 flex items-center justify-center">
          {isFree ? <Sparkles className="w-4 h-4 text-amber-400" /> : <Crown className="w-4 h-4 text-amber-400" />}
        </div>
        <span className="text-[10px] font-mono text-amber-300/90 uppercase tracking-wider">
          {isFree ? "免费体验中" : "升级解锁"}
        </span>
      </div>

      <p className="font-display font-bold text-2xl text-white mb-1">{pricing.priceLabel}</p>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        {isFree
          ? "当前为免费体验模式，升级后可解锁更多高级能力。"
          : "立即升级，享受无限制 AI 协助与专属定制。"}
      </p>

      {pricing.ctaUrl ? (
        <a
          href={pricing.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2.5 rounded-xl bg-linear-to-r from-amber-600 to-violet-600 hover:from-amber-500 hover:to-violet-500 text-white text-xs font-semibold text-center shadow-lg shadow-amber-500/10 transition-all"
        >
          {pricing.ctaText}
        </a>
      ) : (
        <button
          type="button"
          className="w-full py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-default"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          {pricing.ctaText}
        </button>
      )}
    </>
  );

  if (variant === "banner") {
    return (
      <div className="glass-panel rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4 md:hidden">
        {content}
      </div>
    );
  }

  return (
    <aside className="glass-panel rounded-2xl border border-slate-800/80 p-5 h-fit sticky top-6 hidden lg:block">
      {content}
    </aside>
  );
}

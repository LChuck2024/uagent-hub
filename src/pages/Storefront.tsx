import { useMemo, useState } from "react";
import { Agent } from "../types";
import { getFeaturedAgents } from "../data/communityResources";
import { useCommunityResources } from "../lib/useCommunityResources";
import { AgentProductCard } from "../components/AgentProductCard";
import { CloneModal } from "../components/CloneModal";
import { PageBackground } from "../components/layout/PageBackground";
import { MainHeader } from "../components/layout/MainHeader";
import { MainFooter } from "../components/layout/MainFooter";
import { motion } from "motion/react";
import { Flame, ShoppingBag, Sparkles, Zap } from "lucide-react";

export function Storefront() {
  const { agents, isLoading } = useCommunityResources();
  const [cloneTarget, setCloneTarget] = useState<Agent | null>(null);

  const featured = useMemo(() => getFeaturedAgents(agents, 9), [agents]);
  const heroAgent = featured[0];

  return (
    <PageBackground>
      <MainHeader />

      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 py-8 md:px-8 space-y-10">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/30 p-8 md:p-12"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-950/40 text-[10px] font-mono text-violet-300">
              <Sparkles className="w-3.5 h-3.5" />
              AI 应用低代码组装厂
            </div>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-tight">
              选一个爆款智能体，
              <span className="bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {" "}
                一键拥有专属 AI 站点
              </span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              无需写代码。克隆到你的子域名，自定义 Prompt 与视觉，向粉丝提供纯净的 AI 体验页面。
            </p>
            <div className="flex flex-wrap gap-3 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950/60">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                DeepSeek 驱动
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950/60">
                <ShoppingBag className="w-3.5 h-3.5 text-violet-400" />
                子域名即开店
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950/60">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {featured.length} 款精选爆款
              </span>
            </div>
          </div>

          {heroAgent && !isLoading && (
            <div className="relative mt-8 p-5 rounded-2xl border border-violet-500/20 bg-violet-950/20 max-w-lg">
              <p className="text-[10px] font-mono text-violet-400 mb-2">今日销冠</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{heroAgent.avatar}</span>
                <div>
                  <p className="font-display font-bold text-white">{heroAgent.name}</p>
                  <p className="text-xs text-slate-400">
                    🔥 {heroAgent.runs?.toLocaleString()} 次协助 · 立即克隆
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.section>

        {/* Product grid */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="font-display font-extrabold text-xl text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                爆款智能体橱窗
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">FEATURED AGENTS · 按热度精选</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-panel rounded-2xl p-6 h-64 animate-pulse border border-slate-900/60"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((agent, index) => (
                <div key={agent.id}>
                  <AgentProductCard
                    agent={agent}
                    rank={index + 1}
                    onClone={setCloneTarget}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <MainFooter />

      <CloneModal agent={cloneTarget} onClose={() => setCloneTarget(null)} />
    </PageBackground>
  );
}

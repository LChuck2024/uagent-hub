import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Agent, AgentCategory } from "../types";
import { STOREFRONT_CATEGORIES } from "../data/communityResources";
import { useCommunityResources } from "../lib/useCommunityResources";
import { AgentProductCard } from "../components/AgentProductCard";
import { CloneModal } from "../components/CloneModal";
import { PageBackground } from "../components/layout/PageBackground";
import { MainHeader } from "../components/layout/MainHeader";
import { MainFooter } from "../components/layout/MainFooter";
import { motion } from "motion/react";
import { ArrowLeft, ShoppingBag, Zap } from "lucide-react";

export function Storefront() {
  const { agents, isLoading } = useCommunityResources();
  const [cloneTarget, setCloneTarget] = useState<Agent | null>(null);
  const [category, setCategory] = useState<AgentCategory | "all">("all");

  const filtered = useMemo(() => {
    if (category === "all") return agents;
    return agents.filter((a) => a.category === category);
  }, [agents, category]);

  return (
    <PageBackground>
      <MainHeader />

      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 py-8 md:px-8 space-y-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-8 md:p-12"
        >
          <div className="relative max-w-2xl space-y-5">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[11px] text-stone-500 hover:text-stone-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              返回首页
            </Link>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-stone-900 tracking-tight leading-tight">
              找到能帮你干活的智能体
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed">
              点进去就能对话，不用注册。如果想做成你自己的页面发给别人，再一键生成专属链接即可。
            </p>
            <div className="flex flex-wrap gap-3 text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-200 bg-stone-50">
                <Zap className="w-3.5 h-3.5 text-orange-700" />
                打开即用
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-200 bg-stone-50">
                <ShoppingBag className="w-3.5 h-3.5 text-stone-600" />
                可生成专属链接
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-200 bg-stone-50">
                共 {agents.length} 个
              </span>
            </div>
          </div>
        </motion.section>

        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-display font-extrabold text-xl text-stone-900">全部智能体</h3>
              <p className="text-xs text-stone-500 mt-1">先试用，满意再生成专属链接</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STOREFRONT_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                    category === c.id
                      ? "bg-orange-700 border-orange-700 text-white"
                      : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-panel rounded-2xl p-6 h-64 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-stone-500 py-12 text-center">该分类下暂无智能体</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((agent) => (
                <div key={agent.id}>
                  <AgentProductCard agent={agent} onClone={setCloneTarget} />
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

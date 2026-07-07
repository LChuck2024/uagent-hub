import { Agent } from "../types";
import { Flame, Heart, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface AgentProductCardProps {
  agent: Agent;
  rank?: number;
  onClone: (agent: Agent) => void;
}

export function AgentProductCard({ agent, rank, onClone }: AgentProductCardProps) {
  return (
    <article className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between gap-4 group transition-all hover:-translate-y-1 hover:border-violet-500/30 hover:bg-slate-900/50">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
            {agent.avatar}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {rank !== undefined && rank <= 3 && (
              <span className="text-[9px] font-mono bg-amber-950/40 border border-amber-800/60 text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" />
                TOP {rank}
              </span>
            )}
            <span className="text-[9px] bg-violet-950/40 border border-violet-900/60 text-violet-400 px-2 py-0.5 rounded-full">
              官方爆款
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-slate-100 group-hover:text-violet-300 transition-colors line-clamp-1">
            {agent.name}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {agent.description}
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />
            {agent.runs?.toLocaleString() ?? 0} 次使用
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-pink-500/70" />
            {agent.likes ?? 0}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => onClone(agent)}
          className="w-full py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          克隆到我的子域名
        </button>
        <Link
          to={`/try/${agent.id}`}
          className="w-full py-2 rounded-xl border border-slate-800 hover:border-violet-500/40 bg-slate-950/60 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          免费体验
        </Link>
      </div>
    </article>
  );
}

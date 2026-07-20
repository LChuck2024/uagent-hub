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
    <article className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-4 group transition-all hover:-translate-y-0.5 hover:border-stone-400">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-2xl shrink-0">
            {agent.avatar}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {rank !== undefined && rank <= 3 && (
              <span className="text-[9px] font-mono bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded flex items-center gap-1">
                <Flame className="w-3 h-3" />
                TOP {rank}
              </span>
            )}
            <span className="text-[9px] bg-stone-100 border border-stone-200 text-stone-600 px-2 py-0.5 rounded">
              可分享
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-stone-900 group-hover:text-orange-800 transition-colors line-clamp-1">
            {agent.name}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {agent.description}
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-stone-500">
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-700" />
            {agent.runs?.toLocaleString() ?? 0} 人用过
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-stone-400" />
            {agent.likes ?? 0}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1 border-t border-stone-100">
        <Link
          to={`/try/${agent.id}`}
          className="w-full py-2.5 rounded-lg btn-primary text-xs flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          立即试用
        </Link>
        <button
          type="button"
          onClick={() => onClone(agent)}
          className="w-full py-2 rounded-lg border border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:text-stone-900 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          生成我的专属链接
        </button>
      </div>
    </article>
  );
}

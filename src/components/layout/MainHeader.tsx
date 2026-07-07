import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function MainHeader() {
  return (
    <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 py-4 md:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 pulse-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg text-white tracking-wider flex items-center gap-2">
              uAgent
              <span className="text-xs font-mono font-normal px-2 py-0.5 bg-violet-900/40 text-violet-300 border border-violet-800 rounded-full">
                STORE
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider">
              AI 智能体应用商店 · uagent.site
            </p>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <span className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-950/80">
            一键克隆 · 专属子域名
          </span>
        </div>
      </div>
    </header>
  );
}

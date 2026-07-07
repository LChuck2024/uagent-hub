import { Link, useParams } from "react-router-dom";
import { AgentChat } from "../components/AgentChat";
import { PageBackground } from "../components/layout/PageBackground";
import { useCommunityResources } from "../lib/useCommunityResources";
import { ArrowLeft, Sparkles } from "lucide-react";

export function AgentPlayground() {
  const { agentId } = useParams<{ agentId: string }>();
  const { agents, isLoading } = useCommunityResources();

  const agent = agents.find((a) => a.id === agentId);

  if (isLoading) {
    return (
      <PageBackground>
        <div className="flex-1 flex items-center justify-center relative z-10">
          <p className="text-sm text-slate-500 font-mono animate-pulse">加载智能体...</p>
        </div>
      </PageBackground>
    );
  }

  if (!agent) {
    return (
      <PageBackground>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 relative z-10 px-4">
          <p className="text-slate-400">未找到该智能体</p>
          <Link
            to="/"
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            返回商店
          </Link>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 py-3 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回商店
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            体验模式 · SSE 流式
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full px-4 py-6 md:px-8">
        <AgentChat agent={agent} />
      </main>
    </PageBackground>
  );
}

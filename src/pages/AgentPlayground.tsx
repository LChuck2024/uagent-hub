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
          <p className="text-sm text-stone-500 font-mono animate-pulse">加载智能体...</p>
        </div>
      </PageBackground>
    );
  }

  if (!agent) {
    return (
      <PageBackground>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 relative z-10 px-4">
          <p className="text-stone-500">未找到该智能体</p>
          <Link
            to="/agents"
            className="text-xs text-orange-700 hover:text-orange-800 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            返回智能体列表
          </Link>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <header className="relative z-10 border-b border-stone-200 bg-stone-50 backdrop-blur-md px-4 py-3 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link
            to="/agents"
            className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </Link>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-orange-700" />
            试用中
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full px-4 py-6 md:px-8">
        <AgentChat agent={agent} />
      </main>
    </PageBackground>
  );
}

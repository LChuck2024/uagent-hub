import React, { useState, useEffect } from "react";
import { Agent, AgentCategory, Workflow } from "./types";
import { AgentChat } from "./components/AgentChat";
import { WorkflowRunner } from "./components/WorkflowRunner";
import { CustomCreator } from "./components/CustomCreator";
import { ParentChildChallenge } from "./components/ParentChildChallenge";
import { 
  Bot, 
  Zap, 
  Sparkles, 
  Search, 
  PlusCircle, 
  Heart, 
  Play, 
  LayoutGrid, 
  Layers, 
  Clock, 
  Compass, 
  ChevronRight, 
  Flame, 
  Award,
  Globe,
  Share2,
  Users,
  Grid
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeCategory, setActiveCategory] = useState<AgentCategory | "all">("all");
  const [activeType, setActiveType] = useState<"all" | "agent" | "workflow">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"hot" | "likes" | "new">("hot");

  // Load resources from database
  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/community/resources");
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
        setWorkflows(data.workflows || []);
      }
    } catch (err) {
      console.error("Error fetching community resources:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleLike = async (type: "agent" | "workflow", id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch("/api/community/interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, action: "like" })
      });
      if (response.ok) {
        // Optimistic UI update
        if (type === "agent") {
          setAgents(prev => prev.map(a => a.id === id ? { ...a, likes: (a.likes || 0) + 1 } : a));
          if (selectedAgent && selectedAgent.id === id) {
            setSelectedAgent(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
          }
        } else {
          setWorkflows(prev => prev.map(w => w.id === id ? { ...w, likes: (w.likes || 0) + 1 } : w));
          if (selectedWorkflow && selectedWorkflow.id === id) {
            setSelectedWorkflow(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
          }
        }
      }
    } catch (err) {
      console.error("Error liking item:", err);
    }
  };

  const handleShare = async (type: "agent" | "workflow", resource: any) => {
    try {
      const response = await fetch("/api/community/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, resource })
      });
      if (response.ok) {
        alert(`🎉 发布成功！您的自定义${type === "agent" ? "智能体" : "工作流"}已成功注入到智能生态大厅中。`);
        setShowCreator(false);
        fetchResources();
      }
    } catch (err) {
      console.error("Error sharing resource:", err);
    }
  };

  const handleCreate = async (type: "agent" | "workflow", resource: any) => {
    await handleShare(type, resource);
  };

  const categories: { key: AgentCategory | "all"; label: string; icon: string }[] = [
    { key: "all", label: "全部品类", icon: "🌌" },
    { key: "office", label: "高效办公", icon: "💼" },
    { key: "programming", label: "极客编程", icon: "💻" },
    { key: "marketing", label: "文案营销", icon: "✍️" },
    { key: "parenting", label: "亲子成长", icon: "🍼" },
    { key: "life", label: "生活助手", icon: "🍳" },
    { key: "finance", label: "金融理财", icon: "📈" },
    { key: "design", label: "创意设计", icon: "🎨" },
    { key: "travel", label: "全球旅游", icon: "✈️" }
  ];

  // Filter and Sort Lists based on Search, Category & Criteria
  const getSortedAndFilteredAgents = () => {
    const filtered = agents.filter(agent => {
      // 1. Category level filter
      const matchesCategory = activeCategory === "all" || agent.category === activeCategory;

      // 2. Search filter
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            agent.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });

    if (sortBy === "hot") {
      return [...filtered].sort((a, b) => (b.runs || 0) - (a.runs || 0));
    } else if (sortBy === "likes") {
      return [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      return [...filtered].sort((a, b) => (b.isCustom ? 1 : 0) - (a.isCustom ? 1 : 0));
    }
  };

  const getSortedAndFilteredWorkflows = () => {
    const filtered = workflows.filter(wf => {
      // 1. Category level filter
      const matchesCategory = activeCategory === "all" || wf.category === activeCategory;

      // 2. Search filter
      const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            wf.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });

    if (sortBy === "hot") {
      return [...filtered].sort((a, b) => (b.runs || 0) - (a.runs || 0));
    } else if (sortBy === "likes") {
      return [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      return [...filtered].sort((a, b) => (b.isCustom ? 1 : 0) - (a.isCustom ? 1 : 0));
    }
  };

  const filteredAgents = getSortedAndFilteredAgents();
  const filteredWorkflows = getSortedAndFilteredWorkflows();

  const getCategoryCount = (catKey: AgentCategory | "all") => {
    const matchesSearch = (name: string, desc: string) => {
      return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             desc.toLowerCase().includes(searchQuery.toLowerCase());
    };

    const countAgents = agents.filter(a => {
      const matchesCat = catKey === "all" ? true : a.category === catKey;
      return matchesCat && matchesSearch(a.name, a.description);
    }).length;

    const countWorkflows = workflows.filter(w => {
      const matchesCat = catKey === "all" ? true : w.category === catKey;
      return matchesCat && matchesSearch(w.name, w.description);
    }).length;

    if (activeType === "agent") return countAgents;
    if (activeType === "workflow") return countWorkflows;
    return countAgents + countWorkflows;
  };

  // Featured Banner Items
  const featuredAgent = agents.find(a => a.id === "code_doctor") || agents[0];
  const featuredWorkflow = workflows.find(w => w.id === "weekly_to_ppt_email") || workflows[0];

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col font-sans selection:bg-violet-600/30 selection:text-white">
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-950/20 via-slate-950/30 to-slate-950 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* Futuristic Main Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
            setSelectedAgent(null);
            setSelectedWorkflow(null);
            setShowCreator(false);
          }}>
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 pulse-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-lg text-white tracking-wider flex items-center gap-2">
                uAgent <span className="text-xs font-mono font-normal px-2 py-0.5 bg-violet-900/40 text-violet-300 border border-violet-800 rounded-full">BETA 1.5</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider">一站式 AI 智能体与工作流聚合中心 (uagent.site)</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索智能体或工作流..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-violet-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all font-mono"
              />
            </div>

            {/* Custom Create trigger */}
            <button
              onClick={() => {
                setSelectedAgent(null);
                setSelectedWorkflow(null);
                setShowCreator(true);
              }}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>自定义配置</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 py-6 md:px-8">
        <AnimatePresence mode="wait">
          {/* 1. Custom Creator Screen */}
          {showCreator ? (
            <motion.div
              key="creator"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <CustomCreator
                onCreated={handleCreate}
                onCancel={() => setShowCreator(false)}
              />
            </motion.div>
          ) : selectedAgent ? (
            /* 2. Active Agent Conversation Panel */
            <motion.div
              key="agent-chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AgentChat
                agent={selectedAgent}
                onBack={() => setSelectedAgent(null)}
                onShare={(a) => handleShare("agent", a)}
              />
            </motion.div>
          ) : selectedWorkflow ? (
            /* 3. Active Workflow Sequence Execution Terminal */
            <motion.div
              key="workflow-runner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <WorkflowRunner
                workflow={selectedWorkflow}
                onBack={() => setSelectedWorkflow(null)}
                onShare={(w) => handleShare("workflow", w)}
              />
            </motion.div>
          ) : (
            /* 4. Directory & Recommendation Plaza Dashboard */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Highlight Hero Board (Featured Item Preview) */}
              {!searchQuery && activeCategory === "all" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Big Banner: Dynamic AI Agent spotlight */}
                  {featuredAgent && (
                    <div 
                      onClick={() => setSelectedAgent(featuredAgent)}
                      className="lg:col-span-7 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:border-violet-500/30"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/15 transition-all" />
                      <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-3xl md:text-4xl shadow-inner shadow-violet-500/10">
                        {featuredAgent.avatar}
                      </div>
                      <div className="flex-1 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-violet-600/20 text-violet-300 px-2 py-0.5 rounded border border-violet-500/30">
                            今日精选智能体
                          </span>
                          <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            HOT
                          </span>
                        </div>
                        <h2 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-wide group-hover:text-violet-300 transition-colors">
                          {featuredAgent.name}
                        </h2>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                          {featuredAgent.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                          <span>🔥 {featuredAgent.runs || 0} 次协助</span>
                          <span>❤️ {featuredAgent.likes || 0} 赞数</span>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-slate-950 border border-slate-800 group-hover:border-violet-500 group-hover:bg-violet-600/20 transition-all">
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                      </div>
                    </div>
                  )}

                  {/* Right Banner: Advanced Flow Spotlight */}
                  {featuredWorkflow && (
                    <div 
                      onClick={() => setSelectedWorkflow(featuredWorkflow)}
                      className="lg:col-span-5 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:border-cyan-500/30"
                    >
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl group-hover:bg-cyan-600/15 transition-all" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-cyan-600/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                            多轨串联自动化流
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            SEQUENTIAL AI
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                          {featuredWorkflow.name}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                          {featuredWorkflow.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-800/50 mt-4">
                        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                          <span>⚡ {featuredWorkflow.steps.length} 个串联步骤</span>
                          <span>❤️ {featuredWorkflow.likes || 0} 赞</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:bg-cyan-600/20 group-hover:border-cyan-500 transition-all">
                          <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-white fill-current" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Classification Navigation Tabs */}
              <div className="bg-slate-900/30 p-5 rounded-3xl border border-slate-800/40 backdrop-blur-xs">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-violet-500 rounded-full animate-pulse" />
                      <label className="text-[11px] font-mono tracking-wider text-violet-300 uppercase font-semibold">
                        智能品类探索 (Explore Categories)
                      </label>
                    </div>
                    {activeCategory !== "all" && (
                      <button 
                        type="button"
                        onClick={() => setActiveCategory("all")}
                        className="text-[10px] text-slate-400 hover:text-white transition-colors underline decoration-slate-600 underline-offset-4 cursor-pointer"
                      >
                        清除筛选 (Clear Filter)
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map(cat => {
                      const isSelected = activeCategory === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setActiveCategory(cat.key)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2.5 cursor-pointer border group ${
                            isSelected
                              ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white border-violet-500 shadow-md shadow-violet-500/10 scale-[1.02]"
                              : "bg-slate-950/80 hover:bg-slate-900 border-slate-800/80 text-slate-300 hover:text-white hover:-translate-y-0.5"
                          }`}
                        >
                          <span className={`text-sm transition-transform ${isSelected ? "animate-bounce" : "group-hover:scale-110"}`}>
                            {cat.icon}
                          </span>
                          <span>{cat.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold transition-all ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-900 text-slate-400 group-hover:text-slate-300"
                          }`}>
                            {getCategoryCount(cat.key)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

                {/* Summer Parent-Child Challenge 特辑 */}
                {!searchQuery && activeCategory === "parenting" && (
                  <ParentChildChallenge
                    onSelectAgent={(agentId, initialVars) => {
                      const found = agents.find(a => a.id === agentId);
                      if (found) {
                        if (initialVars) {
                          const updatedAgent = {
                            ...found,
                            variables: found.variables.map(v => 
                              initialVars[v.name] ? { ...v, defaultValue: initialVars[v.name] } : v
                            )
                          };
                          setSelectedAgent(updatedAgent);
                        } else {
                          setSelectedAgent(found);
                        }
                      }
                    }}
                    onSelectWorkflow={(workflowId, initialVars) => {
                      const found = workflows.find(w => w.id === workflowId);
                      if (found) {
                        if (initialVars) {
                          const updatedWf = {
                            ...found,
                            triggerInputs: found.triggerInputs.map(v => 
                              initialVars[v.name] ? { ...v, defaultValue: initialVars[v.name] } : v
                            )
                          };
                          setSelectedWorkflow(updatedWf);
                        } else {
                          setSelectedWorkflow(found);
                        }
                      }
                    }}
                    allAgents={agents}
                    allWorkflows={workflows}
                  />
                )}

                {/* SubType Filter Tabs: Agent vs. Workflows */}
                <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveType("all")}
                      className={`text-sm font-bold tracking-wide transition-all pb-3 relative cursor-pointer ${
                        activeType === "all"
                          ? "text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Grid className="w-4 h-4 text-violet-400" />
                        <span>全部融合 ({filteredAgents.length + filteredWorkflows.length})</span>
                      </div>
                      {activeType === "all" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveType("agent")}
                      className={`text-sm font-bold tracking-wide transition-all pb-3 relative cursor-pointer ${
                        activeType === "agent"
                          ? "text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-violet-400" />
                        <span>精品智能体 ({filteredAgents.length})</span>
                      </div>
                      {activeType === "agent" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveType("workflow")}
                      className={`text-sm font-bold tracking-wide transition-all pb-3 relative cursor-pointer ${
                        activeType === "workflow"
                          ? "text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span>复合自动化工作流 ({filteredWorkflows.length})</span>
                      </div>
                      {activeType === "workflow" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950/60 p-1 border border-slate-800/80 rounded-xl">
                    <button
                      onClick={() => setSortBy("hot")}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg font-mono transition-all cursor-pointer ${
                        sortBy === "hot"
                          ? "bg-violet-900/40 text-violet-300 border border-violet-800/60"
                          : "text-slate-400 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      🔥 最热协助
                    </button>
                    <button
                      onClick={() => setSortBy("likes")}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg font-mono transition-all cursor-pointer ${
                        sortBy === "likes"
                          ? "bg-violet-900/40 text-violet-300 border border-violet-800/60"
                          : "text-slate-400 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      ❤️ 高额赞同
                    </button>
                    <button
                      onClick={() => setSortBy("new")}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg font-mono transition-all cursor-pointer ${
                        sortBy === "new"
                          ? "bg-violet-900/40 text-violet-300 border border-violet-800/60"
                          : "text-slate-400 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      ✨ 新品推荐
                    </button>
                  </div>
                </div>

              {/* Grid Directory Lists */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} className="bg-slate-950/40 border border-slate-900/60 rounded-2xl p-6 space-y-4 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-900 rounded w-2/3" />
                          <div className="h-3 bg-slate-900 rounded w-1/3" />
                        </div>
                      </div>
                      <div className="h-10 bg-slate-900 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {activeType === "all" ? (
                    <div className="space-y-12">
                      {/* Section 1: Agents */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                          <h4 className="font-display font-extrabold text-sm text-slate-200 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-violet-500 rounded-full" />
                            🤖 领域专属 AI 智能体 ({filteredAgents.length})
                          </h4>
                          <span className="text-[11px] text-slate-400 font-mono">INTELLIGENT AGENTS</span>
                        </div>
                        {filteredAgents.length === 0 ? (
                          <div className="text-center py-12 glass-panel rounded-2xl border border-slate-900/60">
                            <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">该分类下暂无专属智能体</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAgents.map(agent => (
                              <div
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent)}
                                className="glass-panel p-5 rounded-2xl hover:bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between gap-4 group cursor-pointer transition-all hover:-translate-y-1 hover:border-violet-500/30"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="w-11 h-11 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-2xl shadow-inner">
                                      {agent.avatar}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {agent.isCustom ? (
                                        <span className="text-[9px] bg-cyan-950/40 border border-cyan-900/60 text-cyan-400 px-2 py-0.5 rounded-full">
                                          社区贡献
                                        </span>
                                      ) : (
                                        <span className="text-[9px] bg-violet-950/40 border border-violet-900/60 text-violet-400 px-2 py-0.5 rounded-full">
                                          官方精品
                                        </span>
                                      )}
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        {agent.category.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <h4 className="font-display font-bold text-slate-200 group-hover:text-violet-300 transition-colors">
                                      {agent.name}
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 h-9">
                                      {agent.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-800/60 pt-3.5 mt-1">
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    By {agent.author || "官方工程师"}
                                  </span>

                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={(e) => handleLike("agent", agent.id, e)}
                                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                                      title="点赞"
                                    >
                                      <Heart className="w-3.5 h-3.5" />
                                      <span>{agent.likes || 0}</span>
                                    </button>
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      🔥 {agent.runs || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Section 2: Workflows */}
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                          <h4 className="font-display font-extrabold text-sm text-slate-200 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-cyan-500 rounded-full" />
                            ⚡ 场景自动化串联流 ({filteredWorkflows.length})
                          </h4>
                          <span className="text-[11px] text-slate-400 font-mono">AUTOMATED PIPELINES</span>
                        </div>
                        {filteredWorkflows.length === 0 ? (
                          <div className="text-center py-12 glass-panel rounded-2xl border border-slate-900/60">
                            <Zap className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">该分类下暂无自动化流</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredWorkflows.map(wf => (
                              <div
                                key={wf.id}
                                onClick={() => setSelectedWorkflow(wf)}
                                className="glass-panel p-5 rounded-2xl hover:bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between gap-4 group cursor-pointer transition-all hover:-translate-y-1 hover:border-cyan-500/30"
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="w-11 h-11 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-2xl shadow-inner">
                                      ⚡
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {wf.isCustom ? (
                                        <span className="text-[9px] bg-violet-950/40 border border-violet-900/60 text-violet-400 px-2 py-0.5 rounded-full">
                                          社区共建
                                        </span>
                                      ) : (
                                        <span className="text-[9px] bg-cyan-950/40 border border-cyan-900/60 text-cyan-400 px-2 py-0.5 rounded-full">
                                          官方自研
                                        </span>
                                      )}
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        {wf.category.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <h4 className="font-display font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                                      {wf.name}
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 h-9">
                                      {wf.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2 border-t border-slate-800/60 pt-3.5 mt-1">
                                  <div className="flex flex-wrap gap-1">
                                    {wf.steps.map((step, sIdx) => (
                                      <span 
                                        key={step.id} 
                                        className="text-[9px] bg-slate-950/60 border border-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono"
                                      >
                                        Step {sIdx + 1}: {step.name.substring(0, 8)}..
                                      </span>
                                    ))}
                                  </div>

                                  <div className="flex items-center justify-between text-xs pt-1">
                                    <span className="text-[11px] text-slate-500 font-mono">
                                      By {wf.author || "官方工程师"}
                                    </span>

                                    <div className="flex items-center gap-3">
                                      <button
                                        type="button"
                                        onClick={(e) => handleLike("workflow", wf.id, e)}
                                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                                        title="赞同"
                                      >
                                        <Heart className="w-3.5 h-3.5" />
                                        <span>{wf.likes || 0}</span>
                                      </button>
                                      <span className="text-[11px] text-slate-400 font-mono">
                                        ⚙️ {wf.runs || 0}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : activeType === "agent" ? (
                    filteredAgents.length === 0 ? (
                      <div className="text-center py-16 glass-panel rounded-2xl border border-slate-900">
                        <Compass className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <h4 className="font-display font-semibold text-slate-400">未找到相匹配的智能体</h4>
                        <p className="text-xs text-slate-500 mt-1">您可以试着清空搜索框，或者自定义创建一个！</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAgents.map(agent => (
                          <div
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent)}
                            className="glass-panel p-5 rounded-2xl hover:bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between gap-4 group cursor-pointer transition-all hover:-translate-y-1 hover:border-violet-500/30"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="w-11 h-11 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-2xl shadow-inner">
                                  {agent.avatar}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {agent.isCustom ? (
                                    <span className="text-[9px] bg-cyan-950/40 border border-cyan-900/60 text-cyan-400 px-2 py-0.5 rounded-full">
                                      社区贡献
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-violet-950/40 border border-violet-900/60 text-violet-400 px-2 py-0.5 rounded-full">
                                      官方自研
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {agent.category.toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h4 className="font-display font-bold text-slate-200 group-hover:text-violet-300 transition-colors">
                                  {agent.name}
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 h-9">
                                  {agent.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-800/60 pt-3.5 mt-1">
                              <span className="text-[11px] text-slate-500 font-mono">
                                By {agent.author || "系统管理员"}
                              </span>

                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={(e) => handleLike("agent", agent.id, e)}
                                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                                  title="点赞"
                                >
                                  <Heart className="w-3.5 h-3.5" />
                                  <span>{agent.likes || 0}</span>
                                </button>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  🔥 {agent.runs || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    filteredWorkflows.length === 0 ? (
                      <div className="text-center py-16 glass-panel rounded-2xl border border-slate-900">
                        <Compass className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <h4 className="font-display font-semibold text-slate-400">未找到相匹配的自动化流</h4>
                        <p className="text-xs text-slate-500 mt-1">您可以尝试重新配置或者自定义编排工作流！</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWorkflows.map(wf => (
                          <div
                            key={wf.id}
                            onClick={() => setSelectedWorkflow(wf)}
                            className="glass-panel p-5 rounded-2xl hover:bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between gap-4 group cursor-pointer transition-all hover:-translate-y-1 hover:border-cyan-500/30"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="w-11 h-11 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-2xl shadow-inner">
                                  ⚡
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {wf.isCustom ? (
                                    <span className="text-[9px] bg-violet-950/40 border border-violet-900/60 text-violet-400 px-2 py-0.5 rounded-full">
                                      社区共建
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-cyan-950/40 border border-cyan-900/60 text-cyan-400 px-2 py-0.5 rounded-full">
                                      官方自研
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {wf.category.toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h4 className="font-display font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                                  {wf.name}
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 h-9">
                                  {wf.description}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2 border-t border-slate-800/60 pt-3.5 mt-1">
                              <div className="flex flex-wrap gap-1">
                                {wf.steps.map((step, sIdx) => (
                                  <span 
                                    key={step.id} 
                                    className="text-[9px] bg-slate-950/60 border border-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono"
                                  >
                                    Step {sIdx + 1}: {step.name.substring(0, 8)}..
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-[11px] text-slate-500 font-mono">
                                  By {wf.author || "官方工程师"}
                                </span>

                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={(e) => handleLike("workflow", wf.id, e)}
                                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                                    title="赞同"
                                  >
                                    <Heart className="w-3.5 h-3.5" />
                                    <span>{wf.likes || 0}</span>
                                  </button>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    ⚙️ {wf.runs || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Futuristic Bottom Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 py-6 text-center text-xs text-slate-500 z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono">
            © 2026 uagent.site Smart Platform. Powered by LChuck Studio.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              中国智慧生态区
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-violet-400" />
              社区在线: 12,450 人
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

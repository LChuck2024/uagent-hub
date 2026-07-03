import React, { useState, useEffect } from "react";
import { Workflow, WorkflowRunLog } from "../types";
import { Markdown } from "./Markdown";
import { readJsonResponse } from "../lib/api";
import { Play, PlayCircle, Loader2, CheckCircle2, XCircle, AlertCircle, Eye, Settings, Terminal, Database, ArrowDown, HelpCircle, Heart, Zap, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WorkflowRunnerProps {
  workflow: Workflow;
  onBack?: () => void;
  onShare?: (workflow: Workflow) => void;
}

const workflowPresets: Record<string, Array<{ label: string; values: Record<string, string> }>> = {
  bedtime_story_audio: [
    { label: "🍂 小树叶飞翔 (5岁)", values: { theme: "一片勇敢的小树叶随风进行环球飞翔旅行", age: "5岁" } },
    { label: "🐙 发光小章鱼 (3岁)", values: { theme: "深海里一只会发光的小章鱼寻找失落的星星", age: "3岁" } }
  ],
  travel_planner_translation: [
    { label: "🍵 清迈深度游 (3天)", values: { destination: "泰国清迈", days: "3", lang: "泰语" } },
    { label: "🥐 巴黎文艺行 (5天)", values: { destination: "法国巴黎", days: "5", lang: "法语" } }
  ],
  weekly_to_ppt_email: [
    { label: "🔧 研发周报精整案例", values: { bullets: "1. 修复了支付模块在大促期间的性能瓶颈。\n2. 与设计部门讨论了全新Dark Mode的UI元素风格。\n3. 下周计划升级Redis缓存连接池和配置负载均衡器。" } },
    { label: "📈 市场拉新周报案例", values: { bullets: "1. 策划了暑期拉新大转盘活动，转化率提升15%。\n2. 完成了三份异业合作推广协议的签署。\n3. 下周计划制定新一轮KOL社交媒体种草投放预算。" } }
  ],
  marketing_pipeline: [
    { label: "💰 自动存钱系统爆款", values: { core_idea: "通过建立简单好上手的自动存钱系统，让月光族程序员不知不觉中攒够10万元。" } },
    { label: "🍵 静静喝茶极简生活", values: { core_idea: "用极简喝茶和整理房间，代替疯狂消费来解压，找回内心的宁静与松弛感。" } }
  ]
};

export function WorkflowRunner({ workflow, onBack, onShare }: WorkflowRunnerProps) {
  const [triggerValues, setTriggerValues] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<WorkflowRunLog[]>([]);
  const [finalOutput, setFinalOutput] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"logs" | "final">("final");
  const [elapsed, setElapsed] = useState(0);

  // Initialize trigger input values
  useEffect(() => {
    const defaultVals: Record<string, string> = {};
    workflow.triggerInputs.forEach(input => {
      defaultVals[input.name] = input.defaultValue || "";
    });
    setTriggerValues(defaultVals);
    setLogs([]);
    setFinalOutput(null);
    setError(null);
    setIsRunning(false);
  }, [workflow]);

  // Duration Timer during execution
  useEffect(() => {
    let timer: any;
    if (isRunning) {
      setElapsed(0);
      timer = setInterval(() => {
        setElapsed(prev => prev + 100);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const handleInputChange = (name: string, value: string) => {
    setTriggerValues(prev => ({ ...prev, [name]: value }));
  };

  const handleExecute = async () => {
    setIsRunning(true);
    setError(null);
    setFinalOutput(null);
    setActiveTab("final");

    // Pre-populate logs with 'pending'
    const initialLogs: WorkflowRunLog[] = workflow.steps.map(step => ({
      stepId: step.id,
      stepName: step.name,
      status: "pending" as const,
    }));
    setLogs(initialLogs);

    try {
      const response = await fetch("/api/workflow/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steps: workflow.steps,
          triggerValues
        })
      });

      const data = await readJsonResponse<{
        success: boolean;
        logs: WorkflowRunLog[];
        finalOutput: string;
      }>(response, "工作流运行时异常");

      setLogs(data.logs);
      setFinalOutput(data.finalOutput);
      
      if (!data.success) {
        setError("工作流执行中断，部分步骤失败。");
        setActiveTab("logs");
      }

      // Track running interaction with server
      await fetch("/api/community/interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "workflow", id: workflow.id, action: "run" })
      });
    } catch (err: any) {
      setError(err.message || "工作流引擎触发失败。");
      setActiveTab("logs");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:flex-row gap-6">
      {/* Configure Side Rail */}
      <div className="w-full lg:w-85 flex flex-col gap-4 overflow-y-auto pr-1">
        {/* Workflow Info */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner shadow-cyan-500/10">
              ⚡
            </div>
            <div>
              <h3 className="font-display font-bold text-white tracking-wide text-md">{workflow.name}</h3>
              <p className="text-[10px] text-cyan-400 font-mono mt-0.5">#{workflow.category.toUpperCase()} WORKFLOW</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-900">
            {workflow.description}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>作者: {workflow.author || "官方认证"}</span>
            <span className="flex items-center gap-1">
              <span>🔥 {workflow.runs || 0} 次编译</span>
            </span>
          </div>

          {onShare && !workflow.isCustom && (
            <button
              onClick={() => onShare(workflow)}
              className="mt-2 text-xs text-center py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-slate-300 transition-all cursor-pointer"
            >
              一键分享该工作流
            </button>
          )}
        </div>

        {/* Inputs Fields Form */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h4 className="font-display font-semibold text-sm text-slate-200">Trigger 触发变量配置</h4>
          </div>

          <div className="space-y-4">
            {workflow.triggerInputs.map(input => (
              <div key={input.name} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <span>{input.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({`{{trigger.${input.name}}}`})</span>
                </label>
                {input.name === "bullets" || input.name === "raw_draft" ? (
                  <textarea
                    value={triggerValues[input.name] || ""}
                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                    placeholder={input.placeholder}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none h-24"
                  />
                ) : (
                  <input
                    type="text"
                    value={triggerValues[input.name] || ""}
                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                    placeholder={input.placeholder}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  />
                )}
              </div>
            ))}

            {workflowPresets[workflow.id] && (
              <div className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <span>💡</span> 快捷一键填充示范:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {workflowPresets[workflow.id].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTriggerValues(prev => ({ ...prev, ...p.values }))}
                      disabled={isRunning}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 px-2 py-1 rounded-lg transition-all text-left truncate max-w-full cursor-pointer disabled:opacity-50"
                      title={p.label}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleExecute}
              disabled={isRunning}
              className="w-full py-2.5 mt-2 rounded-xl bg-linear-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>自动化流运行中 ({(elapsed / 1000).toFixed(1)}s)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>一键编译并顺序执行</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Workflow Map Schema */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Terminal className="w-4 h-4 text-violet-400" />
            <h4 className="font-display font-semibold text-sm text-slate-200">多步骤执行网络拓扑</h4>
          </div>

          <div className="relative pl-4 border-l-2 border-slate-800 space-y-4 pt-1 py-1">
            <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-cyan-400" />
            
            <div className="text-xs text-cyan-400 font-mono font-semibold flex items-center gap-1.5">
              <span>Trigger</span>
              <span className="text-[10px] text-slate-500 font-normal">(触发初始输入)</span>
            </div>

            {workflow.steps.map((step, idx) => (
              <div key={step.id} className="relative flex flex-col gap-1 pl-1">
                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-violet-500 flex items-center justify-center" />
                <div className="text-xs text-slate-200 font-semibold flex items-center gap-1">
                  <span>{step.name}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 bg-slate-950/50 p-1.5 rounded border border-slate-900/60 overflow-hidden text-ellipsis whitespace-nowrap">
                  输出变量: <span className="text-violet-400">{step.outputVarName}</span>
                </div>
                {idx < workflow.steps.length - 1 && (
                  <ArrowDown className="w-3 h-3 text-slate-700 my-0.5 ml-2" />
                )}
              </div>
            ))}

            <div className="absolute bottom-0 -left-[5px] w-2 h-2 rounded-full bg-violet-400" />
            <div className="text-xs text-violet-400 font-mono font-semibold flex items-center gap-1.5">
              <span>End Output</span>
              <span className="text-[10px] text-slate-500 font-normal">(汇聚最终解)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Runner Screen */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-800/80 flex flex-col h-full overflow-hidden">
        {/* Navigation / Mode Tab */}
        <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("final")}
              className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "final"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              最终聚合产物 (Final Solution)
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "logs"
                  ? "bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-inner"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              单步推理过程 & 耗时
            </button>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="text-xs px-3 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-300 transition-all cursor-pointer"
            >
              返回大厅
            </button>
          )}
        </div>

        {/* Console Box with Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/10">
          {activeTab === "final" ? (
            <div className="h-full flex flex-col">
              {!finalOutput && !isRunning ? (
                <div className="m-auto flex flex-col items-center justify-center text-center max-w-sm space-y-4 py-12">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-2xl text-cyan-400 pulse-glow">
                    🔮
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-slate-200">等待智能多轨工作流编译</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      请完成左侧的触发条件并点击“顺序执行”。系统将顺序调用Gemini大模型，前一个步骤的产出将作为下一个步骤的语义上下文，自动化完成多维度高阶任务。
                    </p>
                  </div>
                </div>
              ) : isRunning && !finalOutput ? (
                <div className="m-auto flex flex-col items-center justify-center text-center max-w-sm space-y-4 py-12">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
                    <Zap className="w-4 h-4 text-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-slate-200">多步骤大模型推理深度编译中</h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      已经执行时长: <span className="text-cyan-400">{(elapsed / 1000).toFixed(1)}s</span>
                    </p>
                    <div className="mt-4 flex flex-col gap-2 bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-left max-h-40 overflow-y-auto">
                      {logs.map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-400 flex items-center gap-1">
                            {log.status === "completed" && <span className="text-emerald-500">●</span>}
                            {log.status === "running" && <span className="text-violet-400 animate-pulse">●</span>}
                            {log.status === "pending" && <span className="text-slate-600">●</span>}
                            {log.status === "failed" && <span className="text-red-500">●</span>}
                            {log.stepName}
                          </span>
                          <span className={`${
                            log.status === "completed" ? "text-emerald-400" :
                            log.status === "running" ? "text-violet-400 animate-pulse" :
                            "text-slate-500"
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-slate-300 font-mono">SOLUTION COMPILED SUCCESSFULLY</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(finalOutput || "");
                        alert("📋 最终输出结果已成功复制到剪贴板！");
                      }}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 font-mono hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      复制最终产物
                    </button>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-6 shadow-inner relative min-h-[300px]">
                    <Markdown content={finalOutput || ""} />
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 font-mono">WORKFLOW TRACE DIRECTORY</span>
                {error && <span className="text-xs text-red-400 font-mono flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> 部分步骤异常</span>}
              </div>

              {logs.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-12">
                  无历史调用链路追踪。点击运行即可生成链路。
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log, index) => (
                    <motion.div
                      key={log.stepId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-panel rounded-xl border border-slate-800 overflow-hidden"
                    >
                      {/* Step Header */}
                      <div className="bg-slate-950/60 px-4 py-3 flex items-center justify-between border-b border-slate-800/60">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs text-slate-500 font-mono font-bold">STEP {index + 1}</span>
                          <h5 className="text-xs font-bold text-slate-200">{log.stepName}</h5>
                        </div>
                        <div className="flex items-center gap-3">
                          {log.durationMs !== undefined && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800/50 px-2 py-0.5 rounded">
                              ⏱️ {(log.durationMs / 1000).toFixed(2)}s
                            </span>
                          )}
                          {log.status === "completed" && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              SUCCESS
                            </span>
                          )}
                          {log.status === "running" && (
                            <span className="text-[10px] font-mono text-violet-400 bg-violet-950/30 border border-violet-900/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
                              RUNNING
                            </span>
                          )}
                          {log.status === "pending" && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800/50 px-2.5 py-0.5 rounded-full">
                              PENDING
                            </span>
                          )}
                          {log.status === "failed" && (
                            <span className="text-[10px] font-mono text-red-400 bg-red-950/30 border border-red-900/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-red-400" />
                              FAILED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Step Body */}
                      <div className="p-4 space-y-3 bg-slate-950/20 text-xs">
                        {log.inputParsed && (
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-wider font-semibold">Parsed Prompt (解析后输入提示词)</span>
                            <pre className="bg-slate-950/80 border border-slate-900 p-2.5 rounded font-mono text-[10px] text-slate-400 whitespace-pre-wrap">
                              {log.inputParsed}
                            </pre>
                          </div>
                        )}

                        {log.output && (
                          <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-3">
                            <span className="text-[10px] font-mono text-violet-400/80 uppercase tracking-wider font-semibold">Step Output (单步大模型产出)</span>
                            <div className="bg-slate-950/80 border border-slate-900 p-3 rounded text-slate-300">
                              <Markdown content={log.output} />
                            </div>
                          </div>
                        )}

                        {log.error && (
                          <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-3">
                            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider font-semibold">Error Message (编译报错)</span>
                            <div className="bg-red-950/40 border border-red-900/40 text-red-300 p-3 rounded font-mono text-xs">
                              {log.error}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Agent, ChatMessage } from "../types";
import { Markdown } from "./Markdown";
import { streamAgentChat } from "../lib/sseClient";
import { categoryLabel } from "../data/communityResources";
import { Send, Sparkles, Sliders, RefreshCw, AlertCircle, Bot, User, CheckCircle, Copy, Download, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AgentChatProps {
  agent: Agent;
  onBack?: () => void;
  onShare?: (agent: Agent) => void;
}

const agentPresets: Record<string, Array<{ label: string; values: Record<string, string> }>> = {
  baby_sleep: [
    { label: "狐狸找云朵 (3岁)", values: { age: "3岁", theme: "慵懒的小狐狸寻找软绵绵的云朵", moral: "放松心情，安稳入睡" } },
    { label: "星空小乌龟 (5岁)", values: { age: "5岁", theme: "慢吞吞的小乌龟在星空下旅行", moral: "理解耐心的力量" } },
  ],
  child_psychology: [
    { label: "扔东西宣泄 (5岁)", values: { situation: "孩子5岁，最近经常说‘不’，甚至会扔东西宣泄情绪。" } },
    { label: "不肯按时吃饭 (3岁)", values: { situation: "3岁宝宝到吃饭时间总想玩积木，不喂就不肯吃，还会哭闹。" } },
  ],
  parent_child_mentor: [
    { label: "AI 六页绘本", values: { project_name: "AI生成6页绘本", child_age: "6岁" } },
    { label: "周末短片共创", values: { project_name: "用AI写一个1分钟亲子短片剧本", child_age: "8岁" } },
  ],
  tour_architect: [
    { label: "云南慢旅行 (3天)", values: { destination: "云南大理", days: "3天", style: "慢节奏、人文与咖啡馆发呆、看日落" } },
    { label: "冰岛探险 (7天)", values: { destination: "冰岛雷克雅未克", days: "7天", style: "户外越野、看极光与极昼、泡温泉" } },
  ],
  biz_email_expert: [
    { label: "委婉催款", values: { raw_draft: "客户迟迟不付尾款，得委婉但强硬地催他们付款，不然项目要停了。", tone: "坚定、严谨而礼貌" } },
    { label: "请假交接", values: { raw_draft: "家里有急事下周要请假3天，工作都已经对接给张三了，希望老板批准。", tone: "真诚、职业且客气" } },
  ],
  code_doctor: [
    { label: "优化去重函数", values: { code: "function unique(arr) {\n  let res = [];\n  for(let i=0; i<arr.length; i++) {\n    if(res.indexOf(arr[i]) === -1) {\n      res.push(arr[i]);\n    }\n  }\n  return res;\n}", target_lang: "优化性能至 O(n) 并解释优化点" } },
    { label: "翻译为 Python", values: { code: "function getTreeDepth(node) {\n  if (!node) return 0;\n  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));\n}", target_lang: "无损翻译为 Python 并加上类型批注" } },
  ],
  kitchen_creative: [
    { label: "剩米饭与海苔", values: { ingredients: "剩米饭、半个洋葱、鸡蛋、几瓣大蒜和一包海苔", utensils: "单平底锅与微波炉" } },
    { label: "豆腐与肉末", values: { ingredients: "一块老豆腐、一小碗猪肉末、一把小葱、一勺豆瓣酱", utensils: "空气炸锅与电饭煲" } },
  ],
  finance_advisor: [
    { label: "小家庭资产配置", values: { income: "2.5万元", savings: "15万元", goal: "3年内准备生娃与置换小两居首付款" } },
    { label: "单身半退休规划", values: { income: "1.2万元", savings: "8万元", goal: "规划通过极简主义生活，在45岁前实现半退休" } },
  ],
  ui_designer: [
    { label: "白噪音专注 App", values: { app_type: "雨声与白噪音极简专注工具", mood: "午夜冷淡、充满空气感、微光暗色" } },
    { label: "热量记录仪", values: { app_type: "每日无痛卡路里计数器", mood: "莫兰迪橄榄绿、温馨木质感、圆润呼吸感" } },
  ],
  copywriter: [
    { label: "椰子水种草", values: { product: "100%纯天然无添加冷榨椰子水", target_audience: "注重控糖与户外运动健身的年轻白领" } },
    { label: "护腕机械键盘", values: { product: "人体工学静音红轴机械键盘", target_audience: "长期伏案、手腕酸痛的高频码字程序员" } },
  ],
  meeting_facilitator: [
    { label: "季度绩效会", values: { raw_notes: "今天我们组开会讨论了第二季度绩效和新系统迁移。老王说数据库迁移有点悬，需要开发小李这周五前配合做表结构迁移测试。然后小张提到前端组件库要升级到 React 18，这需要大约3天。老板最后说大方向不变，7月10号必须全量发布，下周二下午两点做预演。" } },
    { label: "产品评审会", values: { raw_notes: "产品评审：新首页要加推荐流，设计说下周出稿，研发说至少两周，运营希望月底上线配合大促。结论先做MVP，负责人小陈，下周五再看进度。" } },
  ],
  api_designer: [
    { label: "亲子打卡系统", values: { feature_desc: "一个亲子活动平台的用户发起挑战、打卡记录、以及好友点赞交互系统" } },
    { label: "图书借还", values: { feature_desc: "在线图书租赁系统的书籍借还和评价管理" } },
  ],
  habit_builder: [
    { label: "每天学英语", values: { habit: "每天坚持学习英语半小时" } },
    { label: "早起晨跑", values: { habit: "每天早上6点起床并慢跑20分钟" } },
  ],
  seo_article_writer: [
    { label: "AI 入门长文", values: { topic: "2026年零基础入门大语言模型开发与个人生产力飞跃路线图", keywords: "AI开发入门, 零基础AI教程, 程序员大模型工具, 智能提效" } },
    { label: "人体工学椅", values: { topic: "如何选购适合程序员的人体工学椅", keywords: "人体工学椅推荐, 护腰椅子, 程序员办公椅" } },
  ],
};

function toApiMessages(msgs: { role: string; text: string }[]) {
  return msgs.map((m) => ({ role: m.role, text: m.text }));
}

export function AgentChat({ agent, onBack, onShare }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [configSummary, setConfigSummary] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // First turn is sent to the model but not shown as a user bubble
  const seedPromptRef = useRef<string | null>(null);

  const handleCopyTranscript = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map((msg) => `**[${msg.role === "user" ? "用户" : agent.name}]** (${msg.timestamp}):\n${msg.text}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(transcript);
    alert("对话内容已复制到剪贴板");
  };

  const handleDownloadTranscript = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .map((msg) => `**[${msg.role === "user" ? "用户" : agent.name}]** (${msg.timestamp}):\n${msg.text}`)
      .join("\n\n---\n\n");
    const blob = new Blob([`# ${agent.name} 会话记录\n\n${transcript}`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${agent.name}_会话记录_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const buildApiHistory = (visible: ChatMessage[]) => {
    const seed = seedPromptRef.current;
    const visibleApi = toApiMessages(visible);
    return seed ? [{ role: "user", text: seed }, ...visibleApi] : visibleApi;
  };

  const appendStreamingReply = async (apiHistory: { role: string; text: string }[]) => {
    const modelMsgId = Math.random().toString(36).substring(7);
    const modelMsg: ChatMessage = {
      id: modelMsgId,
      role: "model",
      text: "",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, modelMsg]);

    await streamAgentChat(
      {
        agentId: agent.id,
        ...(agent.isCustom
          ? {
              systemInstruction: agent.systemInstruction,
              temperature: agent.temperature || 0.7,
            }
          : {}),
        messages: apiHistory,
      },
      (partial) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === modelMsgId ? { ...m, text: partial } : m)),
        );
      },
    );
  };

  const handleRegenerate = async () => {
    if (messages.length < 1 || isLoading) return;
    const lastUserMsgIndex = [...messages].reverse().findIndex((m) => m.role === "user");

    // Only seed + model replies (no visible user msgs yet)
    if (lastUserMsgIndex === -1) {
      if (!seedPromptRef.current) return;
      setMessages([]);
      setIsLoading(true);
      setError(null);
      try {
        await appendStreamingReply([{ role: "user", text: seedPromptRef.current }]);
      } catch (err: any) {
        setError(err.message || "发送失败，请稍后重试。");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const actualUserIndex = messages.length - 1 - lastUserMsgIndex;
    const historyUpToUser = messages.slice(0, actualUserIndex + 1);

    setMessages(historyUpToUser);
    setIsLoading(true);
    setError(null);

    try {
      await appendStreamingReply(buildApiHistory(historyUpToUser));
    } catch (err: any) {
      setError(err.message || "发送失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const defaultVars: Record<string, string> = {};
    if (agent.variables) {
      agent.variables.forEach((v) => {
        defaultVars[v.name] = v.defaultValue || "";
      });
    }
    setVariables(defaultVars);
    setMessages([]);
    setSessionStarted(false);
    setError(null);
    setConfigSummary(null);
    seedPromptRef.current = null;
  }, [agent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleVariableChange = (name: string, value: string) => {
    setVariables((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartSession = async () => {
    setError(null);
    setIsLoading(true);
    setSessionStarted(true);

    let initialPrompt = "";
    const summaryParts: string[] = [];
    if (agent.variables && agent.variables.length > 0) {
      initialPrompt += `请根据以下配置开始处理任务：\n`;
      agent.variables.forEach((v) => {
        const val = variables[v.name] || v.defaultValue || "未设置";
        initialPrompt += `- ${v.label}: ${val}\n`;
        summaryParts.push(`${v.label}：${val}`);
      });
      initialPrompt += `\n请直接开始生成或处理。`;
    } else {
      initialPrompt = `你好，我已准备好，请开始协助我。`;
    }

    seedPromptRef.current = initialPrompt;
    setConfigSummary(summaryParts.length ? summaryParts.join(" · ") : null);
    setMessages([]);

    try {
      await appendStreamingReply([{ role: "user", text: initialPrompt }]);

      await fetch("/api/community/interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "agent", id: agent.id, action: "run" }),
      });
    } catch (err: any) {
      setError(err.message || "请求失败，请检查网络后重试。");
      setSessionStarted(false);
      seedPromptRef.current = null;
      setConfigSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const textToSend = inputText;
    setInputText("");
    setError(null);

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      await appendStreamingReply(buildApiHistory(updatedMessages));
    } catch (err: any) {
      setError(err.message || "发送失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setSessionStarted(false);
    setError(null);
    setConfigSummary(null);
    seedPromptRef.current = null;
  };

  const hasVariables = agent.variables && agent.variables.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:flex-row gap-6">
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-stone-200 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-2xl ">
              {agent.avatar}
            </div>
            <div>
              <h3 className="font-display font-bold text-stone-900 tracking-wide text-lg">{agent.name}</h3>
              <p className="text-xs text-stone-500">{categoryLabel(agent.category)}</p>
            </div>
          </div>

          <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200">
            {agent.description}
          </p>

          <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
            <span>{agent.author || "社区"}</span>
            <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
              {categoryLabel(agent.category)}
            </span>
          </div>

          {onShare && !agent.isCustom && (
            <button
              onClick={() => onShare(agent)}
              className="mt-2 text-xs text-center py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300/60 rounded-lg text-stone-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Link2 className="w-3.5 h-3.5" />
              生成我的专属链接
            </button>
          )}
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-stone-200 flex flex-col flex-1 gap-4 overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            <Sliders className="w-4 h-4 text-stone-600" />
            <h4 className="font-display font-semibold text-sm text-stone-800">参数配置</h4>
          </div>

          {!sessionStarted ? (
            <div className="flex flex-col gap-4 flex-1">
              {hasVariables ? (
                agent.variables?.map((v) => (
                  <div key={v.name} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-700">{v.label}</label>
                    {v.name === "situation" ||
                    v.name === "raw_draft" ||
                    v.name === "code" ||
                    v.name === "bullets" ||
                    v.name === "ingredients" ||
                    v.name === "raw_notes" ||
                    v.name === "feature_desc" ? (
                      <textarea
                        value={variables[v.name] || ""}
                        onChange={(e) => handleVariableChange(v.name, e.target.value)}
                        placeholder={v.placeholder}
                        className="w-full bg-white border border-stone-200 hover:border-stone-300 focus:border-orange-600 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600/20 transition-all resize-none h-24"
                      />
                    ) : (
                      <input
                        type="text"
                        value={variables[v.name] || ""}
                        onChange={(e) => handleVariableChange(v.name, e.target.value)}
                        placeholder={v.placeholder}
                        className="w-full bg-white border border-stone-200 hover:border-stone-300 focus:border-orange-600 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600/20 transition-all"
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-stone-500 text-center py-8">
                  无需额外参数，直接开始对话即可。
                </div>
              )}

              {agentPresets[agent.id] && (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-stone-200">
                  <span className="text-[10px] text-stone-500">快捷填充示例</span>
                  <div className="flex flex-wrap gap-1.5">
                    {agentPresets[agent.id].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setVariables((prev) => ({ ...prev, ...p.values }))}
                        className="text-[10px] bg-stone-100 hover:bg-stone-200 border border-stone-200 hover:border-stone-300 text-stone-700 px-2.5 py-1 rounded-lg transition-all text-left truncate max-w-full cursor-pointer"
                        title={p.label}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleStartSession}
                disabled={isLoading}
                className="w-full py-2.5 mt-auto rounded-xl btn-primary text-white font-semibold text-sm flex items-center justify-center gap-2  transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isLoading ? "正在准备…" : "开始对话"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 justify-center items-center h-full text-center py-6">
              <CheckCircle className="w-10 h-10 text-stone-600" />
              <div>
                <p className="text-sm font-semibold text-stone-800">对话进行中</p>
                <p className="text-xs text-stone-500 mt-1.5 px-2">
                  {configSummary || "可继续追问或补充要求"}
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full mt-4 py-2 bg-stone-100 border border-stone-200 hover:bg-stone-200 rounded-xl text-xs font-semibold text-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                重新配置参数
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl border border-stone-200 flex flex-col h-full overflow-hidden relative">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-white/20">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sessionStarted ? "bg-orange-500" : "bg-stone-400"}`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${sessionStarted ? "bg-orange-600" : "bg-stone-500"}`}
              ></span>
            </span>
            <span className="text-xs font-semibold text-stone-800 tracking-wide font-display">对话</span>
          </div>
          <div className="flex items-center gap-2">
            {sessionStarted && messages.length > 0 && (
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  onClick={handleCopyTranscript}
                  title="复制全部对话"
                  className="p-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制</span>
                </button>
                <button
                  onClick={handleDownloadTranscript}
                  title="导出为 Markdown"
                  className="p-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg text-stone-700 hover:text-stone-900 transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出</span>
                </button>
              </div>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="text-xs px-3 py-1 bg-stone-100 border border-stone-200 hover:bg-stone-200 rounded-lg text-stone-700 transition-all cursor-pointer"
              >
                返回
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white/10">
          {!sessionStarted ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">
                <Bot className="w-8 h-8 text-orange-700" />
              </div>
              <div>
                <h4 className="font-display font-bold text-stone-800">准备开始</h4>
                <p className="text-xs text-stone-500 leading-relaxed mt-1.5">
                  左侧填好参数（或点快捷示例），再点<span className="text-orange-700">开始对话</span>
                  ，就会按这个智能体的规则直接给你结果。
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {configSummary && (
                <div className="text-[11px] text-stone-500 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                  已应用配置：{configSummary}
                </div>
              )}
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-md shrink-0 shadow-inner">
                        {agent.avatar}
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        isUser
                          ? "bg-stone-100 border border-stone-200 text-stone-800 rounded-tr-none"
                          : "bg-white border border-stone-200 text-stone-800 rounded-tl-none leading-relaxed"
                      }`}
                    >
                      {isUser ? <div className="text-sm whitespace-pre-wrap">{msg.text}</div> : <Markdown content={msg.text} />}
                      <div className="text-[10px] text-stone-500 text-right mt-1.5">{msg.timestamp}</div>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center text-sm shrink-0 shadow-inner">
                        <User className="w-4 h-4 text-stone-600" />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3.5 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-md shrink-0 animate-pulse">
                    {agent.avatar}
                  </div>
                  <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-3">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-stone-500">AI 正在回复…</span>
                  </div>
                </div>
              )}

              {isLoading && messages.length === 0 && (
                <div className="flex gap-3.5 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-md shrink-0 animate-pulse">
                    {agent.avatar}
                  </div>
                  <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-3">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-stone-500">AI 正在回复…</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 border-t border-red-200 px-5 py-2.5 flex items-center gap-2 text-xs text-red-700"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {sessionStarted && messages.length >= 1 && !isLoading && messages[messages.length - 1].role === "model" && (
          <div className="px-4 py-1.5 bg-stone-50 border-t border-stone-200 flex justify-end">
            <button
              type="button"
              onClick={handleRegenerate}
              className="text-[10px] text-stone-500 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              重新生成
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="p-4 border-t border-stone-200 flex gap-3 bg-white/30">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!sessionStarted || isLoading}
            placeholder={sessionStarted ? "继续追问或补充要求…" : "请先在左侧开始对话"}
            className="flex-1 bg-white border border-stone-200 hover:border-stone-300 focus:border-orange-600 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600/20 disabled:opacity-40 transition-all"
          />
          <button
            type="submit"
            disabled={!sessionStarted || isLoading || !inputText.trim()}
            className="p-2.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white shadow-md disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

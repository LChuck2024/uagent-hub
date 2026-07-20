import React, { useState } from "react";
import { Agent, AgentCategory, AgentVariable, Workflow, WorkflowStep, WorkflowTriggerInput } from "../types";
import { Sparkles, Bot, Zap, Plus, Trash2, ArrowRight, Check, Eye, HelpCircle } from "lucide-react";

interface CustomCreatorProps {
  onCreated: (type: "agent" | "workflow", resource: any) => void;
  onCancel: () => void;
}

export function CustomCreator({ onCreated, onCancel }: CustomCreatorProps) {
  const [activeTab, setActiveTab] = useState<"agent" | "workflow">("agent");

  // Custom Agent states
  const [agentName, setAgentName] = useState("");
  const [agentDesc, setAgentDesc] = useState("");
  const [agentCategory, setAgentCategory] = useState<AgentCategory>("parenting");
  const [agentAvatar, setAgentAvatar] = useState("🤖");
  const [agentPrompt, setAgentPrompt] = useState("");
  const [agentTemp, setAgentTemp] = useState(0.7);
  const [agentVars, setAgentVars] = useState<AgentVariable[]>([
    { name: "input_data", label: "主要输入", placeholder: "请输入协助内容..." }
  ]);

  // Custom Workflow states
  const [wfName, setWfName] = useState("");
  const [wfDesc, setWfDesc] = useState("");
  const [wfCategory, setWfCategory] = useState<AgentCategory>("parenting");
  const [wfTriggers, setWfTriggers] = useState<WorkflowTriggerInput[]>([
    { name: "user_input", label: "初始需求", placeholder: "请输入您的初始要求或主题..." }
  ]);
  const [wfSteps, setWfSteps] = useState<WorkflowStep[]>([
    {
      id: "step_1",
      name: "智能生成第一阶段",
      type: "ai_generate",
      promptTemplate: "请根据用户输入的 {{trigger.user_input}}，开始生成一份高水准的内容纲要，并包含深度分析。",
      systemInstruction: "你是一个极其严谨专业的智能AI助手。",
      outputVarName: "step1_output"
    }
  ]);

  // Agent Variable handlers
  const addAgentVar = () => {
    const defaultName = `var_${agentVars.length + 1}`;
    setAgentVars(prev => [...prev, { name: defaultName, label: "自定义变量名", placeholder: "请输入您的内容..." }]);
  };

  const removeAgentVar = (idx: number) => {
    setAgentVars(prev => prev.filter((_, i) => i !== idx));
  };

  const updateAgentVar = (idx: number, key: keyof AgentVariable, val: string) => {
    setAgentVars(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: val };
      return copy;
    });
  };

  // Workflow Trigger handlers
  const addWfTrigger = () => {
    const defaultName = `input_${wfTriggers.length + 1}`;
    setWfTriggers(prev => [...prev, { name: defaultName, label: "新增输入项", placeholder: "请输入属性值..." }]);
  };

  const removeWfTrigger = (idx: number) => {
    setWfTriggers(prev => prev.filter((_, i) => i !== idx));
  };

  const updateWfTrigger = (idx: number, key: keyof WorkflowTriggerInput, val: string) => {
    setWfTriggers(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: val };
      return copy;
    });
  };

  // Workflow Step handlers
  const addWfStep = () => {
    const stepIdx = wfSteps.length + 1;
    const defaultId = `step_${stepIdx}`;
    const defaultVarName = `step${stepIdx}_output`;
    setWfSteps(prev => [...prev, {
      id: defaultId,
      name: `智能处理第 ${stepIdx} 阶段`,
      type: "ai_transform",
      promptTemplate: `请参考上个步骤的产出：\n{{step_${stepIdx - 1}_output}}\n\n在此基础上，进行深度提炼并输出。`,
      systemInstruction: "你是一个资深的语言精炼大师。",
      outputVarName: defaultVarName
    }]);
  };

  const removeWfStep = (idx: number) => {
    setWfSteps(prev => prev.filter((_, i) => i !== idx));
  };

  const updateWfStep = (idx: number, key: keyof WorkflowStep, val: any) => {
    setWfSteps(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: val };
      return copy;
    });
  };

  const handleSaveAgent = () => {
    if (!agentName.trim() || !agentPrompt.trim()) {
      alert("请完整填写智能体名称与系统提示指令。");
      return;
    }

    const uniqueId = `custom_agent_${Date.now()}`;
    const newAgent: Agent = {
      id: uniqueId,
      name: agentName,
      description: agentDesc || "自定义大模型微调智能体",
      category: agentCategory,
      avatar: agentAvatar,
      systemInstruction: agentPrompt,
      temperature: Number(agentTemp),
      variables: agentVars.filter(v => v.name.trim()),
      isCustom: true,
      author: "我",
      likes: 0,
      runs: 0
    };

    onCreated("agent", newAgent);
  };

  const handleSaveWorkflow = () => {
    if (!wfName.trim() || wfSteps.length === 0) {
      alert("请完整填写工作流名称并添加至少一个处理步骤。");
      return;
    }

    const uniqueId = `custom_wf_${Date.now()}`;
    const newWorkflow: Workflow = {
      id: uniqueId,
      name: wfName,
      description: wfDesc || "自定义智能多轨自动化流",
      category: wfCategory,
      triggerInputs: wfTriggers.filter(t => t.name.trim()),
      steps: wfSteps.map(step => ({
        ...step,
        outputVarName: step.outputVarName || `${step.id}_output`
      })),
      isCustom: true,
      author: "我",
      likes: 0,
      runs: 0
    };

    onCreated("workflow", newWorkflow);
  };

  const avatarPresets = ["🤖", "🌙", "✈️", "💼", "💻", "🍳", "🧠", "🎨", "📈", "🩺", "⚡", "🌟", "🔥", "🪐"];

  return (
    <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-stone-200 flex flex-col gap-6 max-w-4xl mx-auto my-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200 pb-5">
        <div>
          <h2 className="font-display font-bold text-xl text-stone-900 tracking-wide flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-stone-600" />
            自定义设计总线
          </h2>
          <p className="text-xs text-stone-500 mt-1">创建您自己专属的AI Agent人格或多维度串联的大模型工作流。</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-stone-200 shrink-0">
          <button
            onClick={() => setActiveTab("agent")}
            className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "agent"
                ? "bg-orange-700 text-white shadow-inner"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Bot className="w-4 h-4" />
            设计专属智能体
          </button>
          <button
            onClick={() => setActiveTab("workflow")}
            className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "workflow"
                ? "bg-stone-800 text-white shadow-inner"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Zap className="w-4 h-4" />
            编排自动化工作流
          </button>
        </div>
      </div>

      {activeTab === "agent" ? (
        /* Agent Wizard Form */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">智能体名称</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="例如: 日语情景对话私教"
                className="w-full bg-white border border-stone-200 hover:border-stone-300 focus:border-orange-600 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">智能体简介</label>
              <textarea
                value={agentDesc}
                onChange={(e) => setAgentDesc(e.target.value)}
                placeholder="简短描述智能体的用途和核心能力"
                className="w-full bg-white border border-stone-200 hover:border-stone-300 focus:border-orange-600 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600/20 transition-all resize-none h-16"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">行业品类归属</label>
                <select
                  value={agentCategory}
                  onChange={(e) => setAgentCategory(e.target.value as AgentCategory)}
                  className="w-full bg-white border border-stone-200 hover:border-stone-300 focus:border-orange-600 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600/20 transition-all"
                >
                  <option value="parenting">亲子成长</option>
                  <option value="travel">全球旅游</option>
                  <option value="office">高效办公</option>
                  <option value="programming">极客编程</option>
                  <option value="life">生活助手</option>
                  <option value="finance">金融理财</option>
                  <option value="design">创意设计</option>
                  <option value="marketing">文案营销</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">创造温度 (Temperature)</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={agentTemp}
                  onChange={(e) => setAgentTemp(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>严谨精确 ({agentTemp})</span>
                  <span>创意无限</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">形象图标 / 徽章</label>
              <div className="flex flex-wrap gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                {avatarPresets.map(preset => (
                  <button
                    key={preset}
                    onClick={() => setAgentAvatar(preset)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${
                      agentAvatar === preset
                        ? "bg-orange-700/30 border border-orange-600 text-orange-900"
                        : "hover:bg-stone-100 border border-transparent text-stone-500"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompt Tuning & Variables */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-stone-700">系统提示词 (System Instruction)</label>
                <span className="text-[10px] text-stone-500">极其重要：限制AI行为与人格</span>
              </div>
              <textarea
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                placeholder="例如: 你是一位极其温柔、发音纯正的日语私教老师。你的语气很可爱，喜欢在句尾加上 'ね'。你需要对用户的输入进行纠错、提供日语罗马音发音，并给出一个实用的跟读短句..."
                className="w-full bg-white border border-stone-200 hover:border-stone-300 focus:border-orange-600 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600/20 transition-all resize-none h-28"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center border-t border-stone-200 pt-3">
                <label className="text-xs font-semibold text-stone-700">定义智能体变量</label>
                <button
                  onClick={addAgentVar}
                  className="text-[11px] text-orange-700 hover:text-orange-800 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> 增加变量
                </button>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {agentVars.map((v, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => updateAgentVar(idx, "name", e.target.value)}
                      placeholder="变量名(英文)"
                      className="w-1/4 bg-stone-100 border border-stone-200 rounded px-2 py-1 text-[11px] text-stone-900"
                    />
                    <input
                      type="text"
                      value={v.label}
                      onChange={(e) => updateAgentVar(idx, "label", e.target.value)}
                      placeholder="表单标签"
                      className="w-1/3 bg-stone-100 border border-stone-200 rounded px-2 py-1 text-[11px] text-stone-900"
                    />
                    <input
                      type="text"
                      value={v.placeholder || ""}
                      onChange={(e) => updateAgentVar(idx, "placeholder", e.target.value)}
                      placeholder="占位提示"
                      className="flex-1 bg-stone-100 border border-stone-200 rounded px-2 py-1 text-[11px] text-stone-900"
                    />
                    <button
                      onClick={() => removeAgentVar(idx)}
                      className="text-red-400 hover:text-red-300 cursor-pointer p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Workflow Compiler Wizard */
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700">自动化工作流名称</label>
              <input
                type="text"
                value={wfName}
                onChange={(e) => setWfName(e.target.value)}
                placeholder="例如: 英语文章润色与推特卡片制作流"
                className="w-full bg-white border border-stone-200 hover:border-stone-300 focus:border-orange-600 rounded-xl px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">品类归属</label>
                <select
                  value={wfCategory}
                  onChange={(e) => setWfCategory(e.target.value as AgentCategory)}
                  className="w-full bg-white border border-stone-200 hover:border-stone-300 focus:border-orange-600 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600/20 transition-all"
                >
                  <option value="parenting">亲子成长</option>
                  <option value="travel">全球旅游</option>
                  <option value="office">高效办公</option>
                  <option value="programming">极客编程</option>
                  <option value="life">生活助手</option>
                  <option value="finance">金融理财</option>
                  <option value="design">创意设计</option>
                  <option value="marketing">文案营销</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-700">工作流描述</label>
                <input
                  type="text"
                  value={wfDesc}
                  onChange={(e) => setWfDesc(e.target.value)}
                  placeholder="一句简短的工作流效果总结"
                  className="w-full bg-white border border-stone-200 hover:border-stone-300 focus:border-orange-600 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Step 1: Initial Trigger Inputs Setup */}
          <div className="flex flex-col gap-2 border-t border-stone-200 pt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <h4 className="text-xs font-semibold text-stone-800">第一步：配置初始触发参数 (Trigger Inputs)</h4>
              </div>
              <button
                onClick={addWfTrigger}
                className="text-[11px] text-stone-600 hover:text-stone-700 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> 增加触发变量
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {wfTriggers.map((t, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <div className="text-[10px] text-stone-500 font-mono">Var:</div>
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => updateWfTrigger(idx, "name", e.target.value)}
                    placeholder="变量名"
                    className="w-1/4 bg-stone-100 border border-stone-200 rounded px-2 py-0.5 text-[11px] text-stone-900"
                  />
                  <input
                    type="text"
                    value={t.label}
                    onChange={(e) => updateWfTrigger(idx, "label", e.target.value)}
                    placeholder="表单标语"
                    className="w-1/3 bg-stone-100 border border-stone-200 rounded px-2 py-0.5 text-[11px] text-stone-900"
                  />
                  <input
                    type="text"
                    value={t.placeholder || ""}
                    onChange={(e) => updateWfTrigger(idx, "placeholder", e.target.value)}
                    placeholder="默认占位提示"
                    className="flex-1 bg-stone-100 border border-stone-200 rounded px-2 py-0.5 text-[11px] text-stone-900"
                  />
                  <button
                    onClick={() => removeWfTrigger(idx)}
                    className="text-red-400 hover:text-red-300 cursor-pointer p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Sequential Multi-steps Construction */}
          <div className="flex flex-col gap-4 border-t border-stone-200 pt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <h4 className="text-xs font-semibold text-stone-800">第二步：排布大模型顺序推理步骤 (AI Steps)</h4>
              </div>
              <button
                onClick={addWfStep}
                className="text-[11px] text-orange-700 hover:text-orange-800 flex items-center gap-0.5 cursor-pointer bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> 追加顺序处理步骤
              </button>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {wfSteps.map((step, idx) => (
                <div key={idx} className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col gap-3 relative">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="text-[10px] bg-stone-100 px-2 py-0.5 border border-stone-200 rounded text-stone-500 font-mono">
                      步骤 ID: {step.id}
                    </span>
                    <button
                      onClick={() => removeWfStep(idx)}
                      className="text-red-400 hover:text-red-300 cursor-pointer p-1 bg-red-950/10 border border-red-900/10 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 w-[80%]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-stone-500">步骤名称</span>
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => updateWfStep(idx, "name", e.target.value)}
                        className="bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-900"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-stone-500">步骤行为 (AIGC Type)</span>
                      <select
                        value={step.type}
                        onChange={(e) => updateWfStep(idx, "type", e.target.value)}
                        className="bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-900"
                      >
                        <option value="ai_generate">模型生成 (Generate)</option>
                        <option value="ai_transform">语义提炼 (Transform)</option>
                        <option value="ai_translate">翻译对接 (Translate)</option>
                        <option value="ai_format">格式编排 (Format)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-stone-500">
                        输出变量名 <span className="text-[9px] text-stone-500">(可被后续步骤引用)</span>
                      </span>
                      <input
                        type="text"
                        value={step.outputVarName}
                        onChange={(e) => updateWfStep(idx, "outputVarName", e.target.value)}
                        className="bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-orange-700 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-stone-500">
                          提示词模板 (Prompt Template)
                        </span>
                        <span className="text-stone-500 font-mono">
                          引参语法: {`{{trigger.var}}`} 或 {`{{step_1_output}}`}
                        </span>
                      </div>
                      <textarea
                        value={step.promptTemplate}
                        onChange={(e) => updateWfStep(idx, "promptTemplate", e.target.value)}
                        placeholder="例如: 请翻译以下上一步生成的内容：\n{{step1_output}}"
                        className="bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 resize-none h-18"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-stone-500">
                        系统约束 (System Instruction - 可选)
                      </span>
                      <textarea
                        value={step.systemInstruction || ""}
                        onChange={(e) => updateWfStep(idx, "systemInstruction", e.target.value)}
                        placeholder="限定该步骤大模型的人格和输出规范"
                        className="bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 resize-none h-18"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Buttons Action */}
      <div className="flex justify-end gap-3 border-t border-stone-200 pt-5">
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-xl bg-stone-100 border border-stone-200 hover:bg-stone-200 text-xs text-stone-700 font-semibold transition-all cursor-pointer"
        >
          取消
        </button>
        <button
          onClick={activeTab === "agent" ? handleSaveAgent : handleSaveWorkflow}
          className="px-6 py-2 rounded-xl btn-primary text-white text-xs font-semibold  transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>确认发布并共享到社区</span>
        </button>
      </div>
    </div>
  );
}

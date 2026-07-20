import React, { useState, useEffect } from "react";
import { Sparkles, Trophy, CheckCircle, HelpCircle, ArrowRight, Smile, X, Zap, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Agent, Workflow } from "../types";

interface ChallengeItem {
  id: number;
  name: string;
  category: "A" | "B" | "C";
  desc: string;
  recommendAge: string;
  linkedResource?: {
    type: "agent" | "workflow";
    id: string;
    variables?: Record<string, string>;
  };
}

const challengeData: ChallengeItem[] = [
  // A. 入门兴趣
  {
    id: 1,
    name: "AI 编一个睡前故事",
    category: "A",
    desc: "输入孩子喜欢的角色（比如爱唱歌的小恐龙），即时生成一段温馨治愈的睡前童话。",
    recommendAge: "3-8岁",
    linkedResource: { type: "agent", id: "baby_sleep", variables: { theme: "爱唱歌的小恐龙寻找失落的星星" } }
  },
  {
    id: 2,
    name: "AI 把口述变成童话",
    category: "A",
    desc: "记录孩子随口说的几句脑洞，让 AI 扩写成情节完整、寓意深远的魔法故事。",
    recommendAge: "4-10岁",
    linkedResource: { type: "agent", id: "baby_sleep" }
  },
  {
    id: 3,
    name: "AI 生成 “我的一天” 漫画",
    category: "A",
    desc: "把孩子今天经历的趣事写成剧本分镜，由 AI 规划画面镜头、角色性格和提示词大纲。",
    recommendAge: "5-12岁"
  },
  {
    id: 4,
    name: "AI 设计虚拟宠物",
    category: "A",
    desc: "描述一个幻想中的神奇生物（如‘棉花糖质感的独角猫’），设计它的性格、技能和喜好卡片。",
    recommendAge: "5-10岁"
  },
  {
    id: 5,
    name: "AI 起 10 个趣味作文标题",
    category: "A",
    desc: "输入孩子抗拒的普通写作题目，让 AI 改写为 10 个富有好奇心、侦探感或魔法风的趣味标题。",
    recommendAge: "6-12岁"
  },
  {
    id: 6,
    name: "AI 策划生日派对",
    category: "A",
    desc: "根据孩子期望的梦幻主题（如海底探险、恐龙复活），一键设计游戏、菜单和邀请函大纲。",
    recommendAge: "5-12岁"
  },
  {
    id: 7,
    name: "AI 当英语外教陪聊",
    category: "A",
    desc: "模拟一个温柔纯正的英文外教，和孩子用中英双语慢速畅聊他们最爱的动画片、乐高或运动。",
    recommendAge: "6-15岁"
  },
  {
    id: 8,
    name: "AI 出 20 道口算题并批改",
    category: "A",
    desc: "定制出符合孩子当前难度的趣味口算关卡（融入太空夺宝等背景），由 AI 担任高情商助教。",
    recommendAge: "5-9岁"
  },
  {
    id: 9,
    name: "AI 写一封给未来自己的信",
    category: "A",
    desc: "引导孩子说出对十年后的憧憬，由 AI 润色为一封温情满满、字字珠玑的时光慢递信件。",
    recommendAge: "7-15岁"
  },
  {
    id: 10,
    name: "AI 模拟动物对话",
    category: "A",
    desc: "让 AI 模拟树懒、霸王龙或帝企鹅的语气 and 知识库，由孩子连环提问，探索大自然的奥秘。",
    recommendAge: "4-10岁"
  },
  // B. 轻量作品
  {
    id: 11,
    name: "AI 生成 6 页绘本",
    category: "B",
    desc: "亲子共创故事大纲，分步骤提炼 6 个经典场景的文字与画面提示词，制作一本专属实体绘本雏形。",
    recommendAge: "6-12岁"
  },
  {
    id: 12,
    name: "AI 做学习闯关地图",
    category: "B",
    desc: "输入本周的学习目标（如英语单词或乘法表），由 AI 将其变身为主题闯关冒险地图与通关秘籍。",
    recommendAge: "6-11岁"
  },
  {
    id: 13,
    name: "AI 做个人海报简历",
    category: "B",
    desc: "挖掘孩子的性格闪光点和业余爱好（如乐高专家），设计一份自信、充满趣味的个人海报展示简历。",
    recommendAge: "6-15岁"
  },
  {
    id: 14,
    name: "AI 生成成语小游戏卡牌",
    category: "B",
    desc: "给经典成语加上搞笑日常剧情或反向脑筋急转弯，制作实体卡牌卡片进行家庭接龙PK。",
    recommendAge: "7-12岁"
  },
  {
    id: 15,
    name: "AI 做每日学习计划生成器",
    category: "B",
    desc: "输入孩子一天的功课任务与娱乐心愿，由 AI 科学调度生成松弛有度、高效率的‘黄金时间表’。",
    recommendAge: "7-14岁"
  },
  {
    id: 16,
    name: "AI 设计校园冒险游戏规则",
    category: "B",
    desc: "发挥孩子无穷的奇思妙想，设计一款以自己学校或小区为背景的实景桌游或密室逃脱规则书。",
    recommendAge: "8-15岁"
  },
  {
    id: 17,
    name: "AI 写 1 分钟科普视频脚本",
    category: "B",
    desc: "孩子选择好奇的世界常识（如为什么会打雷），AI 编写成幽默风趣、画面感十足的简短科普短视频脚本。",
    recommendAge: "8-14岁"
  },
  {
    id: 18,
    name: "AI 当错题讲解老师",
    category: "B",
    desc: "绝不直接给答案！让 AI 扮演启发式的苏格拉底老师，一步步通过引导提问让孩子自己找到逻辑漏洞。",
    recommendAge: "7-15岁"
  },
  {
    id: 19,
    name: "AI 做 “我的理想职业” PPT",
    category: "B",
    desc: "探索孩子脑海中对未来的无限幻想（如太空农业学家），由 AI 细化提炼为 5 页完整的演讲与展示大纲。",
    recommendAge: "8-15岁"
  },
  {
    id: 20,
    name: "AI 做家庭旅行计划书",
    category: "B",
    desc: "亲子一起商量出行想法，由 AI 深度定制一份完美避开人潮、兼顾孩子趣味与人文底蕴的夏日度假计划书。",
    recommendAge: "5-15岁",
    linkedResource: { type: "workflow", id: "travel_planner_translation" }
  },
  // C. 进阶项目
  {
    id: 21,
    name: "AI 设计 A3 桌游地图",
    category: "C",
    desc: "亲子共创大富翁或格斗通关机制，AI 规划各个网格的踩坑事件与惩罚机制，绘制在一张 A3 纸上。",
    recommendAge: "8-15岁"
  },
  {
    id: 22,
    name: "AI 做家庭学习积分系统",
    category: "C",
    desc: "设计一套家庭版‘代币系统’，输入每日好习惯（如整理书桌、按时睡觉）的积分比率和奖品兑换合同。",
    recommendAge: "6-15岁"
  },
  {
    id: 23,
    name: "AI 生成数学闯关题库",
    category: "C",
    desc: "将枯燥的公式定理设计为一连串故事连贯的场景（如霍格沃茨魔法防御战），让孩子在破译密码中做完算术。",
    recommendAge: "8-14岁"
  },
  {
    id: 24,
    name: "AI 做神话角色卡牌系统",
    category: "C",
    desc: "提取西游记或山海经中的仙魔神兽，设计战力数值（HP、力量、特殊技能），打印成定制对战实体牌。",
    recommendAge: "7-15岁"
  },
  {
    id: 25,
    name: "AI 搭建全科学习规划 Agent",
    category: "C",
    desc: "输入孩子期望克服的弱势学科和提升目标，AI 拆解为周计划、每日微习惯与可视化进展图表表盘。",
    recommendAge: "9-15岁"
  },
  {
    id: 26,
    name: "AI 做英语对话剧本库",
    category: "C",
    desc: "模拟各种好玩的情景（如外星人偶遇恐龙），AI 编写 3 段搞笑趣味的纯正美式英语高频对话，供亲子角色对练。",
    recommendAge: "7-14岁"
  },
  {
    id: 27,
    name: "AI 生成语文写作思维导图",
    category: "C",
    desc: "输入半命题作文题目，AI 生成思维逻辑图，指引‘审题立意-凤头抓人-猪肚充实-豹尾点题’的整套破题思路。",
    recommendAge: "8-15岁"
  },
  {
    id: 28,
    name: "AI 制作完整短视频",
    category: "C",
    desc: "AI 拟定科普讲义脚本，孩子作为声优配音，再搭配 AI 生成的创意插画画面，合并剪辑成一集原创科普微电影。",
    recommendAge: "9-15岁"
  },
  {
    id: 29,
    name: "AI 做家庭学习助手",
    category: "C",
    desc: "设定专属指令规则，搭建一个解答十万个为什么的‘奇妙小百科’，用最童趣、幽默的打比方手法为孩子答疑解惑。",
    recommendAge: "6-15岁"
  },
  {
    id: 30,
    name: "AI 完成亲子 AI 黑客松项目",
    category: "C",
    desc: "在周末开启家庭 48 小时极客大作战！亲子配合使用 AI 在一两天内做出一个家庭主页、一首AI原创歌，或一部动画微电影！",
    recommendAge: "8-15岁"
  }
];

interface ParentChildChallengeProps {
  onSelectAgent: (agentId: string, initialVars?: Record<string, string>) => void;
  onSelectWorkflow: (workflowId: string, initialVars?: Record<string, string>) => void;
  allAgents: Agent[];
  allWorkflows: Workflow[];
}

export function ParentChildChallenge({
  onSelectAgent,
  onSelectWorkflow,
}: ParentChildChallengeProps) {
  const [completedList, setCompletedList] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "A" | "B" | "C">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load completed items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("parent_child_challenge_completed");
    if (saved) {
      try {
        setCompletedList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleComplete = (id: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    let next: number[];
    if (completedList.includes(id)) {
      next = completedList.filter(item => item !== id);
    } else {
      next = [...completedList, id];
    }
    setCompletedList(next);
    localStorage.setItem("parent_child_challenge_completed", JSON.stringify(next));
  };

  const handleLaunchItem = (item: ChallengeItem) => {
    if (item.linkedResource) {
      const res = item.linkedResource;
      if (res.type === "agent") {
        onSelectAgent(res.id, res.variables);
      } else {
        onSelectWorkflow(res.id, res.variables);
      }
    } else {
      // Open general parenting assistant with customized variables
      onSelectAgent("parent_child_mentor", {
        project_name: item.name,
        child_age: item.recommendAge
      });
    }
    setIsModalOpen(false); // Close modal on launch
  };

  const filteredItems = challengeData.filter(item => {
    if (activeTab === "all") return true;
    return item.category === activeTab;
  });

  const percent = Math.round((completedList.length / challengeData.length) * 100);

  // Curated 3 items to feature on the compact split banner (Item 1, 11, and 20)
  const compactFeaturedItems = challengeData.filter(item => [1, 11, 20].includes(item.id));

  return (
    <>
      {/* 1. COMPACT HOME/INLINE VIEW (Apple Store-Style Split Campaign Banner) */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 relative overflow-hidden backdrop-blur-sm shadow-sm">
        {/* Subtle decorative glowing backdrops */}
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-orange-50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-stone-100 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          {/* Left Column: Branding Campaign & Quick Action Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono bg-orange-50 text-orange-800 px-2.5 py-0.5 rounded border border-orange-200 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-orange-700 animate-pulse" />
                  🍉 暑期重磅特辑
                </span>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/20 font-bold">
                  作品导向 · 亲子共创
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-extrabold font-display tracking-tight text-stone-900">
                亲子 AI 暑期 30 日创客挑战营
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                带领孩子完成至少 <span className="text-stone-900 font-bold underline decoration-amber-400 decoration-2">1 个</span> 自研作品，帮助孩子跳出纯消费桎梏，拥抱 AI 时代的核心创造力。
              </p>
            </div>

            {/* Micro Progress Tracker & Launch Buttons */}
            <div className="space-y-3">
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-stone-500 flex items-center gap-1 font-bold">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" /> CHALLENGE MAP
                    </span>
                    <span className="text-amber-400 font-extrabold">
                      {completedList.length} / 30 关 ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-orange-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-orange-700 hover:bg-orange-600 text-white font-semibold text-xs px-3.5 py-2 rounded-lg  transition-all active:scale-95 cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <span>大地图 ({completedList.length}/30)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Curated Recommendations Carousel Grid */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3 border-t lg:border-t-0 lg:border-l border-stone-200 pt-4 lg:pt-0 lg:pl-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-extrabold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                ⭐ 今日精选入门推荐 (3/30)
              </span>
              <span className="text-[10px] text-stone-500 hidden md:inline font-mono">
                一键启动 ➜ 调起专属面板
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {compactFeaturedItems.map((item) => {
                const isCompleted = completedList.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleLaunchItem(item)}
                    className={`border rounded-xl p-3 flex flex-col justify-between space-y-2.5 transition-all relative overflow-hidden cursor-pointer hover:border-orange-600/50 hover:bg-stone-50 active:scale-[0.98] group ${
                      isCompleted
                        ? "bg-emerald-950/10 border-emerald-500/20"
                        : "bg-stone-50 border-stone-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                          item.category === "A" ? "bg-orange-50 border-orange-200 text-orange-800" :
                          item.category === "B" ? "bg-stone-100 border-stone-300 text-stone-700" :
                          "bg-emerald-950/40 border-emerald-800/40 text-emerald-300"
                        }`}>
                          #{String(item.id).padStart(2, "0")} · {
                            item.category === "A" ? "兴趣" :
                            item.category === "B" ? "实物" : "创客"
                          }
                        </span>
                        <button
                          onClick={(e) => toggleComplete(item.id, e)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                            isCompleted
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                              : "bg-stone-100 border-stone-200 text-stone-400 hover:text-stone-500"
                          }`}
                        >
                          <CheckCircle className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <h4 className={`font-display font-bold text-xs ${
                        isCompleted ? "text-stone-500 line-through" : "text-stone-900 group-hover:text-orange-800 transition-colors"
                      }`}>
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-stone-500 leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-stone-200/60 text-[9px]">
                      <span className="text-stone-500 font-mono">
                        👶 {item.recommendAge}
                      </span>
                      <span
                        className="text-orange-800 group-hover:text-stone-900 transition-colors font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>一键启动</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. OVERLAY MODAL VIEW (Full 30 Items Challenge Dashboard) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-white/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl w-full bg-stone-100 border border-stone-200 rounded-2xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-200 pb-6 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-orange-50 text-orange-800 px-2.5 py-0.5 rounded border border-orange-200 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-700" />
                      🍉 暑期特辑 · 全民亲子 AI 共创挑战大地图
                    </span>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30 font-bold">
                      通关式自学
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold font-display tracking-tight text-stone-900">
                    暑假必须带孩子做的 30 个亲子 AI 项目大挑战
                  </h2>
                  <p className="text-xs text-stone-500">
                    我们精心设计了 30 个覆盖各种场景的精美 AI 体验包。鼓励至少挑战完 <span className="text-stone-900 font-bold underline decoration-amber-400">1个项目</span> 产生属于孩子的首个作品。
                  </p>
                </div>

                {/* Progress bar in Modal */}
                <div className="bg-white border border-stone-200 p-4 rounded-xl min-w-[240px] flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-stone-500 font-bold flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500 animate-bounce" /> 暑期成就达成度
                    </span>
                    <span className="font-mono font-extrabold text-amber-400">
                      已通关 {completedList.length} / 30 项 ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                    <motion.div
                      className="bg-orange-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              </div>

              {/* Tab Filter buttons inside Modal */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-3 shrink-0">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer border ${
                    activeTab === "all"
                      ? "bg-orange-700 border-orange-600 text-white font-bold"
                      : "bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-800"
                  }`}
                >
                  全部 30 个项目 ({challengeData.length})
                </button>
                <button
                  onClick={() => setActiveTab("A")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer border flex items-center gap-1 ${
                    activeTab === "A"
                      ? "bg-orange-50 border-orange-200 text-orange-800 font-bold"
                      : "bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Smile className="w-3.5 h-3.5 text-orange-700" />
                  A. 入门兴趣阶段 (1-10)
                </button>
                <button
                  onClick={() => setActiveTab("B")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer border flex items-center gap-1 ${
                    activeTab === "B"
                      ? "bg-stone-100 border-stone-300 text-stone-700 font-bold"
                      : "bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-stone-600" />
                  B. 轻量作品阶段 (11-20)
                </button>
                <button
                  onClick={() => setActiveTab("C")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer border flex items-center gap-1 ${
                    activeTab === "C"
                      ? "bg-emerald-900/40 border-emerald-700/60 text-emerald-300 font-bold"
                      : "bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  C. 进阶大创客项目 (21-30)
                </button>
              </div>

              {/* Grid of Challenges inside Modal */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {filteredItems.map((item) => {
                      const isCompleted = completedList.includes(item.id);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => handleLaunchItem(item)}
                          className={`border rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all relative overflow-hidden cursor-pointer hover:border-orange-600/50 hover:bg-stone-50 active:scale-[0.99] group min-h-[180px] ${
                            isCompleted
                              ? "bg-stone-50 border-emerald-500/20 shadow-lg shadow-emerald-950/10"
                              : "bg-white/70 border-stone-200"
                          }`}
                        >
                          {isCompleted && (
                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                          )}

                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                                item.category === "A" ? "bg-orange-50 border-orange-200 text-orange-800" :
                                item.category === "B" ? "bg-stone-100 border-stone-300 text-stone-700" :
                                "bg-emerald-950/40 border-emerald-800/40 text-emerald-300"
                              }`}>
                                #{String(item.id).padStart(2, "0")} · {
                                  item.category === "A" ? "入门兴趣" :
                                  item.category === "B" ? "轻量作品" : "进阶探索"
                                }
                              </span>
                              
                              <button
                                onClick={(e) => toggleComplete(item.id, e)}
                                className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                                  isCompleted
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
                                    : "bg-stone-100 border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-500"
                                }`}
                              >
                                <CheckCircle className={`w-4 h-4 ${isCompleted ? "scale-105" : "scale-90"}`} />
                              </button>
                            </div>

                            <h3 className={`font-display font-extrabold text-sm tracking-wide transition-colors ${
                              isCompleted ? "text-stone-500 line-through" : "text-stone-900 group-hover:text-orange-800"
                            }`}>
                              {item.name}
                            </h3>

                            <p className="text-[11px] text-stone-500 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-stone-200/60 shrink-0">
                            <span className="text-[10px] font-mono text-stone-500 flex items-center gap-1 font-semibold">
                              👶 推荐段: <span className="text-stone-700">{item.recommendAge}</span>
                            </span>

                            <span
                              className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all font-bold ${
                                item.linkedResource
                                  ? "bg-orange-50 border-orange-200/60 text-orange-800 group-hover:bg-orange-100 group-hover:border-orange-300 group-hover:text-stone-900"
                                  : "bg-stone-100 border-stone-200 text-stone-700 group-hover:bg-stone-200 group-hover:border-stone-300 group-hover:text-stone-900"
                              }`}
                            >
                              {item.linkedResource ? (
                                <>
                                  <Zap className="w-3 h-3 text-stone-600 animate-pulse" />
                                  <span>一键启动</span>
                                </>
                              ) : (
                                <>
                                  <HelpCircle className="w-3 h-3 text-orange-700" />
                                  <span>导师助教</span>
                                </>
                              )}
                              <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Slogan and Encouragement at the bottom */}
              <div className="text-center pt-4 border-t border-stone-200/50 shrink-0">
                <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <span>●</span> 30 关亲子挑战清单由 “暑期亲子 AI 创客导师” 🍉 全力支持 <span>●</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

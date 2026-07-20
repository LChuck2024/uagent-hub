import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { TenantPricing, TenantSitePublic } from "../types";
import {
  fetchTenant,
  getStoredPin,
  storePin,
  updateTenant,
  verifyTenantPin,
} from "../lib/tenantApi";
import {
  ArrowLeft,
  DollarSign,
  KeyRound,
  Loader2,
  Lock,
  Palette,
  Save,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TenantAdminProps {
  slug: string;
}

type AdminTab = "prompt" | "branding" | "pricing";

const LOGO_OPTIONS = ["🤖", "✨", "💼", "🎯", "🔥", "💡", "🌙", "✍️", "💻", "🎨", "🚀", "👑"];

export function TenantAdmin({ slug }: TenantAdminProps) {
  const [tenant, setTenant] = useState<TenantSitePublic | null>(null);
  const [draft, setDraft] = useState<TenantSitePublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [unlocked, setUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("prompt");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchTenant(slug);
        if (!cancelled) {
          setTenant(data);
          setDraft(data);
          document.title = `${data.title} · 管理后台`;
          const stored = getStoredPin(slug);
          if (stored) {
            setAdminPin(stored);
            setUnlocked(true);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "加载失败");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleUnlock = async () => {
    if (!draft || adminPin.length !== 4) {
      setPinError("请输入 4 位 PIN 码");
      return;
    }
    setIsVerifying(true);
    setPinError(null);
    const ok = await verifyTenantPin(slug, adminPin, draft);
    setIsVerifying(false);
    if (ok) {
      storePin(slug, adminPin);
      setUnlocked(true);
    } else {
      setPinError("PIN 码错误，请重试");
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updated = await updateTenant(slug, adminPin, {
        title: draft.title,
        logo: draft.logo,
        welcomeMessage: draft.welcomeMessage,
        systemInstruction: draft.systemInstruction,
        temperature: draft.temperature,
        pricing: draft.pricing,
      });
      setTenant(updated);
      setDraft(updated);
      setSaveMessage("✅ 配置已保存，落地页即时生效");
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePricing = (patch: Partial<TenantPricing>) => {
    if (!draft) return;
    setDraft({ ...draft, pricing: { ...draft.pricing, ...patch } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-700 animate-spin" />
      </div>
    );
  }

  if (loadError || !draft) {
    return (
      <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col items-center justify-center gap-3">
        <p className="text-stone-500 text-sm">{loadError || "站点不存在"}</p>
        <Link to="/" className="text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          返回落地页
        </Link>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: ReactNode }[] = [
    { key: "prompt", label: "Prompt 调优", icon: <Sparkles className="w-4 h-4" /> },
    { key: "branding", label: "店铺视觉", icon: <Palette className="w-4 h-4" /> },
    { key: "pricing", label: "赚钱设置", icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-200/40 via-stone-100 to-stone-100 pointer-events-none" />

      {/* PIN lock screen */}
      <AnimatePresence>
        {!unlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm glass-panel rounded-2xl border border-orange-200 p-8 space-y-6 shadow-md"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-50 border border-orange-300 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-orange-700" />
                </div>
                <h2 className="font-display font-bold text-xl text-stone-900">管理后台</h2>
                <p className="text-xs text-stone-500 font-mono">{slug} · 请输入专属 PIN</p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-orange-700 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                      setPinError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                    placeholder="••••"
                    className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-stone-900 focus:outline-none focus:border-orange-600/50 focus:ring-1 focus:ring-orange-600/20"
                  />
                </div>
                {pinError && <p className="text-xs text-rose-400 text-center">{pinError}</p>}
              </div>

              <button
                type="button"
                onClick={handleUnlock}
                disabled={isVerifying || adminPin.length !== 4}
                className="w-full py-3 rounded-xl btn-primary text-white font-semibold text-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "解锁后台"}
              </button>

              <Link to="/" className="block text-center text-xs text-stone-500 hover:text-stone-700">
                ← 返回落地页
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin panel */}
      <header className="relative z-10 border-b border-stone-200 bg-stone-50 backdrop-blur-md px-4 py-4 md:px-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{draft.logo}</span>
            <div>
              <h1 className="font-display font-bold text-stone-900">{draft.title}</h1>
              <p className="text-[10px] font-mono text-orange-700">ADMIN · {slug}</p>
            </div>
          </div>
          <Link to="/" className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            落地页
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto w-full px-4 py-6 md:px-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-stone-50 border border-stone-200 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-orange-700 text-white shadow-md"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="glass-panel rounded-2xl border border-stone-200 p-5 md:p-6 space-y-4">
          {activeTab === "prompt" && (
            <>
              <div>
                <label className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  核心 System Prompt
                </label>
                <p className="text-[11px] text-stone-500 mt-1 mb-2">
                  修改后保存即可热更新，粉丝无法在浏览器中看到此内容。
                </p>
                <textarea
                  value={draft.systemInstruction}
                  onChange={(e) => setDraft({ ...draft, systemInstruction: e.target.value })}
                  rows={12}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 font-mono leading-relaxed focus:outline-none focus:border-orange-600/50 focus:ring-1 focus:ring-orange-600/20 resize-y"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  Temperature · {draft.temperature}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={draft.temperature}
                  onChange={(e) => setDraft({ ...draft, temperature: Number(e.target.value) })}
                  className="w-full mt-2 accent-orange-700"
                />
              </div>
            </>
          )}

          {activeTab === "branding" && (
            <>
              <div>
                <label className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  网页标题
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full mt-2 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-orange-600/50"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  欢迎语
                </label>
                <textarea
                  value={draft.welcomeMessage}
                  onChange={(e) => setDraft({ ...draft, welcomeMessage: e.target.value })}
                  rows={3}
                  className="w-full mt-2 bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-orange-600/50 resize-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-stone-500 uppercase tracking-wider mb-2 block">
                  专属 Logo (Emoji)
                </label>
                <div className="flex flex-wrap gap-2">
                  {LOGO_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setDraft({ ...draft, logo: emoji })}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                        draft.logo === emoji
                          ? "border-orange-600 bg-orange-50 scale-110"
                          : "border-stone-200 bg-stone-50 hover:border-stone-300"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "pricing" && (
            <>
              <div>
                <label className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  价格标签
                </label>
                <input
                  type="text"
                  value={draft.pricing.priceLabel}
                  onChange={(e) => updatePricing({ priceLabel: e.target.value })}
                  placeholder="例如：¥1/次 或 会员 ¥99/月"
                  className="w-full mt-2 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-orange-600/50"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  CTA 按钮文案
                </label>
                <input
                  type="text"
                  value={draft.pricing.ctaText}
                  onChange={(e) => updatePricing({ ctaText: e.target.value })}
                  placeholder="例如：购买终身版"
                  className="w-full mt-2 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-orange-600/50"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  跳转链接 (可选)
                </label>
                <input
                  type="url"
                  value={draft.pricing.ctaUrl || ""}
                  onChange={(e) => updatePricing({ ctaUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full mt-2 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-orange-600/50 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  收费模式
                </label>
                <select
                  value={draft.pricing.mode}
                  onChange={(e) =>
                    updatePricing({ mode: e.target.value as TenantPricing["mode"] })
                  }
                  className="w-full mt-2 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-orange-600/50"
                >
                  <option value="free">免费体验</option>
                  <option value="per_use">按次付费</option>
                  <option value="subscription">订阅会员</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-white text-sm font-semibold  disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存修改
          </button>
          {saveMessage && (
            <p className={`text-xs ${saveMessage.startsWith("✅") ? "text-emerald-400" : "text-rose-400"}`}>
              {saveMessage}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

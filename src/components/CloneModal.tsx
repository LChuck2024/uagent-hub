import { useState } from "react";
import { Agent, TenantCloneResponse } from "../types";
import { buildTenantSiteUrl, buildTenantUrls, getRootDomain, isDevEnvironment, isValidSlug } from "../lib/tenant";
import { readJsonResponse } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, Copy, Globe, KeyRound, Lock, Loader2, X } from "lucide-react";

interface CloneModalProps {
  agent: Agent | null;
  onClose: () => void;
}

interface CloneSuccess {
  siteUrl: string;
  adminUrl: string;
  adminPin: string;
  slug: string;
}

export function CloneModal({ agent, onClose }: CloneModalProps) {
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<CloneSuccess | null>(null);

  if (!agent) {
    return null;
  }

  const rootDomain = getRootDomain();
  const devPort =
    typeof window !== "undefined" && window.location.port ? window.location.port : "3000";
  const slugSuffix = isDevEnvironment()
    ? `.localhost:${devPort}`
    : `.${rootDomain}`;
  const previewUrl = slug && isValidSlug(slug) ? buildTenantSiteUrl(slug, devPort) : null;

  const handleConfirm = async () => {
    const normalized = slug.trim().toLowerCase();
    if (!normalized) {
      setError("请输入你的专属子域名前缀");
      return;
    }
    if (!isValidSlug(normalized)) {
      setError(`仅支持小写字母、数字与连字符，格式如 my-shop`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/tenant/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: normalized, sourceAgentId: agent.id }),
      });

      const data = await readJsonResponse<TenantCloneResponse>(
        response,
        "克隆失败，请稍后再试。",
      );

      // Always render subdomain URLs client-side (immune to stale API / old server process)
      const urls = buildTenantUrls(normalized, devPort);

      setSuccess({
        slug: normalized,
        siteUrl: urls.siteUrl,
        adminUrl: urls.adminUrl,
        adminPin: data.adminPin,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "克隆失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="w-full max-w-md glass-panel rounded-2xl border border-slate-700/80 p-6 space-y-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {success ? (
            <>
              <div className="text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <h2 className="font-display font-bold text-lg text-white">🎉 克隆成功！</h2>
                <p className="text-xs text-slate-400">
                  智能体「{agent.name}」已部署到你的专属站点
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    你的独立单页网址
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-white font-mono break-all flex-1">{success.siteUrl}</code>
                    <button
                      type="button"
                      onClick={() => copyText(success.siteUrl)}
                      className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white cursor-pointer shrink-0"
                      title="复制"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <p className="text-[10px] font-mono text-violet-300 uppercase tracking-wider">
                    管理后台
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-violet-200 font-mono break-all flex-1">{success.adminUrl}</code>
                    <button
                      type="button"
                      onClick={() => copyText(success.adminUrl)}
                      className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white cursor-pointer shrink-0"
                      title="复制"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-800/40 space-y-1.5">
                  <p className="text-[10px] font-mono text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    专属管理 PIN 码
                  </p>
                  <p className="text-2xl font-mono font-bold text-white tracking-[0.3em]">{success.adminPin}</p>
                  <p className="text-[11px] text-slate-400">
                    请前往管理后台进行自定义 Prompt 调优
                  </p>
                  <a
                    href={success.adminUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-violet-400 hover:text-violet-300 underline font-mono"
                  >
                    打开 {success.slug} 管理后台 →
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-cyan-600 text-white text-xs font-semibold cursor-pointer"
              >
                完成
              </button>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-mono text-violet-400 uppercase tracking-wider mb-1">
                    购买专属站点
                  </p>
                  <h2 className="font-display font-bold text-lg text-white">{agent.name}</h2>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{agent.description}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  选择你的子域名
                </label>
                <div className="flex items-center gap-0 rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                      setError(null);
                    }}
                    placeholder="my-ai-shop"
                    disabled={isSubmitting}
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none font-mono disabled:opacity-50"
                  />
              <span className="px-3 py-2.5 text-xs text-slate-500 font-mono border-l border-slate-800 bg-slate-900/50 shrink-0">
                {slugSuffix}
              </span>
                </div>
                {error && <p className="text-xs text-rose-400">{error}</p>}
                {previewUrl && (
                  <p className="text-[11px] text-cyan-400/90 font-mono flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    {previewUrl}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <Lock className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  克隆后你将获得独立落地页 + PIN 保护的后台，可自定义 Prompt、LOGO 与收费模式。
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  稍后再说
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/10 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    "确认克隆"
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

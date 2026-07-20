import { getRootDomain, isDevEnvironment } from "../lib/tenant";

export type SuiteProductId = "api" | "agents" | "storm" | "audit";

export interface SuiteProduct {
  id: SuiteProductId;
  name: string;
  /** One-line job-to-be-done for the visitor */
  forWhom: string;
  description: string;
  badge: string;
  cta: string;
  href: string;
  external: boolean;
  accent: "cyan" | "violet" | "amber" | "ink";
}

function suiteSubdomainUrl(sub: string): string {
  const envKey =
    sub === "api"
      ? import.meta.env.VITE_SUITE_API_URL
      : sub === "storm"
        ? import.meta.env.VITE_SUITE_STORM_URL
        : sub === "audit"
          ? import.meta.env.VITE_SUITE_AUDIT_URL
          : undefined;

  if (envKey && String(envKey).trim()) {
    return String(envKey).trim().replace(/\/$/, "");
  }

  const domain = getRootDomain();
  if (isDevEnvironment()) {
    const port =
      typeof window !== "undefined" && window.location.port
        ? window.location.port
        : import.meta.env.VITE_DEV_PORT || "3000";
    // ponytail: local subdomains need /etc/hosts or *.localhost; fall back to env URL when unset
    return `http://${sub}.localhost:${port}`;
  }
  return `https://${sub}.${domain}`;
}

export function getSuiteProducts(): SuiteProduct[] {
  return [
    {
      id: "api",
      name: "模型 API",
      forWhom: "要在自己的应用里接大模型",
      description:
        "注册后拿到 Key，按 OpenAI 格式直接调用。支持多模型，按用量扣费，卡密充值秒到账。",
      badge: "开发者",
      cta: "注册并获取 Key",
      href: suiteSubdomainUrl("api"),
      external: true,
      accent: "cyan",
    },
    {
      id: "agents",
      name: "智能体",
      forWhom: "想马上用 AI，或发给别人用",
      description:
        "不用写代码。选一个助手直接对话；也可以一键生成你的专属页面，改成你的风格后再分享链接。",
      badge: "即用",
      cta: "免费试用",
      href: "/agents",
      external: false,
      accent: "violet",
    },
    {
      id: "storm",
      name: "IdeaStorm",
      forWhom: "有个点子，想先想清楚再动手",
      description:
        "多个角色一起帮你发散，再专门找漏洞。几分钟得到一版可执行的评估，而不是一句「挺好的」。",
      badge: "决策",
      cta: "开始评估想法",
      href: suiteSubdomainUrl("storm"),
      external: true,
      accent: "amber",
    },
    {
      id: "audit",
      name: "Life Audit",
      forWhom: "想定期复盘目标与执行，别只靠感觉",
      description:
        "对话式战略审计：拆清现状、盯住任务与连续天数，把「感觉很忙」变成可对照的记录。",
      badge: "复盘",
      cta: "开始一次审计",
      href: suiteSubdomainUrl("audit"),
      external: true,
      accent: "ink",
    },
  ];
}

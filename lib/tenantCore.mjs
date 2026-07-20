export function generateAdminPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function toPublicTenant(tenant) {
  const { adminPin: _pin, ...publicTenant } = tenant;
  return publicTenant;
}

export function buildTenantFromAgent(slug, agent) {
  const now = new Date().toISOString();
  return {
    slug,
    sourceAgentId: agent.id,
    title: agent.name,
    logo: agent.avatar,
    welcomeMessage: `欢迎使用 ${agent.name}！输入你的问题，即刻获得 AI 回复。`,
    systemInstruction: agent.systemInstruction,
    temperature: agent.temperature ?? 0.7,
    pricing: {
      mode: "free",
      priceLabel: "免费体验",
      ctaText: "升级会员解锁更多次数",
      ctaUrl: "",
    },
    adminPin: generateAdminPin(),
    createdAt: now,
    updatedAt: now,
  };
}

const UPDATABLE_FIELDS = new Set([
  "title",
  "logo",
  "welcomeMessage",
  "systemInstruction",
  "temperature",
  "pricing",
]);

export function applyTenantUpdates(existing, body) {
  const next = { ...existing, updatedAt: new Date().toISOString() };
  for (const key of UPDATABLE_FIELDS) {
    if (body[key] !== undefined) {
      next[key] = body[key];
    }
  }
  return next;
}

/**
 * Resolve system prompt server-side.
 * Priority: tenantSlug → agentId catalog → client systemInstruction (custom drafts only).
 */
export async function resolveChatConfig(body, readTenantFn, isValidSlugFn, findAgentFn) {
  const { systemInstruction, temperature, messages, tenantSlug, agentId } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    const err = new Error("Missing or invalid chat messages.");
    err.statusCode = 400;
    throw err;
  }

  let resolvedInstruction = null;
  let resolvedTemp = temperature !== undefined ? Number(temperature) : 0.7;

  if (tenantSlug) {
    const slug = String(tenantSlug).toLowerCase();
    if (!isValidSlugFn(slug)) {
      const err = new Error("Invalid tenant slug.");
      err.statusCode = 400;
      throw err;
    }
    const tenant = await readTenantFn(slug);
    if (!tenant) {
      const err = new Error("Tenant not found.");
      err.statusCode = 404;
      throw err;
    }
    resolvedInstruction = tenant.systemInstruction;
    resolvedTemp = tenant.temperature ?? 0.7;
  } else if (agentId && typeof findAgentFn === "function") {
    const agent = await findAgentFn(String(agentId));
    if (agent) {
      resolvedInstruction = agent.systemInstruction;
      resolvedTemp = agent.temperature ?? 0.7;
    } else if (typeof systemInstruction === "string" && systemInstruction.trim()) {
      // Custom draft not yet persisted on server
      resolvedInstruction = systemInstruction;
    } else {
      const err = new Error("Agent not found.");
      err.statusCode = 404;
      throw err;
    }
  } else if (typeof systemInstruction === "string" && systemInstruction.trim()) {
    resolvedInstruction = systemInstruction;
  } else {
    const err = new Error("Missing agentId, tenantSlug, or systemInstruction.");
    err.statusCode = 400;
    throw err;
  }

  return { resolvedInstruction, resolvedTemp, messages };
}

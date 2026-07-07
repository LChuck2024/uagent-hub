import { API_VERSION, corsHeaders, jsonResponse } from "./shared.mjs";
import {
  handleChatPost,
  handleInteractionPost,
  handleResourcesGet,
  handleSharePost,
  handleTenantClonePost,
  handleTenantGet,
  handleTenantPut,
  handleWorkflowRunPost,
} from "./handlers.mjs";

function routePath(context) {
  return new URL(context.request.url).pathname.replace(/\/+$/, "") || "/";
}

function matchTenantSlug(path) {
  const match = path.match(/^\/api\/tenant\/([a-z0-9-]+)$/);
  return match ? match[1] : null;
}

export function onRequestGet(context) {
  const path = routePath(context);
  if (path === "/api/community/resources") {
    return handleResourcesGet();
  }
  if (path === "/api/health") {
    return jsonResponse({ api: API_VERSION, ok: true });
  }

  const tenantSlug = matchTenantSlug(path);
  if (tenantSlug) {
    return handleTenantGet(context, tenantSlug);
  }

  return jsonResponse({ error: "Not found." }, 404);
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestPost(context) {
  const path = routePath(context);

  switch (path) {
    case "/api/agent/chat":
      return handleChatPost(context);
    case "/api/workflow/run":
      return handleWorkflowRunPost(context);
    case "/api/community/share":
      return handleSharePost(context);
    case "/api/community/interaction":
      return handleInteractionPost(context);
    case "/api/tenant/clone":
      return handleTenantClonePost(context);
    default:
      return jsonResponse({ error: "Not found." }, 404);
  }
}

export async function onRequestPut(context) {
  const path = routePath(context);
  const tenantSlug = matchTenantSlug(path);
  if (tenantSlug) {
    return handleTenantPut(context, tenantSlug);
  }
  return jsonResponse({ error: "Not found." }, 404);
}

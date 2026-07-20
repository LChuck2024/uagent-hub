/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TENANT_DOMAIN?: string;
  readonly VITE_DEV_PORT?: string;
  readonly VITE_DEEPSEEK_API_KEY?: string;
  readonly VITE_SUITE_API_URL?: string;
  readonly VITE_SUITE_STORM_URL?: string;
  readonly VITE_SUITE_AUDIT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

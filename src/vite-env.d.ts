/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TENANT_DOMAIN?: string;
  readonly VITE_DEV_PORT?: string;
  readonly VITE_DEEPSEEK_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

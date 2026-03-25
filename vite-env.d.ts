/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_MISTRAL_API_KEY: string
  readonly VITE_MURF_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

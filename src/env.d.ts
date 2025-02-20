/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ORDERBOOK_WS_URL: string;
  readonly VITE_ORDERBOOK_WS_TOPIC: string;
  readonly VITE_TRADE_WS_URL: string;
  readonly VITE_TRADE_WS_TOPIC: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

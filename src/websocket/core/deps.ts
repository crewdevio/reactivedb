export {
  serve,
  Server as DenoServer,
  serveTLS,
} from "https://deno.land/std@0.113.0/http/server_legacy.ts";

export type {
  HTTPOptions,
  HTTPSOptions,
  ServerRequest,
} from "https://deno.land/std@0.113.0/http/server_legacy.ts";

export {
  acceptWebSocket,
  isWebSocketCloseEvent,
} from "https://denopkg.com/crewdevio/tools@update/ws/mod.ts";

export type { WebSocket } from "https://denopkg.com/crewdevio/tools@update/ws/mod.ts";

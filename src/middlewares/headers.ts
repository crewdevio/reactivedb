import type { Context, Next } from "../../imports/server_oak.ts";
import { oakCors } from "../../imports/server_oak.ts";

export const SettingCors = oakCors({
  methods: ["POST", "PUT", "GET", "OPTIONS", "DELETE"],
  optionsSuccessStatus: 200,
  credentials: true,
  origin: "*",
});

export async function CommonHeaders(ctx: Context, next: Next) {
  ctx.response.headers.set("x-powered-by", "ReactiveDB");
  ctx.response.headers.set("x-deno-version", Deno.version.deno);

  await next();
}

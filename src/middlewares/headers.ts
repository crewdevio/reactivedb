import type { Context, Next } from "../../imports/server_oak.ts";

export async function CommonHeaders(ctx: Context, next: Next) {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "POST, PUT, GET, OPTIONS"
  );

  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
  );

  ctx.response.headers.set("x-powered-by", "ReactiveDB");
  ctx.response.headers.set("x-deno-version", Deno.version.deno);

  await next();
}

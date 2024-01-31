import type { Context } from "../../imports/server_oak.ts";

// Middleware only hooking in and sending static files if prefix matches
// the desired subpath:
export const UI = async (ctx: Context, next: () => Promise<unknown>) => {
  const prefix = "/UI"; // Sub-path to react on
  if (ctx.request.url.pathname.startsWith(prefix)) {
    await ctx.send({
      root: `${Deno.cwd()}/dashboard/dist`, // Local directory to serve from
      index: "index.html",
      path: ctx.request.url.pathname.replace(prefix, ""), // Map to target path
    });
  } else {
    // If the request does not match the prefix, just continue serving from
    // whatever comes next..
    await next();
  }
};

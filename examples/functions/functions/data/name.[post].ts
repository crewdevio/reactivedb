import type { Context, Utilities } from "../../../../mod.ts";

export default async function Data(context: Context, utils: Utilities) {
  context.response.status = 200;
  context.response.body = "index/data/name app";
}

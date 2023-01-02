import type { Context } from "../../../../mod.ts";

export default async function Users(context: Context) {
  context.response.status = 200;
  context.response.body = "api/users app";
}

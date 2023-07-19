import type { Context } from "../../../../mod.ts";
import { PI } from "./_handler_users.ts";

export default async function Data(context: Context) {
  context.response.status = 200;
  context.response.body = `index/data app ${PI}`;
}

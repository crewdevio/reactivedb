import type { RouterContext } from "../../imports/oak.ts";
import { PI } from "./_handler_users.ts";

export default async function Data(context: RouterContext) {
  context.response.status = 200;
  context.response.body = `index/data app ${PI}`;
}

import type { RouterContext } from "../../../../imports/oak.ts";

export default async function Users(context: RouterContext) {
  context.response.status = 200;
  context.response.body = "api/users app";
}

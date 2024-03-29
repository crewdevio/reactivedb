import { Handler, HandlerMiddlewares } from "../../../mod.ts";
import type { Context, Utilities } from "../../../mod.ts";

export const middlewares = HandlerMiddlewares([
  async (ctx, next) => {
    console.log(ctx.request.ip);

    await next();
  },
]);

export default async function ElpEpE(context: Context, utils: Utilities) {
  try {
    const x = await utils.Database.collection("Auth_users");
    const results = await x.find().toArray();

    utils.Events.post({
      to: "Auth_users",
      data: [],
      event: "child_added",
    });

    context.response.status = 200;
    context.response.body = results;
  } catch (error) {
    console.log(error);
  }
}

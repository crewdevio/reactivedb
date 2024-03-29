import type { Context, Utilities } from "../../../../mod.ts";

export default async function Users(context: Context, utils: Utilities) {
  const body = context.request.body;
  const { uuid } = await body.json();

  const db = await utils.Database.collection("users");

  const finded = (await db.findOne({ uuid })) as any;

  console.log({ finded });

  if (finded) {
    context.response.status = 200;
    context.response.body = finded;
    return;
  }

  utils.Events.post({
    to: "users",
    data: finded ?? [],
    event: "child_changed",
  });

  context.response.status = 404;
  context.response.body = {};
}

import type { Context, Utilities } from "../../src/types.ts";

export default async function Index(context: Context, utils: Utilities) {
  const x = await utils.Database.collection("users");

  console.log("index", context.params);

  const results = await x.find(undefined, { noCursorTimeout: false }).toArray();

  utils.Events.post({
    to: "users",
    data: [{ ...results }, { custom: true }],
    event: "child_added",
  });

  context.response.status = 200;
  context.response.body = results;
}

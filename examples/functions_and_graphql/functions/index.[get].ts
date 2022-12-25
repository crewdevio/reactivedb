import type { Context, Utilities } from "../../../src/types.ts";

export default async function Index(context: Context, utils: Utilities) {
  try {
    const x = await utils.Database.collection("Auth_users");

    const results = await x
      .find(undefined, { noCursorTimeout: false })
      .toArray();

    // utils.Events.post({
    //   to: "packages",
    //   data: [],
    //   event: "child_removed",
    // });

    context.response.status = 200;
    context.response.body = results;
  } catch (error) {
    console.log(error);
  }
}

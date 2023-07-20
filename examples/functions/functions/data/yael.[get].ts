import type { Context, Utilities } from "../../../../mod.ts";

export default async function Index(context: Context, utils: Utilities) {
  // const x = await utils.Database.collection("users");

  // const results = await x.find(undefined, { noCursorTimeout: false }).toArray();

  context.response.status = 200;
  context.response.body = `hola yael`;
}

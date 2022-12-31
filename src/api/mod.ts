/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { handleGraphql } from "../core/graphql_runtime.ts";
import { Application } from "../../imports/server_oak.ts";
import * as mongo from "../../imports/mongo.ts";
import { CreateRouter } from "./router.ts";

export async function Api(DB: mongo.Database, secret: string, app: Application) {
  const Router = await CreateRouter(DB, secret);

  app.use(async (ctx, next) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    ctx.response.headers.set(
      "Access-Control-Allow-Methods",
      "POST, PUT, GET, OPTIONS"
    );

    ctx.response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
    );

    ctx.response.headers.set(
      "x-powered-by",
      "ReactiveDB x Deno"
    );

    // !Buttercubz: don't works on deno deploy :(
    // ctx.response.headers.set(
    //   "x-deno-version",
    //   Deno.version.deno
    // );

    await next();
  });

  app.use(Router.allowedMethods());
  app.use(Router.routes());

  // inject and start graphql
  // if (await exists("./graphql")) {
  //   await handleGraphql("./graphql", app);
  // }

  return app;
}

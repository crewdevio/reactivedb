/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { handleGraphql } from "../core/graphql_runtime.ts";
import { Application } from "../../imports/oak.ts";
import * as mongo from "../../imports/mongo.ts";
import { exists } from "../../imports/fs.ts";
import { CreateRouter } from "./router.ts";

export async function Api(DB: mongo.Database, secret: string) {
  const app = new Application();
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

    await next();
  });

  app.use(Router.allowedMethods());
  app.use(Router.routes());

  // inject and start graphql
  if (await exists("./graphql")) {
    await handleGraphql("./graphql", app);
  }

  return app;
}

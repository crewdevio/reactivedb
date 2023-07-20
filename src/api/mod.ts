/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Application } from "../../imports/server_oak.ts";
import * as mongo from "../../imports/mongo.ts";
import type { JWTPayload } from "../types.ts";
import { CreateRouter } from "./router.ts";
import { jwt } from "../../imports/jwt.ts";

export async function Api(
  DB: mongo.Database,
  secretKey: CryptoKey,
  app: Application
) {
  const Router = await CreateRouter(DB, secretKey);

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

    ctx.response.headers.set("x-powered-by", "ReactiveDB");
    ctx.response.headers.set("x-deno-version", Deno.version.deno);

    await next();
  });

  app.use(async (ctx, next) => {
    // ws token check
    if (ctx.request.url.pathname === "/[WebSocket]") {
      const token = ctx.request.url.searchParams.get("x-authorization-token")!;

      try {
        const payload = (await jwt.verify(
          token,
          secretKey
        )) as unknown as JWTPayload;

        const users = DB.collection("Auth_users");

        const user = await users.findOne({
          uuid: payload.uuid,
          email: payload.email,
        });

        if (user !== undefined) {
          await next();
        } else {
          if (ctx.isUpgradable) {
            const ws = ctx.upgrade();

            setTimeout(() => ws.close(4004, "User not found"), 100);
          }
        }
      } catch (error) {
        if (ctx.isUpgradable) {
          const ws = ctx.upgrade();

          setTimeout(() => ws.close(4999, `${error?.message}`), 100);
        } else {
          ctx.response.status = 500;
          ctx.response.body = {
            error: true,
            message: `${error?.message}`,
          };

          return;
        }
      }
    } else {
      await next();
    }
  });

  app.use(Router.allowedMethods());
  app.use(Router.routes());

  return app;
}

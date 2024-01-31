/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CommonHeaders, SettingCors } from "../middlewares/headers.ts";
import { Application } from "../../imports/server_oak.ts";
import { Websockets } from "../middlewares/websockets.ts";
import { CLSValidator } from "../middlewares/cls.ts";
import type { CLSDefinition } from "../cls/mod.ts";
import { Db } from "../../imports/mongodb.ts";
import { CreateRouter } from "./router.ts";

export async function Api(
  DB: Db,
  secretKey: CryptoKey,
  app: Application,
  CLSDefinition: CLSDefinition | null | undefined,
  mapper?: boolean
) {
  const Router = await CreateRouter(DB, secretKey, mapper);

  // global headers
  app.use(CommonHeaders);

  // cors headers
  app.use(SettingCors);

  // CLS validator
  if (CLSDefinition)
    app.use(
      async (ctx, next) =>
        await CLSValidator(ctx, next, CLSDefinition!, secretKey, DB)
    );

  // websockets auth validation
  app.use(async (ctx, next) => await Websockets(ctx, next, secretKey, DB));

  app.use(Router.allowedMethods());
  app.use(Router.routes());

  return app;
}

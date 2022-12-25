/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { cyan, green, red, yellow } from "../../imports/fmt.ts";
import { handleFiles } from "../core/funtions_runtime.ts";
import { Bson, StartDataBase } from "../database/mod.ts";
import { Logs, transform } from "../shared/utils.ts";
import { createHash } from "../../imports/hash.ts";
import { AuthToken } from "../middlewares/auth.ts";
import { exists, walk } from "../../imports/fs.ts";
import { reactiveEvents } from "../core/events.ts";
import type { DataBaseProps } from "../types.ts";
import * as mongo from "../../imports/mongo.ts";
import { Router } from "../../imports/oak.ts";
import { generate } from "../libs/uuid/v4.js";
import { jwt } from "../../imports/jwt.ts";

export async function CreateRouter(DB: mongo.Database, secret: string) {
  const router = new Router();

  const schema: Array<{ method: string; route: string; handler: string }> = [];

  if (await exists("./functions")) {
    for await (const file of walk("./functions", {
      exts: ["ts", "js", "tsx", "jsx"],
    })) {
      if (file.isFile && !file.name.startsWith("_")) {
        const { route, methods, handler } = await handleFiles(file);

        for (const method of methods) {
          schema.push({
            method,
            route,
            handler: handler.toString(),
          });

          // @ts-ignore
          router[method](
            route,
            // @ts-ignore
            async (ctx) =>
              // @ts-ignore
              await handler(ctx, { Database: DB, Events: reactiveEvents })
          );
        }
      }
    }

    router.get("/[v1]/api_schema", ({ response }) => {
      response.body = schema;
    });
  }

  const routes = {
    id: "/[v1]/:collection/:id",
    collection: "/[v1]/:collection",
  };

  // * reactive db core api
  router.get(routes.id, async ({ response, params }) => {
    try {
      const id = params?.id!;
      const collection = params?.collection!;

      const data = DB.collection(collection);
      const find = await data
        .find({ _id: new Bson.ObjectId(id) }, { noCursorTimeout: false })
        .toArray();

      response.status = 200;
      response.body = find;
    } catch (error: any) {
      response.status = 500;
      response.body = {
        message: error?.message,
        error,
      };
    }
  });

  router.get(routes.collection, async ({ request, response, params }) => {
    try {
      if (decodeURIComponent(request.url.pathname) === "/[v1]/*") {
        const collections = await DB.listCollectionNames();

        response.status = 200;
        response.body = { collections };
      } else {
        const collection = params?.collection!;
        const data = DB.collection(collection);

        const find = await data
          .find(undefined, { noCursorTimeout: false })
          .toArray();

        response.status = 200;
        response.body = find;
      }
    } catch (error: any) {
      response.status = 500;
      response.body = {
        message: error?.message,
        error,
      };
    }
  });

  router.post(routes.collection, async ({ response, request, params }) => {
    try {
      const collection = params?.collection!;
      const body = request.body({ type: "json" });

      const requestData = await body.value;
      const query = DB.collection(collection);

      const added = await query.insertOne(requestData);

      const finds = await query
        .find(undefined, { noCursorTimeout: false })
        .toArray();

      reactiveEvents.post({
        to: collection,
        data: [...transform(finds)],
        event: "child_added",
      });

      response.status = 200;
      response.body = { ok: true };
    } catch (error: any) {
      response.status = 500;
      response.body = {
        message: error?.message,
        error,
      };
    }
  });

  router.delete(routes.id, async ({ response, params }) => {
    try {
      const collection = params?.collection!;
      const id = params?.id!;

      const query = DB.collection(collection);
      const finded = await query.findOne(
        { _id: new Bson.ObjectId(id) },
        { noCursorTimeout: false }
      );

      if (finded) {
        await query.deleteOne(finded as any);
        const finds = await query
          .find(undefined, { noCursorTimeout: false })
          .toArray();

        reactiveEvents.post({
          to: collection,
          data: [...transform(finds)],
          event: "child_removed",
        });

        response.status = 200;
        response.body = { ok: true };
      } else {
        response.status = 404;
        response.body = { ok: false, message: `can't found "${id}" resource` };
      }
    } catch (error) {
      response.status = 500;
      response.body = {
        message: error?.message,
        error,
      };
    }
  });

  router.put(routes.id, async ({ response, request, params }) => {
    const collection = params?.collection!;
    const id = params?.id!;

    const body = request.body({ type: "json" });
    const { _id, ...newData } = await body.value;

    const query = DB.collection(collection);
    const finded = await query.findOne(
      { _id: new Bson.ObjectId(id) },
      { noCursorTimeout: false }
    );

    if (finded) {
      const { ...oldData } = finded as any;

      await query.updateOne(oldData, { $set: { ...newData } });

      const finds = await query
        .find(undefined, { noCursorTimeout: false })
        .toArray();

      reactiveEvents.post({
        to: collection,
        data: [...transform(finds)],
        event: "child_changed",
      });

      response.status = 200;
      response.body = { ok: true };
    } else {
      response.status = 404;
      response.body = { ok: false, message: `can't found "${id}" resource` };
    }

    response.status = 200;
    response.body = { ok: true };
  });

  router.patch(routes.id, async ({ response, request, params }) => {
    const collection = params?.collection!;
    const id = params?.id!;

    const body = request.body({ type: "json" });
    const { _id, ...newData } = await body.value;

    const query = DB.collection(collection);
    const finded = await query.findOne(
      { _id: new Bson.ObjectId(id) },
      { noCursorTimeout: false }
    );

    if (finded) {
      const { ...oldData } = finded as any;

      await query.updateOne(oldData, { $set: { ...newData } });

      const finds = await query
        .find(undefined, { noCursorTimeout: false })
        .toArray();

      reactiveEvents.post({
        to: collection,
        data: [...transform(finds)],
        event: "child_changed",
      });

      response.status = 200;
      response.body = { ok: true };
    } else {
      response.status = 404;
      response.body = { ok: false, message: `can't found "${id}" resource` };
    }

    response.status = 200;
    response.body = { ok: true };
  });

  // * reactive db core api

  router.post(
    "/[auth]/registeUserWithEmailAndPassword",
    // AuthToken,
    async ({ response, request }) => {
      const users = DB.collection("Auth_users");

      const body = request.body({ type: "json" });
      const { email, password } = await body.value;

      const finded = await users.findOne({ email }, { noCursorTimeout: false });
      const encryptedPassword = createHash("sha1")
        .update(password.toString())
        .toString();

      const uuid = generate();

      if (finded) {
        response.status = 409;
        response.body = { error: true, message: `"${email}" already register` };
        return;
      }

      await users.insertOne({
        email,
        password: encryptedPassword,
        uuid,
        created_at: new Date().toLocaleString(),
        provider: "email",
      });

      const finds = await users
        .find(undefined, { noCursorTimeout: false })
        .toArray();

      reactiveEvents.post({
        to: "Auth_users",
        data: [...transform(finds)],
        event: "child_changed",
      });

      response.body = { token: true };
    }
  );

  router.post(
    "/[auth]/loginWithEmailAndPassword",
    async ({ response, request }) => {
      try {
        const users = DB.collection("Auth_users");

        const body = request.body({ type: "json" });
        const { email, password } = await body.value;

        const userPassword = createHash("sha1")
          .update(password.toString())
          .toString();

        const finded = await users.findOne({ email });

        if (!finded) {
          response.status = 409;
          response.body = { error: true, message: "this account not exist." };
          return;
        }

        const {
          password: findedPassword,
          email: findedEmail,
          uuid,
        } = finded as any;

        if (findedPassword === userPassword) {
          const Token = await jwt.create(
            { alg: "HS512", typ: "JWT" },
            {
              password: userPassword,
              email: findedEmail,
              uuid,
            },
            secret
          );

          response.status = 200;
          response.body = {
            uuid,
            email,
            token: Token,
          };

          return;
        }

        response.body = { error: true, message: "wrong password" };
      } catch (error) {
        console.log({ error });
      }
    }
  );

  router.post("/[auth]/deleteEmailAccount", async ({ request, response }) => {
    const users = DB.collection("Auth_users");
    const body = request.body({ type: "json" });
    const { uuid } = await body.value;

    const finded = (await users.findOne({ uuid })) as any;

    if (finded) {
      await users.deleteOne(finded);

      response.status = 200;
      response.body = { ok: true };
    } else {
      response.status = 409;
      response.body = { error: true, message: "this account not exist." };
    }
  });

  router.post("/[auth]/disableEmailAccount", async ({ request, response }) => {
    const users = DB.collection("Auth_users");
    const body = request.body({ type: "json" });
    const { uuid, active } = await body.value;

    const finded = (await users.findOne({ uuid })) as any;

    if (finded) {
      await users.updateOne(finded, { $set: { active } });

      response.status = 200;
      response.body = { ok: true };
    } else {
      response.status = 409;
      response.body = { error: true, message: "this account not exist." };
    }
  });

  return router;
}

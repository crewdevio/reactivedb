/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Routes, transform, IS_DENO_DEPLOY, exists } from "../shared/utils.ts";
import { encodeHex, encode } from "../../imports/encoding.ts";
import { handleFiles } from "../core/funtions_runtime.ts";
import { Router } from "../../imports/server_oak.ts";
import { AuthToken } from "../middlewares/auth.ts";
import { reactiveEvents } from "../core/events.ts";
import { crypto } from "../../imports/cripto.ts";
import * as mongo from "../../imports/mongo.ts";
import { generate } from "../libs/uuid/v4.js";
import { join } from "../../imports/path.ts";
import { walk } from "../../imports/fs.ts";
import { jwt } from "../../imports/jwt.ts";
import { Bson } from "../database/mod.ts";

export async function CreateRouter(
  DB: mongo.Database,
  secretKey: CryptoKey,
  mapper?: boolean
) {
  const router = new Router();
  const mapperPath = join(Deno.cwd(), "rdb_mapper.ts");

  const schema: Array<{
    method: string;
    route: string;
    handler: string;
    extention: string;
    name: string;
    path: string;
  }> = [];

  let count = 0;

  // deno deploy not support write operations
  if (!IS_DENO_DEPLOY && mapper) {
    const encoder = new TextEncoder();
    const data = encoder.encode(
      "// this this generated by ReactiveDB don't change this file\n"
    );

    await Deno.writeFile(mapperPath, data);
  }

  if (await exists("./functions")) {
    for await (const file of walk("./functions", {
      exts: ["ts", "js", "tsx", "jsx"],
    })) {
      if (file.isFile && !file.name.startsWith("_")) {
        const {
          route,
          methods,
          handler,
          extention,
          name,
          path,
          middlewares = [],
        } = await handleFiles(file, count);

        if (!IS_DENO_DEPLOY && mapper) {
          const mapper = await Deno.readTextFile(mapperPath);

          await Deno.writeTextFile(
            mapperPath,
            `${mapper}\n// route for ${route}, methods ${JSON.stringify(
              methods
            )}\nimport "./${path}";`
          );
        }

        for (const method of methods) {
          schema.push({
            method,
            extention,
            route,
            name,
            path,
            handler: handler.toString(),
          });

          // @ts-ignore
          router[method](
            route,
            ...middlewares,
            //@ts-ignore
            async (ctx) =>
              //@ts-ignore
              await handler(ctx, { Database: DB, Events: reactiveEvents })
          );
        }

        count++;
      }
    }

    router.get(Routes.schema, ({ response }) => {
      response.body = schema;
    });
  }

  // * reactive db core api
  router.get(
    Routes.id,
    async (ctx, next) => {
      await AuthToken(ctx, next, secretKey, DB);
    },
    async ({ response, params }) => {
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
    }
  );

  router.get(
    Routes.collection,
    async (ctx, next) => {
      await AuthToken(ctx, next, secretKey, DB);
    },
    async ({ request, response, params }) => {
      try {
        if (decodeURIComponent(request.url.pathname) === "/v1/*") {
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
    }
  );

  router.post(
    Routes.collection,
    async (ctx, next) => {
      await AuthToken(ctx, next, secretKey, DB);
    },
    async ({ response, request, params }) => {
      try {
        const collection = params?.collection!;
        const body = request.body;

        const requestData = await body.json();
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
    }
  );

  router.delete(
    Routes.id,
    async (ctx, next) => {
      await AuthToken(ctx, next, secretKey, DB);
    },
    async ({ response, params }) => {
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
          response.body = {
            ok: false,
            message: `can't found "${id}" resource`,
          };
        }
      } catch (error) {
        response.status = 500;
        response.body = {
          message: error?.message,
          error,
        };
      }
    }
  );

  router.put(
    Routes.id,
    async (ctx, next) => {
      await AuthToken(ctx, next, secretKey, DB);
    },
    async ({ response, request, params }) => {
      const collection = params?.collection!;
      const id = params?.id!;

      const body = request.body;
      const { _id, ...newData } = await body.json();

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
    }
  );

  router.patch(
    Routes.id,
    async (ctx, next) => {
      await AuthToken(ctx, next, secretKey, DB);
    },
    async ({ response, request, params }) => {
      const collection = params?.collection!;
      const id = params?.id!;

      const body = request.body;
      const { _id, ...newData } = await body.json();

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
    }
  );

  // * reactive db core api

  router.post(
    Routes.auth.register,

    //! enable later
    // async (ctx, next) => {
    //   await AuthToken(ctx, next, secretKey, DB);
    // },
    async ({ response, request }) => {
      const users = DB.collection("Auth_users");

      const body = request.body;
      const { email, password } = await body.json();

      const finded = await users.findOne({ email }, { noCursorTimeout: false });

      const hash = await crypto.subtle.digest(
        "SHA-512",
        encode(password.toString())
      );

      // Hex encoding
      const encryptedPassword = encodeHex(hash);

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

  router.post(Routes.auth.login, async ({ response, request }) => {
    try {
      const users = DB.collection("Auth_users");

      const body = request.body;
      const { email, password } = await body.json();

      const hash = await crypto.subtle.digest(
        "SHA-512",
        encode(password.toString())
      );

      // Hex encoding
      const userPassword = encodeHex(hash);

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
            email: findedEmail,
            uuid,
          },
          secretKey
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
  });

  router.post(
    Routes.auth.delete,
    async (ctx, next) => {
      await AuthToken(ctx, next, secretKey, DB);
    },
    async ({ request, response }) => {
      const users = DB.collection("Auth_users");
      const body = request.body;

      const { uuid } = await body.json();

      const finded = (await users.findOne({ uuid })) as any;

      if (finded) {
        await users.deleteOne(finded);

        response.status = 200;
        response.body = { ok: true };
      } else {
        response.status = 409;
        response.body = { error: true, message: "this account not exist." };
      }
    }
  );

  router.post(
    Routes.auth.disable,
    async (ctx, next) => {
      await AuthToken(ctx, next, secretKey, DB);
    },
    async ({ request, response }) => {
      const users = DB.collection("Auth_users");

      const body = request.body;
      const { uuid, active } = await body.json();

      const finded = (await users.findOne({ uuid })) as any;

      if (finded) {
        await users.updateOne(finded, { $set: { active } });

        response.status = 200;
        response.body = { ok: true };
      } else {
        response.status = 409;
        response.body = { error: true, message: "this account not exist." };
      }
    }
  );

  return router;
}

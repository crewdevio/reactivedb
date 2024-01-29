import type { Context, Next, HTTPMethods } from "../../imports/server_oak.ts";
import { matchPath } from "https://esm.sh/react-router@5.3.4";
import type { WriteMethods } from "./../cls/mod.ts";
import type { CLSDefinition } from "../cls/mod.ts";
import * as mongo from "../../imports/mongo.ts";
import type { JWTPayload } from "../types.ts";
import { jwt } from "../../imports/jwt.ts";

const isWriteMethod = (method: string) =>
  ["DELETE", "POST", "PUT", "PATCH"].includes(method);

const isWriteRules = (rule: unknown) => typeof rule === "object";

const validateWriteAction = async (
  ctx: Context,
  next: Next,
  method: HTTPMethods,
  writeMethods: WriteMethods
): Promise<void | boolean> => {
  switch (method) {
    // create check
    case "POST":
      if (writeMethods.create()) {
        await next();
      } else {
        ctx.response.status = 401;
        ctx.response.body = {
          error: true,
          message: `CLS Error: not authorize to write`,
        };

        return true;
      }
      break;

    // update check
    case "PUT":
    case "PATCH":
      if (writeMethods.update()) {
        await next();
      } else {
        ctx.response.status = 401;
        ctx.response.body = {
          error: true,
          message: `CLS Error: not authorize to update`,
        };

        return true;
      }
      break;

    // delete check
    case "DELETE":
      if (writeMethods.delete()) {
        await next();
      } else {
        ctx.response.status = 401;
        ctx.response.body = {
          error: true,
          message: `CLS Error: not authorize to delete`,
        };

        return true;
      }

      break;
  }
};

const match = (path: string, ctx: Context) =>
  matchPath(ctx.request.url.pathname, {
    path: path,
    exact: true,
    strict: false,
  });

export async function CLSValidator(
  ctx: Context,
  next: Next,
  CLSDefinition: CLSDefinition,
  secretKey: CryptoKey,
  DB: mongo.Database
) {
  const routes = Object.entries(CLSDefinition!)
    .filter(([path]) => !!match(path, ctx))
    .map(([path, controller]) => {
      const { params } = match(path, ctx)!;

      return {
        controller,
        params,
      };
    });

  if (routes.length) {
    for (const { controller, params } of routes) {
      const token = ctx.request.headers.get("token")!;

      const payload = (await jwt.verify(
        token,
        secretKey
      )) as unknown as JWTPayload;

      const { read, write } = controller(() => params as any, DB, {
        ...(payload ?? {}),
        auth: true,
      });

      if (ctx.request.method === "GET") {
        const rule = await read?.()!;

        if (rule) {
          await next();
        } else {
          ctx.response.status = 401;
          ctx.response.body = {
            error: true,
            message: `CLS Error: not authorize to read`,
          };

          return;
        }
      } else if (isWriteMethod(ctx.request.method)) {
        const rule = await write?.()!;

        if (isWriteRules(rule)) {
          const out = await validateWriteAction(
            ctx,
            next,
            ctx.request.method,
            rule as WriteMethods
          );

          if (out) return;
        } else {
          if (rule) {
            await next();
          } else {
            ctx.response.status = 401;
            ctx.response.body = {
              error: true,
              message: `CLS Error: not authorize to update, write or delete`,
            };

            return;
          }
        }
      }
    }
  } else {
    await next();
  }
}

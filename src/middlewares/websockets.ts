import type { Context, Next } from "../../imports/server_oak.ts";
import * as mongo from "../../imports/mongo.ts";
import type { JWTPayload } from "../types.ts";
import { jwt } from "../../imports/jwt.ts";

export async function Websockets(
  ctx: Context,
  next: Next,
  secretKey: CryptoKey,
  DB: mongo.Database
) {
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
}

import type { Context } from "../../imports/server_oak.ts";
import { Db } from "../../imports/mongodb.ts";
import { jwt } from "../../imports/jwt.ts";
import { JWTPayload } from "../types.ts";

export async function AuthToken(
  ctx: Context,
  next: () => Promise<any> | any,
  secretKey: CryptoKey,
  DB: Db
) {
  try {
    const token = ctx.request.headers.get("token")!;

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
      ctx.response.status = 404;
      ctx.response.body = {
        error: true,
        message: "User not found",
      };
    }
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: true,
      message: `${error?.message}`,
    };

    return;
  }
}

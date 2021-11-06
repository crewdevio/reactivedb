import type { RouterContext } from "../../imports/oak.ts";
import { validate } from "../libs/uuid/v4.js";
import { jwt } from "../../imports/jwt.ts";

export async function AuthToken(
  { request, response }: RouterContext,
  next: () => Promise<any> | any,
) {
  if (request.url.search === "") {
    response.status = 401;
    response.body = {
      error: true,
      message:
        "Unauthorized must provide an authorization token and a user uuid",
    };

    return;
  } else {
    const params = request.url.searchParams.has("token") &&
      request.url.searchParams.has("uuid");

    if (params) {
      const token = request.url.searchParams.get("token")!;
      const uuid = request.url.searchParams.get("uuid")!;

      if (!validate(uuid)) {
        response.status = 401;
        response.body = { error: true, message: "user uuid is invalid" };
        return;
      }

      const [header, payload, signature] = jwt.decode(token);

      if (!(header && payload && signature)) {
        response.status = 401;
        response.body = {
          error: true,
          message: "the sent token is not correct",
        };
        return;
      }

      await next();
    } else {
      response.status = 401;
      response.body = {
        error: true,
        message:
          "Unauthorized must provide an authorization token and a user uuid",
      };
      return;
    }
  }
}

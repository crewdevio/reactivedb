/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  Actions,
  IPacket,
  Middleware,
  ReactiveCoreProps,
  SFunction,
} from "../types.ts";
import { cyan, yellow } from "../../imports/fmt.ts";
import { ObjectId } from "../../imports/mongodb.ts";
import { MutableEvents } from "../shared/utils.ts";
import { reactiveEvents } from "./events.ts";
import { server } from "../server/mod.ts";

/**
 * start reactive server service.
 *
 * `example:`
 * ```typescript
 * import { ReactiveCore } from "./mod.ts";
 *
 * await ReactiveCore({
 *  connection: "mongodb://localhost:27017/mydb",
 *  port: 3000,
 * });
 * ```
 *
 * @param {ReactiveCoreProps} props
 */
export async function ReactiveCore({
  connection,
  port = 1777,
  secretKey,
  middlewares,
  CLSDefinition,
  mapper,
  database,
  mongodbOptions,
}: ReactiveCoreProps) {
  // Run websockets server
  const instance = await server.init({
    database,
    hostname: "0.0.0.0",
    port,
    secretKey,
    middlewares,
    CLSDefinition,
    mapper,
    connection,
    mongodbOptions,
  });

  port = cyan(port.toString()) as any as number;

  const message = `ReactiveDB started on port ${port}`;

  console.log(
    yellow(`
  ╭────────────────────────────────────────────────────╮
  │                                                    │
  │            ${message}         │
  │                                                    │
  ╰────────────────────────────────────────────────────╯\n`)
  );

  // store offline actions for clients
  let actions = new Map<string, Actions>();
  let client: Actions | any = {};

  const collections = (await instance.DB.listCollections().toArray()).map(
    ({ name }) => name
  );

  // dispatch custom or internal events
  reactiveEvents.attach(({ to, data, event }) => {
    server.to(
      to,
      JSON.stringify({
        data: data ?? {},
        event,
      })
    );
  });

  // dispatch clients events
  for (const collection of collections) {
    server.on(collection, async (_packet) => {
      const packet = _packet as IPacket;

      const data = instance.DB.collection(collection);
      const { event, uuid, ...userData } = packet.message;

      // initial load event
      if (event === MutableEvents.Load) {
        server.to(
          collection,
          JSON.stringify({
            uuid: uuid,
            data: {},
            event,
          })
        );

        // register offline client actions
        actions.set(uuid!, { ...client, actions: packet.message.actions });
        client = {};
      }

      // add item event
      if (event === MutableEvents.Add) {
        const doc = await data.insertOne(userData);

        server.to(
          collection,
          JSON.stringify({
            event,
            data: {
              id: doc,
            },
          })
        );
      }

      // remove item event
      if (event === MutableEvents.Remove) {
        const { id } = userData?.data;

        await data.deleteOne({ _id: new ObjectId(id) });

        server.to(
          collection,
          JSON.stringify({
            event,
            data: {
              id,
            },
          })
        );
      }

      // update item event
      if (event === MutableEvents.Change) {
        const { id, new: New } = userData.data;

        await data.updateOne({ _id: new ObjectId(id) }, { $set: { ...New } });

        server.to(
          collection,
          JSON.stringify({
            event,
            data: {
              id,
            },
          })
        );
      }
    });
  }

  server.on("connect", ({ from }) => (client.id = from.id));

  server.on("disconnect", (packet) => {
    const { from } = packet as IPacket;

    if (actions.has(from.id)) {
      actions.forEach((value, key) => {
        if (from.id === key) {
          value.actions.forEach(async ({ action, data, on }) => {
            const db = instance.DB.collection(on);

            if (action === MutableEvents.Add) {
              const doc = await db.insertOne(data);

              server.to(
                on,
                JSON.stringify({
                  event: action,
                  data: { id: doc },
                })
              );
            }

            if (action === MutableEvents.Remove) {
              const { id } = data;

              await db.deleteOne({ _id: new ObjectId(id) });

              server.to(
                on,
                JSON.stringify({
                  event: action,
                  data: { id },
                })
              );
            }

            if (action === MutableEvents.Change) {
              const { new: New, id } = data;

              await db.updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...New } }
              );

              server.to(
                on,
                JSON.stringify({
                  event: action,
                  data: { id },
                })
              );
            }
          });
        }
      });

      actions.delete(from.id);
    }
  });

  await server.start();
}

export function Handler(fn: SFunction) {
  return fn;
}

export function HandlerMiddlewares(middlewares: Middleware[]) {
  return middlewares;
}

const generateKey = crypto.subtle.generateKey;

type GenerateKeyTypes = Parameters<typeof generateKey>;

export class Crypto {
  #algorithm: GenerateKeyTypes[0] | AesKeyGenParams | HmacKeyGenParams;
  #keyUsages: GenerateKeyTypes[2];
  #extractable: GenerateKeyTypes[1];
  #jsonWebKey: JsonWebKey | null = null;
  #criptoKey: Awaited<ReturnType<typeof generateKey>> | null = null;

  constructor(
    algorithm: GenerateKeyTypes[0] | AesKeyGenParams | HmacKeyGenParams,
    extractable: boolean,
    keyUsages: KeyUsage[]
  ) {
    this.#algorithm = algorithm;
    this.#extractable = extractable;
    this.#keyUsages = keyUsages;
  }

  public async generateKey() {
    this.#criptoKey = await crypto.subtle.generateKey(
      this.#algorithm,
      this.#extractable,
      this.#keyUsages
    );
  }

  public async exportToJWKBase64() {
    this.#jsonWebKey = await crypto.subtle.exportKey(
      "jwk",
      this.#criptoKey as CryptoKey
    );

    const jwk = this.#jsonWebKey;

    return {
      toBase64() {
        return btoa(JSON.stringify(jwk));
      },
    };
  }

  public async importFromJWKBase64(base64: string) {
    const jwk = JSON.parse(atob(base64)) as JsonWebKey;

    return await crypto.subtle.importKey(
      "jwk",
      jwk,
      this.#algorithm,
      this.#extractable,
      this.#keyUsages
    );
  }
}

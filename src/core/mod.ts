/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Actions, IPacket, ReactiveCoreProps } from "../types.ts";
import { MutableEvents, transform } from "../shared/utils.ts";
import { cyan, yellow } from "../../imports/fmt.ts";
import { Bson } from "../../imports/mongo.ts";
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
  secret,
}: ReactiveCoreProps) {
  // Run websockets server
  const instance = await server.init({
    database: connection,
    hostname: "0.0.0.0",
    port,
    secret,
  });

  port = cyan(port.toString()) as any as number;

  const message = `ReactiveDB started in http://localhost:${port}`;

  console.log(
    yellow(`
  ╭────────────────────────────────────────────────────╮
  │                                                    │
  │    ${message}     │
  │                                                    │
  ╰────────────────────────────────────────────────────╯\n`)
  );

  // store offline actions for clients
  let actions = new Map<string, Actions>();
  let client: Actions | any = {};

  const collections = await instance.DB.listCollectionNames();

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
      const finds = await data
        .find(undefined, { noCursorTimeout: false })
        .toArray();
      const { event, uuid, ...userData } = packet.message;

      // initial load event
      if (event === MutableEvents.Load) {
        if (finds.length === 0) {
          server.to(
            collection,
            JSON.stringify({
              data: [],
              uuid: uuid ?? "",
              event,
            })
          );
        } else {
          server.to(
            collection,
            JSON.stringify({
              data: [...transform(finds)],
              uuid: uuid ?? "",
              event,
            })
          );
        }

        // register offline client actions
        actions.set(uuid!, { ...client, actions: packet.message.actions });
        client = {};
      }

      // add item event
      if (event === MutableEvents.Add) {
        await data.insertOne(userData);
        const finds = await data
          .find(undefined, { noCursorTimeout: false })
          .toArray();

        server.to(
          collection,
          JSON.stringify({
            event,
            data: [...transform(finds)],
          })
        );
      }

      // get item event
      if (event === MutableEvents.Get) {
        if (finds.length === 0) {
          server.to(
            collection,
            JSON.stringify({
              data: [],
              uuid: uuid ?? "",
              event,
            })
          );
        } else {
          server.to(
            collection,
            JSON.stringify({
              data: [...transform(finds)],
              uuid: uuid ?? "",
              event,
            })
          );
        }
      }

      // remove item event
      if (event === MutableEvents.Remove) {
        const { id } = userData?.data;

        await data.deleteOne({ _id: new Bson.ObjectId(id) });
        const finds = await data
          .find(undefined, { noCursorTimeout: false })
          .toArray();

        server.to(
          collection,
          JSON.stringify({
            event,
            data: [...transform(finds)],
          })
        );
      }

      // update item event
      if (event === MutableEvents.Change) {
        const { id, new: New } = userData.data;

        await data.updateOne(
          { _id: new Bson.ObjectId(id) },
          { $set: { ...New } }
        );

        const finds = await data
          .find(undefined, { noCursorTimeout: false })
          .toArray();

        server.to(
          collection,
          JSON.stringify({
            event,
            data: [...transform(finds)],
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
              await db.insertOne(data);
              const finds = await db
                .find(undefined, { noCursorTimeout: false })
                .toArray();

              server.to(
                on,
                JSON.stringify({
                  event: action,
                  data: [...transform(finds)],
                })
              );
            }

            if (action === MutableEvents.Remove) {
              const { id } = data;

              await db.deleteOne({ _id: new Bson.ObjectId(id) });
              const finds = await db
                .find(undefined, { noCursorTimeout: false })
                .toArray();

              server.to(
                on,
                JSON.stringify({
                  event: action,
                  data: [...transform(finds)],
                })
              );
            }

            if (action === MutableEvents.Change) {
              const { new: New, id } = data;

              await db.updateOne(
                { _id: new Bson.ObjectId(id) },
                { $set: { ...New } }
              );
              const finds = await db
                .find(undefined, { noCursorTimeout: false })
                .toArray();

              server.to(
                on,
                JSON.stringify({
                  event: action,
                  data: [...transform(finds)],
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

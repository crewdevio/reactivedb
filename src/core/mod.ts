/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Actions, IPacket, ReactiveCoreProps } from "../types.ts";
import { Logs, MutableEvents, transform } from "../shared/utils.ts";
import { cyan, yellow } from "../../imports/fmt.ts";
import { StartDataBase } from "../database/mod.ts";
import { server } from "../websocket/mod.ts";
import { reactiveEvents } from "./events.ts";

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
  await server.run({
    hostname: "0.0.0.0",
    port,
    database: connection,
    secret,
  });

  port = (cyan(port.toString())) as any as number;

  const message = `ReactiveDB started in http://localhost:${(port)}`;

  console.log(
    yellow(`
  ╭────────────────────────────────────────────────────╮
  │                                                    │
  │    ${message}     │
  │                                                    │
  ╰────────────────────────────────────────────────────╯\n`),
  );

  // store offline actions for clients
  let actions = new Set<Actions>([]);
  let client: Actions | any = {};

  const instance = (await StartDataBase(connection))!;
  Logs.info("Database started for Realtime core");

  const collections = await instance.Database.listCollectionNames();

  server.on("[/collections/*]", () => {
    server.to(
      "[/collections/*]",
      JSON.stringify({
        data: [collections],
        event: "[/collections/*]",
      }),
    );
  });

  // dispatch custom or internal events
  reactiveEvents.attach(({ to, data, event }) => {
    server.to(
      to,
      JSON.stringify({
        data: data ?? {},
        event,
      }),
    );
  });

  // dispatch clients events
  for (const collection of collections) {
    server.on(collection, async (_packet) => {
      const packet = _packet as IPacket;

      const data = instance.Database.collection(collection);
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
            }),
          );
        } else {
          server.to(
            collection,
            JSON.stringify({
              data: [...transform(finds)],
              uuid: uuid ?? "",
              event,
            }),
          );
        }

        // register offline client actions
        actions.add({ ...client, actions: packet.message.actions });
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
          }),
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
            }),
          );
        } else {
          server.to(
            collection,
            JSON.stringify({
              data: [...transform(finds)],
              uuid: uuid ?? "",
              event,
            }),
          );
        }
      }

      // remove item event
      if (event === MutableEvents.Remove) {
        await data.deleteOne(userData);
        const finds = await data
          .find(undefined, { noCursorTimeout: false })
          .toArray();

        server.to(
          collection,
          JSON.stringify({
            event,
            data: [...transform(finds)],
          }),
        );
      }

      // update item event
      if (event === MutableEvents.Change) {
        const { old, new: New } = userData.data;

        await data.updateOne(old, { $set: { ...New } });
        const finds = await data
          .find(undefined, { noCursorTimeout: false })
          .toArray();

        server.to(
          collection,
          JSON.stringify({
            event,
            data: [...transform(finds)],
          }),
        );
      }
    });
  }

  server.on("connect", ({ from }) => (client.id = Number(from.id)));

  server.on("disconnect", (packet) => {
    const { from } = packet as IPacket;

    const index = Array.from(actions).findIndex(
      ({ id }) => id === Number(from.id),
    );

    if (index !== -1) {
      // execute offline clients actions
      Array.from(actions).forEach(({ actions, id }) => {
        if (Number(from.id) === id) {
          actions.forEach(async ({ action, data, on }) => {
            const instance = (await StartDataBase(connection))!;
            const db = instance.Database.collection(on);

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
                }),
              );
            }

            if (action === MutableEvents.Remove) {
              await db.deleteOne(data);
              const finds = await db
                .find(undefined, { noCursorTimeout: false })
                .toArray();

              server.to(
                on,
                JSON.stringify({
                  event: action,
                  data: [...transform(finds)],
                }),
              );
            }

            if (action === MutableEvents.Change) {
              await db.updateOne(data.old, { $set: { ...data.new } });
              const finds = await db
                .find(undefined, { noCursorTimeout: false })
                .toArray();

              server.to(
                on,
                JSON.stringify({
                  event: action,
                  data: [...transform(finds)],
                }),
              );
            }
          });
        }
      });

      actions.delete(Array.from(actions)[index]);
    }
  });
}

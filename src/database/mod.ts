/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Logs, parseDataBaseUrl } from "../shared/utils.ts";
import { MongoClient } from "../../imports/mongo.ts";
import type { DataBaseProps } from "../types.ts";

/**
 * create a database connection
 * @param {string | DataBaseProps} connection connection config
 */
export async function StartDataBase(
  connection: string | DataBaseProps = "mongodb://127.0.0.1:27017/Default"
) {
  try {
    const client = new MongoClient();

    if (typeof connection === "string") {
      const { Uri, connectTo } = parseDataBaseUrl(connection);
      await client.connect(Uri);

      return {
        Database: client.database(connectTo),
        client,
      };
    } else if (
      typeof connection === "object" &&
      Object.keys(connection).length
    ) {
      const {
        db,
        tls,
        host,
        port,
        credential: { password, username },
      } = connection;

      await client.connect({
        db,
        tls,
        servers: [
          {
            host,
            port,
          },
        ],
        credential: {
          mechanism: "SCRAM-SHA-1",
          username,
          password,
          db,
        },
      });

      Logs.info("Database started for Realtime and Functions\n");

      return {
        Database: client.database(db),
        client,
      };
    }
  } catch (error: any) {
    console.error(error);
  }
}

export * from "../../imports/mongo.ts";

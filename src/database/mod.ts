/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { MongoClientOptions } from "../../imports/mongodb.ts";
import { MongoClient } from "../../imports/mongodb.ts";
import { Logs } from "../shared/utils.ts";

/**
 * create a database connection
 * @param {string} connection connection config
 */
export async function StartMongoDataBase(
  connection: string,
  options?: MongoClientOptions
) {
  try {
    const client = new MongoClient(connection, options);

    Logs.info("Database started for Realtime and Functions\n");
    return client;
  } catch (error) {
    console.error(error);
  }
}

export * as mongo from "../../imports/mongodb.ts";

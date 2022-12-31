/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { RouterContext } from "../imports/server_oak.ts";
import type { Database as DB } from "../imports/mongo.ts";
import { MongoClient } from "../imports/mongo.ts";
import { Packet } from "./server/mod.ts";

export type ReactiveEvents =
  | "child_removed"
  | "child_changed"
  | "child_added"
  | "load"
  | "get"
  | "value";

export interface ReactiveDBProps {
  uri?: string;
  port?: number | string;
  url?: null | string;
}

export interface ReactiveCoreProps {
  connection: string | DataBaseProps;
  port?: number;
  secret: string;
}

export interface IPacket extends Packet {
  message: {
    event: ReactiveEvents;
    uuid?: string;
    actions: Array<{ action: string; data: any }>;
    data?: any | { data: { old: any; new: any } };
  };
}

export interface Actions {
  id: string;
  actions: Array<{
    action: ReactiveEvents;
    data: any;
    on: string;
  }>;
}

export interface DataBaseProps {
  db: string;
  tls?: boolean;
  host: string;
  port: number;
  certFile?: string;
  compression?: string[];
  safe?: string;
  keyFile?: string;
  keyFilePassword?: string;
  credential: {
    username?: string;
    password?: string;
  };
}

export interface ApiCoreProps {
  port: number;
  database: MongoClient;
  connection: string | DataBaseProps;
}

//@ts-ignore
export interface Context extends RouterContext {}

export type HandlerFunction = (context: Context) => void | Promise<void>;

export type Methods =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "all"
  | "patch"
  | "head"
  | "options";

export interface Utilities {
  /**
   * database instance Object
   */
  Database: DB;
  /**
   * Event handler
   */
  Events: {
    /**
     * dispatch event to all listeners
     * @param {EventSender<T>} sender
     */
    post<T>(sender: EventSender<T>): number;
  };
}

export interface EventSender<T extends any = any> {
  to: string;
  data: T;
  event: "child_removed" | "child_changed" | "child_added";
}

/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Auth as Authentication } from "./auth/mod.ts";
import type { ReactiveEvents } from "../src/types.ts";
import { filterData } from "../src/shared/utils.ts";
import v4 from "../src/libs/uuid/v4.js";
import { parseURL } from "./util.ts";

const validStream = (stream: string) =>
  (!stream.startsWith("Connected to") && stream.includes("{")) ||
  stream.includes("}");

/**
 * launch Client Warning
 * @param {string} message
 */
function ClientWarning(message: string) {
  console.warn(`[ReactiveDB Client]: ${message}`);
}

/**
 * launch Client Error
 * @param {string} message
 */
function ClientError(message: string) {
  return new Error(`[ReactiveDB Client]: ${message}`).message;
}

/**
 * excludes events and collections
 */
const excludes = {
  collection: "[/collections/*]",
};

/**
 * normalize response from database
 */
const fromArray = (data: any[]) => {
  return data.length === 1 ? data[0] : data;
};

export class ReactiveDB {
  #__queqe__: Array<{ event: string; callback: (data: any) => void }>;
  /**
   * actions to registe in handshake
   */
  #__actions__: Array<{ action: string; on: string; data: any }>;
  /**
   * events to listen changes
   */
  #__events__: Record<string, ReactiveEvents>;
  /**
   * websockets instance object
   */
  readonly #__ws__: WebSocket;
  /**
   * client actions ID
   */
  readonly #__uuid__: string;
  #__invalidate__: boolean;
  /**
   * collection to listen
   */
  #__to__: string | null;
  /**
   * server connection url
   */
  #__url__: string;

  /**
   * prevent connect to multiple collections
   */
  #__instance__: boolean = true;

  /**
   * filter for events data
   */
  #__filter__: any = null;

  /**
   * authentication
   */
  public Auth: Authentication;

  constructor(connection: string) {
    const url = parseURL(connection);

    this.Auth = new Authentication(url.toHttp());
    this.#__url__ = url.toWs();
    this.#__ws__ = this.#Websocket();
    this.#__uuid__ = v4.generate();
    this.#__invalidate__ = false;
    this.#__actions__ = [];
    this.#__queqe__ = [];
    this.#__to__ = null;
    this.#__events__ = {
      remove: "child_removed",
      set: "child_changed",
      add: "child_added",
      load: "load",
      value: "value",
      get: "get",
    };

    // wait a timeout
    setTimeout(() => {
      this.#Send({
        to: excludes.collection,
        data: {},
      });
    }, 1000);
  }

  /**
   * websockets instance.
   */
  #Websocket() {
    const url = new URL(this.#__url__);

    // send token and uuid for auth
    url.searchParams.set("x-authorization-token", this.Auth.token?.token!);
    url.searchParams.set("x-authorization-uuid", this.Auth.token?.uuid!);

    return new WebSocket(this.#__url__);
  }

  /**
   * send data to a collection - chanel.
   * @param {{ to: string; data: any; }} param
   */
  #Send({ to, data }: { to: string; data: any }) {
    this.#__ws__.send(
      JSON.stringify({
        send_packet: {
          to,
          message: data,
        },
      })
    );
  }

  /**
   * connected callback
   * @param {(event: Event) => void} callback - handler function
   */
  #Connected(callback = (event?: Event) => {}) {
    this.#__ws__.addEventListener("open", callback);
  }

  /**
   * connects to the collection in the database.
   *
   * `example:`
   * ```typescript
   * import { ReactiveDB } from "./client/mod.ts";
   *
   * const database = new ReactiveDB("ws://localhost:3000");
   *
   * database.connectTo("users", () => console.log("connection ready"));
   *
   * ```
   * @param {string} collection - collection name
   * @param callback - handler function
   */
  public connectTo(collection: string, callback = (_event: Event) => {}): this {
    const filter = filterData(collection);

    this.#__filter__ = filter;

    if (!filter) {
      throw new Error("no valid path").message
    }

    console.log({ filter: this.#__filter__ });

    if (this.#__instance__) {
      this.#__to__ = collection;
      this.#Connected(async (event) => {
        this.#__ws__.send(
          JSON.stringify({
            connect_to: [this.#__to__, excludes.collection],
          })
        );

        callback(event!);
      });

      this.#__instance__ = false;
    } else {
      ClientWarning(
        "you can't connect to multiple collection using only one instance."
      );
    }

    return this;
  }

  /**
   * listens for collection changes in the database.
   *
   * `example:`
   * ```typescript
   * import { ReactiveDB } from "./client/mod.ts";
   *
   * const database = new ReactiveDB("ws://localhost:3000");
   *
   * database.connectTo("apps", () => console.log("connection ready"));
   *
   * database.on("value", (data, event) => {
   *  switch (event) {
   *    case "child_added":
   *      console.log({ data, event });
   *      break;
   *    case "child_delete":
   *      console.log({ data, event });
   *      break;
   *    case "child_changed":
   *      console.log({ data, event });
   *      break;
   *    case "load":
   *      console.log({ data, event });
   *  }
   * });
   * ```
   * @param {ReactiveEvents} evt - main event to listen to "values"
   * @param callback - handler function
   */
  public on<T extends any = any>(
    evt: ReactiveEvents,
    callback = (_data: T | T[], _event?: ReactiveEvents) => {}
  ) {
    if (!this.#__invalidate__) {
      this.#Connected(() => {
        const uuid = this.#__uuid__;

        this.#Send({
          to: this.#__to__!,
          data: {
            event: this.#__events__.load,
            actions: this.#__actions__,
            uuid,
          },
        });
      });

      this.#__ws__.addEventListener("message", (stream) => {
        // ignore non-json data
        if (validStream(stream.data)) {
          const { message } = JSON.parse(stream.data);
          const { data, uuid = "", event } = JSON.parse(message);

          const isLoadEvent =
            uuid === this.#__uuid__ && event === this.#__events__.load;

          if (event === excludes.collection) {
            if (!data[0].includes(this.#__to__)) {
              throw ClientError(
                `"${this.#__to__}" collection not exists in the database.`
              );
            }
          }

          // initial load event
          if (isLoadEvent) {
            callback(fromArray(data), event);
          }

          if (
            event !== this.#__events__.load &&
            event !== this.#__events__.get &&
            event !== excludes.collection &&
            evt === this.#__events__.value
          ) {
            callback(fromArray(data), event);
          }

          // execute listeners queqe
          this.#__queqe__.forEach(({ event: itemEvent, callback }) => {
            if (itemEvent === event) {
              callback(fromArray(data));
            }
          });
        }
      });

      this.#__invalidate__ = true;
    } // add listener in a queqe
    else {
      this.#__queqe__.push({ event: evt, callback });
    }

    return this;
  }

  /**
   * add a new item to collection.
   * @param data - element to add
   */
  public add(data = {}) {
    if (this.#__ws__.readyState === 1 && Object.keys(data).length) {
      this.#Send({
        to: this.#__to__!,
        data: {
          event: this.#__events__.add,
          ...data,
        },
      });
    }

    return this;
  }

  /**
   * remove data on database
   * @param {any} data
   */
  public remove(data = {}) {
    if (this.#__ws__.readyState === 1 && Object.keys(data).length) {
      this.#Send({
        to: this.#__to__!,
        data: {
          event: this.#__events__.remove,
          ...data,
        },
      });
    }

    return this;
  }

  /**
   * update data on database
   * @param {any} old
   * @param {any} data
   */
  public set(old = {}, data = {}) {
    if (this.#__ws__.readyState === 1 && Object.keys(data).length) {
      this.#Send({
        to: this.#__to__!,
        data: {
          event: this.#__events__.set,
          data: {
            old,
            new: data,
          },
        },
      });
    }

    return this;
  }

  /**
   * get data from database
   * @returns {Promise<any>} data
   */
  public get<T extends any = any>(): Promise<T> {
    return new Promise((resolve) => {
      this.#Send({
        to: this.#__to__!,
        data: {
          event: this.#__events__.get,
          uuid: this.#__uuid__,
        },
      });

      this.#__ws__.addEventListener("message", (stream) => {
        if (validStream(stream.data)) {
          const { message } = JSON.parse(stream.data);
          const { data, uuid = "", event } = JSON.parse(message);

          if (event === "get" && uuid === this.#__uuid__) {
            const response = { data } as T;

            resolve(response);
          }
        }
      });
    });
  }

  /**
   * close connection event
   * @param callback
   */
  public onClose(callback = (_event: CloseEvent) => {}) {
    this.#__ws__!.addEventListener("close", callback);

    const mutations = {
      /**
       * add data when connection close
       * @param {any} data
       * @returns {this}
       */
      add: (data: any = {}) => {
        if (Object.keys(data).length) {
          this.#__actions__.push({
            action: this.#__events__.add,
            on: this.#__to__!,
            data,
          });
        }

        return mutations;
      },

      /**
       * set data when connection close
       * @param {any} data
       * @returns {this}
       */
      set: (old = {}, data = {}) => {
        if (Object.keys(old).length && Object.keys(data).length) {
          this.#__actions__.push({
            action: this.#__events__.set,
            on: this.#__to__!,
            data: { old, new: data },
          });
        }

        return mutations;
      },

      /**
       * remove data when connection close
       * @param {any} data
       * @returns {this}
       */
      remove: (data = {}) => {
        if (Object.keys(data).length) {
          this.#__actions__.push({
            action: this.#__events__.remove,
            on: this.#__to__!,
            data,
          });
        }

        return mutations;
      },
    };

    return mutations;
  }
}

export default ReactiveDB;

/**
 * create a multiples instances
 * @param connection
 */
export function createInstance(connection: string) {
  return () => new ReactiveDB(connection);
}

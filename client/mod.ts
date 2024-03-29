/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ReactiveEvents } from "../src/types.ts";
import { generate } from "../src/libs/uuid/v4.js";
import type { Token } from "./auth/mod.ts";
import { HTTPClient } from "./http.ts";
import { Auth } from "./auth/mod.ts";
import { parseURL } from "./util.ts";

const validStream = (stream: string) =>
  stream.startsWith(`{"from":"Server","to":`);

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
function ClientError(message: string, err?: unknown) {
  return new Error(`[ReactiveDB Client]: ${message}`, {
    cause: err,
  }).message;
}

class ReactiveDB {
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

  #__token__: Token;

  #__client_uuid__: string;

  public api: HTTPClient;

  constructor(connection: string, token: Token) {
    const url = parseURL(connection);

    this.api = new HTTPClient(url.toHttp(), token.token);

    this.#__client_uuid__ = generate();
    this.#__token__ = token;
    this.#__uuid__ = token.uuid;
    this.#__url__ = url.toWs();
    this.#__ws__ = this.#Websocket();
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

    this.#__ws__!.addEventListener("close", (e) => {
      switch (e.code) {
        case 4999:
          throw ClientError(`WS Server Error: ${e.reason}`);
        case 4004:
          throw ClientError(`WS Server: ${e.reason}`);
        default:
          throw ClientError(`WS Server Error: ${e.reason}`);
      }
    });
  }

  /**
   * websockets instance.
   */
  #Websocket() {
    const url = new URL(this.#__url__);

    // send token and uuid for auth
    url.searchParams.set("x-authorization-token", this.#__token__?.token!);
    url.searchParams.set("x-authorization-uuid", this.#__token__?.uuid! ?? "");
    url.searchParams.set("x-client-uuid", this.#__client_uuid__! ?? "");

    return new WebSocket(url.toString());
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
    if (this.#__instance__) {
      this.#__to__ = collection;
      this.#Connected(async (event) => {
        this.#__ws__.send(
          JSON.stringify({
            connect_to: [this.#__to__],
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
        const uuid = `${this.#__uuid__}@${this.#__client_uuid__}`;

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
        // TODO handle non data events
        if (validStream(stream.data)) {
          const { message } = JSON.parse(stream.data);
          const { data, event, uuid } = JSON.parse(message);

          // execute load event only for me
          const isLoadEvent =
            event === this.#__events__.load &&
            uuid === `${this.#__uuid__}@${this.#__client_uuid__}`;

          // initial load event
          if (isLoadEvent) {
            callback(data, event);
          }

          if (
            event !== this.#__events__.load &&
            event !== this.#__events__.get &&
            evt === this.#__events__.value
          ) {
            callback(data, event);
          }

          // execute listeners queqe
          this.#__queqe__.forEach(({ event: itemEvent, callback }) => {
            if (itemEvent === event) {
              callback(data);
            }
          });
        }
      });

      this.#__invalidate__ = true;
    } // add listener in a queqe
    else {
      this.#__queqe__.push({ event: evt, callback });
    }

    // close callback
    return () => this.#__ws__.close();
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
   * @param {string} data
   */
  public remove(id = "") {
    if (this.#__ws__.readyState === 1 && id !== "") {
      this.#Send({
        to: this.#__to__!,
        data: {
          event: this.#__events__.remove,
          data: { id },
        },
      });
    }

    return this;
  }

  /**
   * update data on database
   * @param {string} old
   * @param {any} data
   */
  public set(id = "", data = {}) {
    if (
      this.#__ws__.readyState === 1 &&
      Object.keys(data).length &&
      id !== ""
    ) {
      this.#Send({
        to: this.#__to__!,
        data: {
          event: this.#__events__.set,
          data: {
            id,
            new: data,
          },
        },
      });
    }

    return this;
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
      set: (id = "", data = {}) => {
        if (id !== "" && Object.keys(data).length) {
          this.#__actions__.push({
            action: this.#__events__.set,
            on: this.#__to__!,
            data: { id, new: data },
          });
        }

        return mutations;
      },

      /**
       * remove data when connection close
       * @param {any} data
       * @returns {this}
       */
      remove: (id = "") => {
        if (id !== "") {
          this.#__actions__.push({
            action: this.#__events__.remove,
            on: this.#__to__!,
            data: { id },
          });
        }

        return mutations;
      },
    };

    return mutations;
  }
}

/**
 * create multiples instances
 * @param connection
 */
export function createClient(connection: string, token: Token) {
  return () => new ReactiveDB(connection, token);
}

export type Reactive = ReactiveDB;

export { Auth };

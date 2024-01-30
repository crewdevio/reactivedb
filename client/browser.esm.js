// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

function bytesToUuid(bytes) {
  const bits = [...bytes].map((bit) => {
    const s = bit.toString(16);
    return bit < 0x10 ? "0" + s : s;
  });
  return [
    ...bits.slice(0, 4),
    "-",
    ...bits.slice(4, 6),
    "-",
    ...bits.slice(6, 8),
    "-",
    ...bits.slice(8, 10),
    "-",
    ...bits.slice(10, 16),
  ].join("");
}
new RegExp(
  "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
  "i"
);
function generate() {
  const rnds = crypto.getRandomValues(new Uint8Array(16));
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;
  return bytesToUuid(rnds);
}
const { Deno } = globalThis;
typeof Deno?.noColor === "boolean" ? Deno.noColor : false;
new RegExp(
  [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))",
  ].join("|"),
  "g"
);
var MutableEvents;
(function (MutableEvents) {
  MutableEvents["Remove"] = "child_removed";
  MutableEvents["Change"] = "child_changed";
  MutableEvents["Add"] = "child_added";
  MutableEvents["Load"] = "load";
  MutableEvents["Get"] = "get";
})(MutableEvents || (MutableEvents = {}));
const Routes = {
  id: "/v1/:collection/:id",
  collection: "/v1/:collection",
  schema: "/v1/functions_schema",
  auth: {
    register: "/auth/registeUserWithEmailAndPassword",
    login: "/auth/loginWithEmailAndPassword",
    delete: "/auth/deleteEmailAccount",
    disable: "/auth/disableEmailAccount",
  },
};
class HTTPClient {
  #fetch_config;
  #fetch = globalThis.fetch;
  #url;
  constructor(url, token) {
    this.#url = url;
    this.#fetch_config = {
      headers: {
        token,
      },
    };
  }
  async getDoc(collection, id) {
    const respose = await this.#fetch(
      `${this.#url}${Routes.id
        .replace(":collection", collection)
        .replace(":id", id)}`,
      {
        ...this.#fetch_config,
      }
    );
    return await respose.json();
  }
  async updatetDoc(collection, id, data) {
    const respose = await this.#fetch(
      `${this.#url}${Routes.id
        .replace(":collection", collection)
        .replace("id", id)}`,
      {
        ...this.#fetch_config,
        method: "PATCH",
        headers: {
          ...this.#fetch_config.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    return await respose.json();
  }
  async deleteDoc(id) {}
  async getCollection(collection) {
    const respose = await this.#fetch(
      `${this.#url}${Routes.collection.replace(":collection", collection)}`,
      {
        ...this.#fetch_config,
      }
    );
    return await respose.json();
  }
}
class Auth {
  #url;
  #store = globalThis.localStorage;
  #store_key = "__reactivedb__token__";
  #listeners = [];
  token = this.#store.getItem(this.#store_key)
    ? JSON.parse(this.#store.getItem(this.#store_key))
    : null;
  constructor(connection) {
    this.#url = connection;
  }
  async registeUserWithEmailAndPassword(email, password) {
    const url = new URL(this.#url);
    url.pathname = Routes.auth.register;
    url.searchParams.set("token", this.token?.token);
    url.searchParams.set("uuid", this.token?.uuid);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const data = await response.json();
    if (data?.error) {
      throw new Error(`[ReactiveDB Auth]: ${data?.message}`).message;
    }
    return data;
  }
  async loginWithEmailAndPassword(email, password) {
    const url = new URL(this.#url);
    url.pathname = Routes.auth.login;
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const data = await response.json();
    if (data?.error) {
      throw new Error(`[ReactiveDB Auth]: ${data?.message}`).message;
    }
    this.token = data;
    this.#store.setItem(this.#store_key, JSON.stringify(this.token));
    this.#listeners.forEach((cb) => cb(this.token));
    return this.token;
  }
  onAuthStateChange(callback) {
    this.#listeners.push(callback);
    return () => {
      this.#listeners = [];
    };
  }
  logout() {
    this.token = null;
    this.#store.removeItem(this.#store_key);
    this.#listeners.forEach((cb) => cb(this.token));
  }
}
function parseURL(url) {
  let { protocol, hostname, port } = new URL(url);
  if (!["http:", "https:"].includes(protocol)) {
    throw new Error("only http protocol are allowed: http:// or https://")
      .message;
  }
  const isHTTPS = protocol === "https:";
  port = port ? `:${port}` : "";
  return {
    toWs() {
      const host = hostname === "localhost" ? "127.0.0.1" : hostname;
      return `${isHTTPS ? "wss:" : "ws:"}//${host}${port}/[WebSocket]`;
    },
    toHttp() {
      const host = hostname === "localhost" ? "127.0.0.1" : hostname;
      return `${isHTTPS ? "https:" : "http:"}//${host}${port}`;
    },
  };
}
const validStream = (stream) => stream.startsWith(`{"from":"Server","to":`);
function ClientWarning(message) {
  console.warn(`[ReactiveDB Client]: ${message}`);
}
function ClientError(message, err) {
  return new Error(`[ReactiveDB Client]: ${message}`, {
    cause: err,
  }).message;
}
class ReactiveDB {
  #__queqe__;
  #__actions__;
  #__events__;
  #__ws__;
  #__uuid__;
  #__invalidate__;
  #__to__;
  #__url__;
  #__instance__ = true;
  #__filter__ = null;
  #__parse__url;
  #__token__;
  #__client_uuid__;
  api;
  constructor(connection, token) {
    const url = parseURL(connection);
    this.api = new HTTPClient(url.toHttp(), token.token);
    this.#__client_uuid__ = generate();
    this.#__token__ = token;
    this.#__uuid__ = token.uuid;
    this.#__parse__url = url;
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
    this.#__ws__.addEventListener("close", (e) => {
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
  #Websocket() {
    const url = new URL(this.#__url__);
    url.searchParams.set("x-authorization-token", this.#__token__?.token);
    url.searchParams.set("x-authorization-uuid", this.#__token__?.uuid ?? "");
    url.searchParams.set("x-client-uuid", this.#__client_uuid__ ?? "");
    return new WebSocket(url.toString());
  }
  #Send({ to, data }) {
    this.#__ws__.send(
      JSON.stringify({
        send_packet: {
          to,
          message: data,
        },
      })
    );
  }
  #Connected(callback = (event) => {}) {
    this.#__ws__.addEventListener("open", callback);
  }
  connectTo(collection, callback = (_event) => {}) {
    if (this.#__instance__) {
      this.#__to__ = collection;
      this.#Connected(async (event) => {
        this.#__ws__.send(
          JSON.stringify({
            connect_to: [this.#__to__],
          })
        );
        callback(event);
      });
      this.#__instance__ = false;
    } else {
      ClientWarning(
        "you can't connect to multiple collection using only one instance."
      );
    }
    return this;
  }
  on(evt, callback = (_data, _event) => {}) {
    if (!this.#__invalidate__) {
      this.#Connected(() => {
        const uuid = `${this.#__uuid__}@${this.#__client_uuid__}`;
        this.#Send({
          to: this.#__to__,
          data: {
            event: this.#__events__.load,
            actions: this.#__actions__,
            uuid,
          },
        });
      });
      this.#__ws__.addEventListener("message", (stream) => {
        if (validStream(stream.data)) {
          const { message } = JSON.parse(stream.data);
          const { data, event, uuid } = JSON.parse(message);
          const isLoadEvent =
            event === this.#__events__.load &&
            uuid === `${this.#__uuid__}@${this.#__client_uuid__}`;
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
          this.#__queqe__.forEach(({ event: itemEvent, callback }) => {
            if (itemEvent === event) {
              callback(data);
            }
          });
        }
      });
      this.#__invalidate__ = true;
    } else {
      this.#__queqe__.push({
        event: evt,
        callback,
      });
    }
    return this;
  }
  add(data = {}) {
    if (this.#__ws__.readyState === 1 && Object.keys(data).length) {
      this.#Send({
        to: this.#__to__,
        data: {
          event: this.#__events__.add,
          ...data,
        },
      });
    }
    return this;
  }
  remove(id = "") {
    if (this.#__ws__.readyState === 1 && id !== "") {
      this.#Send({
        to: this.#__to__,
        data: {
          event: this.#__events__.remove,
          data: {
            id,
          },
        },
      });
    }
    return this;
  }
  set(id = "", data = {}) {
    if (
      this.#__ws__.readyState === 1 &&
      Object.keys(data).length &&
      id !== ""
    ) {
      this.#Send({
        to: this.#__to__,
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
  onClose(callback = (_event) => {}) {
    this.#__ws__.addEventListener("close", callback);
    const mutations = {
      add: (data = {}) => {
        if (Object.keys(data).length) {
          this.#__actions__.push({
            action: this.#__events__.add,
            on: this.#__to__,
            data,
          });
        }
        return mutations;
      },
      set: (id = "", data = {}) => {
        if (id !== "" && Object.keys(data).length) {
          this.#__actions__.push({
            action: this.#__events__.set,
            on: this.#__to__,
            data: {
              id,
              new: data,
            },
          });
        }
        return mutations;
      },
      remove: (id = "") => {
        if (id !== "") {
          this.#__actions__.push({
            action: this.#__events__.remove,
            on: this.#__to__,
            data: {
              id,
            },
          });
        }
        return mutations;
      },
    };
    return mutations;
  }
}
function createClient(connection, token) {
  return () => new ReactiveDB(connection, token);
}
export { Auth as Auth };
export { createClient as createClient };

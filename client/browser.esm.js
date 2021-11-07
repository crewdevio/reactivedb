class Auth1 {
  token = null;
  #url;
  constructor(connection) {
    this.#url = connection;
  }
  async registeUserWithEmailAndPassword(email, password) {
    const response = await fetch(
      `${this.#url}/[auth]/registeUserWithEmailAndPassword?token=${
        this.token?.token
      }&uuid=${this.token?.uuid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );
    const data = await response.json();
    if (data?.error) {
      throw new Error(`[ReactiveDB Auth]: ${data?.message}`).message;
    }
    return data;
  }
  async loginWithEmailAndPassword(email, password) {
    const response = await fetch(
      `${this.#url}/[auth]/loginWithEmailAndPassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );
    const data = await response.json();
    if (data?.error) {
      throw new Error(`[ReactiveDB Auth]: ${data?.message}`).message;
    }
    this.token = data;
    return this.token;
  }
}
function bytesToUuid(bytes) {
  const bits = [...bytes].map((bit) => {
    const s = bit.toString(16);
    return bit < 16 ? "0" + s : s;
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
const UUID_RE = new RegExp(
  "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
  "i"
);
function validate(id) {
  return UUID_RE.test(id);
}
function generate() {
  const rnds = crypto.getRandomValues(new Uint8Array(16));
  rnds[6] = (rnds[6] & 15) | 64;
  rnds[8] = (rnds[8] & 63) | 128;
  return bytesToUuid(rnds);
}
const __default = {
  validate,
  generate,
};
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
      return `${
        isHTTPS ? "wss:" : "ws:"
      }//${host}${port}/reactivedb_ws_connection`;
    },
    toHttp() {
      const host = hostname === "localhost" ? "127.0.0.1" : hostname;
      return `${isHTTPS ? "https:" : "http:"}//${host}${port}`;
    },
  };
}
const validStream = (stream) =>
  (!stream.startsWith("Connected to") && stream.includes("{")) ||
  stream.includes("}");
function ClientWarning(message) {
  console.warn(`[ReactiveDB Client]: ${message}`);
}
function ClientError(message) {
  return new Error(`[ReactiveDB Client]: ${message}`).message;
}
const excludes = {
  collection: "[/collections/*]",
};
const fromArray = (data) => {
  return data.length === 1 ? data[0] : data;
};
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
  Auth;
  constructor(connection) {
    const url = parseURL(connection);
    this.Auth = new Auth1(url.toHttp());
    this.#__url__ = url.toWs();
    this.#__ws__ = this.#Websocket();
    this.#__uuid__ = __default.generate();
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
    setTimeout(() => {
      this.#Send({
        to: excludes.collection,
        data: {},
      });
    }, 1000);
  }
  #Websocket() {
    const url = new URL(this.#__url__);
    url.searchParams.set("x-authorization-token", this.Auth.token?.token);
    url.searchParams.set("x-authorization-uuid", this.Auth.token?.uuid);
    return new WebSocket(this.#__url__);
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
            connect_to: [this.#__to__, excludes.collection],
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
        const uuid = this.#__uuid__;
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
          this.#__queqe__.forEach(({ event: itemEvent, callback }) => {
            if (itemEvent === event) {
              callback(fromArray(data));
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
  remove(data = {}) {
    if (this.#__ws__.readyState === 1 && Object.keys(data).length) {
      this.#Send({
        to: this.#__to__,
        data: {
          event: this.#__events__.remove,
          ...data,
        },
      });
    }
    return this;
  }
  set(old = {}, data = {}) {
    if (this.#__ws__.readyState === 1 && Object.keys(data).length) {
      this.#Send({
        to: this.#__to__,
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
  get() {
    return new Promise((resolve) => {
      this.#Send({
        to: this.#__to__,
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
            const response = {
              data,
            };
            resolve(response);
          }
        }
      });
    });
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
      set: (old = {}, data = {}) => {
        if (Object.keys(old).length && Object.keys(data).length) {
          this.#__actions__.push({
            action: this.#__events__.set,
            on: this.#__to__,
            data: {
              old,
              new: data,
            },
          });
        }
        return mutations;
      },
      remove: (data = {}) => {
        if (Object.keys(data).length) {
          this.#__actions__.push({
            action: this.#__events__.remove,
            on: this.#__to__,
            data,
          });
        }
        return mutations;
      },
    };
    return mutations;
  }
}
function createClient1(connection) {
  return () => new ReactiveDB(connection);
}
export { createClient1 as createClient };

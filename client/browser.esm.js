// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const { Deno: Deno1  } = globalThis;
typeof Deno1?.noColor === "boolean" ? Deno1.noColor : true;
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
].join("|"), "g");
var MutableEvents;
(function(MutableEvents) {
    MutableEvents["Remove"] = "child_removed";
    MutableEvents["Change"] = "child_changed";
    MutableEvents["Add"] = "child_added";
    MutableEvents["Load"] = "load";
    MutableEvents["Get"] = "get";
})(MutableEvents || (MutableEvents = {}));
const Routes = {
    id: "/v1/:collection/:id",
    collection: "/v1/:collection",
    schema: "/v1/api_schema",
    auth: {
        register: "/auth/registeUserWithEmailAndPassword",
        login: "/auth/loginWithEmailAndPassword",
        delete: "/auth/deleteEmailAccount",
        disable: "/auth/disableEmailAccount"
    }
};
Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;
class Auth {
    #url;
    token = null;
    constructor(connection){
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
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
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
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const data = await response.json();
        if (data?.error) {
            throw new Error(`[ReactiveDB Auth]: ${data?.message}`).message;
        }
        this.token = data;
        return this.token;
    }
}
function parseURL(url) {
    let { protocol , hostname , port  } = new URL(url);
    if (![
        "http:",
        "https:"
    ].includes(protocol)) {
        throw new Error("only http protocol are allowed: http:// or https://").message;
    }
    const isHTTPS = protocol === "https:";
    port = port ? `:${port}` : "";
    return {
        toWs () {
            const host = hostname === "localhost" ? "127.0.0.1" : hostname;
            return `${isHTTPS ? "wss:" : "ws:"}//${host}${port}/[WebSocket]`;
        },
        toHttp () {
            const host = hostname === "localhost" ? "127.0.0.1" : hostname;
            return `${isHTTPS ? "https:" : "http:"}//${host}${port}`;
        }
    };
}
const validStream = (stream)=>!stream.startsWith("Connected to") && stream.includes("{") || stream.includes("}");
function ClientWarning(message) {
    console.warn(`[ReactiveDB Client]: ${message}`);
}
function ClientError(message, err) {
    return new Error(`[ReactiveDB Client]: ${message}`, {
        cause: err
    }).message;
}
const excludes = {
    collection: "[/collections/*]"
};
const fromArray = (data)=>{
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
    #__parse__url;
    #__token__;
    constructor(connection, token){
        const url = parseURL(connection);
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
            get: "get"
        };
        this.#__ws__.addEventListener("close", (e)=>{
            switch(e.code){
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
        return new WebSocket(url.toString());
    }
    #Send({ to , data  }) {
        this.#__ws__.send(JSON.stringify({
            send_packet: {
                to,
                message: data
            }
        }));
    }
    #Connected(callback = (event)=>{}) {
        this.#__ws__.addEventListener("open", callback);
    }
    connectTo(collection, callback = (_event)=>{}) {
        if (this.#__instance__) {
            this.#__to__ = collection;
            this.#Connected(async (event)=>{
                this.#__ws__.send(JSON.stringify({
                    connect_to: [
                        this.#__to__,
                        excludes.collection
                    ]
                }));
                callback(event);
            });
            this.#__instance__ = false;
        } else {
            ClientWarning("you can't connect to multiple collection using only one instance.");
        }
        return this;
    }
    on(evt, callback = (_data, _event)=>{}) {
        if (!this.#__invalidate__) {
            this.#Connected(()=>{
                const uuid = this.#__uuid__;
                this.#Send({
                    to: this.#__to__,
                    data: {
                        event: this.#__events__.load,
                        actions: this.#__actions__,
                        uuid
                    }
                });
            });
            this.#__ws__.addEventListener("message", (stream)=>{
                if (validStream(stream.data)) {
                    const { message  } = JSON.parse(stream.data);
                    const { data , uuid ="" , event  } = JSON.parse(message);
                    const isLoadEvent = uuid === this.#__uuid__ && event === this.#__events__.load;
                    if (event === excludes.collection) {
                        if (!data[0].includes(this.#__to__)) {
                            throw ClientError(`"${this.#__to__}" collection not exists in the database.`);
                        }
                    }
                    if (isLoadEvent) {
                        callback(fromArray(data), event);
                    }
                    if (event !== this.#__events__.load && event !== this.#__events__.get && event !== excludes.collection && evt === this.#__events__.value) {
                        callback(fromArray(data), event);
                    }
                    this.#__queqe__.forEach(({ event: itemEvent , callback  })=>{
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
                callback
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
                    ...data
                }
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
                        id
                    }
                }
            });
        }
        return this;
    }
    set(id = "", data = {}) {
        if (this.#__ws__.readyState === 1 && Object.keys(data).length && id !== "") {
            this.#Send({
                to: this.#__to__,
                data: {
                    event: this.#__events__.set,
                    data: {
                        id,
                        new: data
                    }
                }
            });
        }
        return this;
    }
    async get(id) {
        try {
            const url = new URL(this.#__parse__url.toHttp());
            if (id) {
                url.pathname = Routes.id.replace(":collection", this.#__to__).replace(":id", id);
            } else {
                url.pathname = Routes.collection.replace(":collection", this.#__to__);
            }
            const request = await fetch(url.toString());
            const data = await request.json();
            return data;
        } catch (error) {
            throw ClientError(error.message);
        }
    }
    onClose(callback = (_event)=>{}) {
        this.#__ws__.addEventListener("close", callback);
        const mutations = {
            add: (data = {})=>{
                if (Object.keys(data).length) {
                    this.#__actions__.push({
                        action: this.#__events__.add,
                        on: this.#__to__,
                        data
                    });
                }
                return mutations;
            },
            set: (id = "", data = {})=>{
                if (id !== "" && Object.keys(data).length) {
                    this.#__actions__.push({
                        action: this.#__events__.set,
                        on: this.#__to__,
                        data: {
                            id,
                            new: data
                        }
                    });
                }
                return mutations;
            },
            remove: (id = "")=>{
                if (id !== "") {
                    this.#__actions__.push({
                        action: this.#__events__.remove,
                        on: this.#__to__,
                        data: {
                            id
                        }
                    });
                }
                return mutations;
            }
        };
        return mutations;
    }
}
function createClient(connection, token) {
    return ()=>new ReactiveDB(connection, token);
}
export { Auth as Auth };
export { createClient as createClient };

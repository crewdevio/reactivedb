class Auth1 {
    token = null;
    #url;
    constructor(connection){
        this.#url = connection;
    }
    async registeUserWithEmailAndPassword(email, password) {
        const response = await fetch(`${this.#url}/[auth]/registeUserWithEmailAndPassword?token=${this.token?.token}&uuid=${this.token?.uuid}`, {
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
        const response = await fetch(`${this.#url}/[auth]/loginWithEmailAndPassword`, {
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
function bytesToUuid(bytes) {
    const bits = [
        ...bytes
    ].map((bit)=>{
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
const UUID_RE = new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", "i");
function validate(id) {
    return UUID_RE.test(id);
}
function generate() {
    const rnds = crypto.getRandomValues(new Uint8Array(16));
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    return bytesToUuid(rnds);
}
const __default = {
    validate,
    generate
};
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
            return `${isHTTPS ? "wss:" : "ws:"}//${host}${port}/reactivedb_ws_connection`;
        },
        toHttp () {
            const host = hostname === "localhost" ? "127.0.0.1" : hostname;
            return `${isHTTPS ? "https:" : "http:"}//${host}${port}`;
        }
    };
}
const validStream = (stream)=>!stream.startsWith("Connected to") && stream.includes("{") || stream.includes("}")
;
function ClientWarning(message) {
    console.warn(`[ReactiveDB Client]: ${message}`);
}
function ClientError(message) {
    return new Error(`[ReactiveDB Client]: ${message}`).message;
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
    Auth;
    constructor(connection){
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
            get: "get"
        };
        setTimeout(()=>{
            this.#Send({
                to: excludes.collection,
                data: {
                }
            });
        }, 1000);
    }
     #Websocket() {
        const url = new URL(this.#__url__);
        url.searchParams.set("x-authorization-token", this.Auth.token?.token);
        url.searchParams.set("x-authorization-uuid", this.Auth.token?.uuid);
        return new WebSocket(this.#__url__);
    }
     #Send({ to , data  }) {
        this.#__ws__.send(JSON.stringify({
            send_packet: {
                to,
                message: data
            }
        }));
    }
     #Connected(callback = (event)=>{
    }) {
        this.#__ws__.addEventListener("open", callback);
    }
    connectTo(collection, callback1 = (_event)=>{
    }) {
        if (this.#__instance__) {
            this.#__to__ = collection;
            this.#Connected(async (event)=>{
                this.#__ws__.send(JSON.stringify({
                    connect_to: [
                        this.#__to__,
                        excludes.collection
                    ]
                }));
                callback1(event);
            });
            this.#__instance__ = false;
        } else {
            ClientWarning("you can't connect to multiple collection using only one instance.");
        }
        return this;
    }
    on(evt, callback2 = (_data, _event)=>{
    }) {
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
                    const { data: data1 , uuid ="" , event  } = JSON.parse(message);
                    const isLoadEvent = uuid === this.#__uuid__ && event === this.#__events__.load;
                    if (event === excludes.collection) {
                        if (!data1[0].includes(this.#__to__)) {
                            throw ClientError(`"${this.#__to__}" collection not exists in the database.`);
                        }
                    }
                    if (isLoadEvent) {
                        callback2(fromArray(data1), event);
                    }
                    if (event !== this.#__events__.load && event !== this.#__events__.get && event !== excludes.collection && evt === this.#__events__.value) {
                        callback2(fromArray(data1), event);
                    }
                    this.#__queqe__.forEach(({ event: itemEvent , callback: callback3  })=>{
                        if (itemEvent === event) {
                            callback3(fromArray(data1));
                        }
                    });
                }
            });
            this.#__invalidate__ = true;
        } else {
            this.#__queqe__.push({
                event: evt,
                callback: callback2
            });
        }
        return this;
    }
    add(data2 = {
    }) {
        if (this.#__ws__.readyState === 1 && Object.keys(data2).length) {
            this.#Send({
                to: this.#__to__,
                data: {
                    event: this.#__events__.add,
                    ...data2
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
    set(id = "", data3 = {
    }) {
        if (this.#__ws__.readyState === 1 && Object.keys(data3).length && id !== "") {
            this.#Send({
                to: this.#__to__,
                data: {
                    event: this.#__events__.set,
                    data: {
                        id,
                        new: data3
                    }
                }
            });
        }
        return this;
    }
    get() {
        return new Promise((resolve)=>{
            this.#Send({
                to: this.#__to__,
                data: {
                    event: this.#__events__.get,
                    uuid: this.#__uuid__
                }
            });
            this.#__ws__.addEventListener("message", (stream)=>{
                if (validStream(stream.data)) {
                    const { message  } = JSON.parse(stream.data);
                    const { data: data4 , uuid ="" , event  } = JSON.parse(message);
                    if (event === "get" && uuid === this.#__uuid__) {
                        const response = {
                            data: data4
                        };
                        resolve(response);
                    }
                }
            });
        });
    }
    onClose(callback4 = (_event)=>{
    }) {
        this.#__ws__.addEventListener("close", callback4);
        const mutations = {
            add: (data5 = {
            })=>{
                if (Object.keys(data5).length) {
                    this.#__actions__.push({
                        action: this.#__events__.add,
                        on: this.#__to__,
                        data: data5
                    });
                }
                return mutations;
            },
            set: (id = "", data6 = {
            })=>{
                if (id !== "" && Object.keys(data6).length) {
                    this.#__actions__.push({
                        action: this.#__events__.set,
                        on: this.#__to__,
                        data: {
                            id,
                            new: data6
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
function createClient(connection) {
    return ()=>new ReactiveDB(connection)
    ;
}
export { createClient as createClient };

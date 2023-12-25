## ReactiveDB realtime database/backend for mongodb (will support postgres, and DenoKV in the future) heavy inspired on firebase, pocketbase and supabase

## (READ) The documentation is still under development so not all the functionalities of reactivedb are yet documented.

> History: The idea of ReactiveDB was born at the beginning of 2020 while I was working for a software company, the project I was in needed to have data synchronization between multiple users, originally we built everything around firebase which worked perfectly, but for client requirements it was necessary to have the entire infrastructure running on my own servers locally, so I was faced with the task of thinking of a solution that would meet these requirements and at the same time allow us not to have to change everything that was already closely coupled to the design from firebase, so ReactiveDB was born from here.

### Original diagram

![original diagram](./static/original-diagram.png)

### So what is ReactiveDB?

ReactiveDB aims, like firebase, supabase, poketbase, to provide a fast backend structure and listen to the changes that occur in the database in real time, but ReactiveDB takes the idea of being a framework/library which makes it easy to integrate it into a project already running or also start a project from scratch.

> example

```ts
import { ReactiveCore, Crypto } from "https://deno.land/x/reactivedb/mod.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";

// load envs
const {
  REACTIVE_USERNAME_DB,
  REACTIVE_PASSWORD_DB,
  REACTIVEE_HOST_DB,
  REACTIVE_DB_NAME,
  REACTIVE_DB_PORT,
  REACTIVE_SERVER_PORT,
  REACTIVE_JWK_BASE_64,
} = await load();

const crypt = new Crypto({ name: "HMAC", hash: "SHA-512" }, true, [
  "sign",
  "verify",
]);

const secretKey = await crypt.importFromJWKBase64(REACTIVE_JWK_BASE_64);

// start reactivedb
await ReactiveCore({
  connection: {
    host: REACTIVEE_HOST_DB,
    db: REACTIVE_DB_NAME,
    port: Number(REACTIVE_DB_PORT),
    tls: true,
    credential: {
      username: REACTIVE_USERNAME_DB,
      password: REACTIVE_PASSWORD_DB,
    },
  },
  port: Number(REACTIVE_SERVER_PORT),
  secretKey,
});
```

With these few lines of code you can have a complete backend and real-time connection with the collections within the database.

If you have a collection let's say "Users" in the database, reactive db will automatically create a rest api and a websockets channel to read and write data automatically.

> example: client deno

```ts
import {
  createClient,
  Auth,
} from "https://deno.land/x/reactivedb/client/mod.ts";

const url = "http://localhost:8080";

const auth = new Auth(url);

// login and auth
const token = await auth.loginWithEmailAndPassword(
  "email@example.com",
  "12345678"
);

// create instance
const ReactiveDB = createClient(url, token!);

// create a client
const client = ReactiveDB();

// connecto to a channel or collection from database
client.connectTo("Users", () => console.log("connected to Users"));

// listen events from collection
client.on("child_added", (data, event) => {
  console.log({ data, event });
});

// perform actions if connection close
client.onClose(() => {
  console.log("disconnected from Users");
});
```

and also exist a Restfull api to all collections

> example

```curl

GET: http://localhost:8080/v1/Users -> get all docs from Users collections

POST: http://localhost:8080/v1/Users '{ "name": "Jhon Doe", "password": "1234" }' -> push new data on Users collection

GET: http://localhost:8080/v1/Users/12345 -> get doc on collection by doc id

PUT, PATCH: http://localhost:8080/v1/Users/12345 '{ "name": "Jhon Smith", "password": "1234" }' -> update the doc from the collection by doc id
```

This rest api is automatic for all collections within the database, using the api automatically sends a notification to clients that are listening for changes.

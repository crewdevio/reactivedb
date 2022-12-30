import { createClient } from "./client/mod.ts";

const client = createClient("http://localhost:4000");

const ws = client();

ws.connectTo("Auth_users", () => {
  console.log("connected");
});

ws.on("value", (data, event) => {
  console.log({ data, event });
});

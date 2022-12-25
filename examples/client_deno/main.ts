import { createClient } from "../../client/mod.ts";

const ReactiveDB = createClient("http://localhost:4000");

const client = ReactiveDB();

client.connectTo("Auth_users", () => console.log("connected to Auth_users"));

client.on("value", (data, event) => {
  console.log({ data, event });
});

client.onClose(() => {
  console.log("disconnected to Auth_users");
});

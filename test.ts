import { createClient } from "./client/mod.ts";

const ReactiveDB = createClient("http://localhost:4000");

const client = ReactiveDB();
const notifications = ReactiveDB();

client.connectTo("users", () => console.log("connected to users"));

client.on("value", (data, event) => {
  console.log({ data, event });
});

notifications.connectTo("notifications", () =>
  console.log("connected to notifications")
);

notifications.on("value", (data, event) => {
  console.log({ data, event });
});

import { createClient, Auth } from "../../client/mod.ts";

const url = "http://localhost:8080";

const auth = new Auth(url);
const token = await auth.loginWithEmailAndPassword(
  "erick@open.com",
  "12345678"
);

const ReactiveDB = createClient(url, token!);

const client = ReactiveDB();

client.connectTo("Auth_users", () => console.log("connected to Auth_users"));

client.on("value", (data, event) => {
  console.log({ data, event });
});

client.onClose(() => {
  console.log("disconnected to Auth_users");
});

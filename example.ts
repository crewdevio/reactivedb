import { createClient, Auth } from "./client/mod.ts";

const url = "http://localhost:4000";

const auth = new Auth(url);

auth.onAuthStateChange((user) => {
  console.log({ user });
});

const token = await auth.token;

const ReactiveDB = createClient(url, token!);

const client = ReactiveDB();

client.connectTo("Auth_users", () => console.log("connected to Auth_users"));

client.on("value", async (data, event) => {
  const d = await client.api.getDoc("Auth_users", "64bde69a2877108555d56b05");

  console.log({ d });
});

client.onClose(() => {
  console.log("disconnected to Auth_users");
});

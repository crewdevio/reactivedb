// import { parse } from "https://deno.land/std@0.119.0/flags/mod.ts";
import { ReactiveCore } from "./mod.ts";

// const { args } = Deno;
// const DEFAULT_PORT = 4000;
// const argPort = parse(args).port as number | null;

// const username = Deno.env.get("USERNAME");
// const password = Deno.env.get("PASSWORD");
// const secret = Deno.env.get("SECRET") ?? "";

await ReactiveCore({
  connection: {
    host: "cluster0-shard-00-02.ssezy.mongodb.net",
    db: "hostifypackagedb",
    port: 27017,
    tls: true,
    credential: {
      username: "buttercubz",
      password: "erick843sosa",
    },
  },
  // port: argPort ? Number(argPort) : DEFAULT_PORT,
  port: 4000,
  secret: "123456",
});

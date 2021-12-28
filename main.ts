import { parse } from "https://deno.land/std@0.119.0/flags/mod.ts";
import { ReactiveCore } from "./mod.ts";

const { args } = Deno;
const DEFAULT_PORT = 4000;
const argPort = parse(args).port as number | null;

const username = Deno.env.get("USERNAME");
const password = Deno.env.get("PASSWORD");
const secret = Deno.env.get("SECRET") ?? "";

await ReactiveCore({
  connection: {
    db: "ReactiveDBAdmin",
    tls: true,
    credential: {
      username,
      password,
      db: "ReactiveDBAdmin",
      mechanism: "SCRAM-SHA-1",
    },
    port: 27017,
    host: "reactivedbadmin-shard-00-01.n3mf7.mongodb.net",
  },
  port: argPort ? Number(argPort) : DEFAULT_PORT,
  secret,
});

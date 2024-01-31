import { ReactiveCore, Crypto, CLSBuilder, mongo } from "../../mod.ts";
import { load } from "../../imports/env.ts";
// import "./rdb_mapper.ts";

// load envs
const {
  REACTIVE_SERVER_PORT,
  REACTIVE_JWK_BASE_64,
  REACTIVE_DB_CONNECTION,
  REACTIVE_DB_NAME,
} = await load();

const crypt = new Crypto({ name: "HMAC", hash: "SHA-512" }, true, [
  "sign",
  "verify",
]);

const secretKey = await crypt.importFromJWKBase64(REACTIVE_JWK_BASE_64);

const rules = CLSBuilder(() => ({
  "/:collection/:id": (params, db, context) => {
    return {
      async read() {
        const { id, collection } = params<"/:collection/:id">();

        const items = db.collection(collection);

        const doc = await items.findOne({ _id: new mongo.ObjectId(id) })!;
        const userReq = await items.findOne({ uuid: context.uuid })!;

        const { uuid } = context;

        if (doc) {
          return true;
        }

        return true;
      },
      write() {
        return {
          create() {
            return false;
          },
          delete() {
            return false;
          },
          update() {
            return false;
          },
        };
      },
    };
  },
}));

await ReactiveCore({
  connection: REACTIVE_DB_CONNECTION,
  port: Number(REACTIVE_SERVER_PORT),
  database: REACTIVE_DB_NAME,
  CLSDefinition: rules,
  secretKey,
});

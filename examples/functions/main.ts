import { ReactiveCore, Crypto, CLSBuilder } from "../../mod.ts";
import { Bson } from "../../imports/mongo.ts";
import { load } from "../../imports/env.ts";
// import "./rdb_mapper.ts";

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

const rules = CLSBuilder(() => ({
  "/:collection/:id": (params, db, context) => {
    return {
      async read() {
        const { id, collection } = params<"/:collection/:id">();

        const items = db.collection(collection);

        const doc = await items.findOne({ _id: new Bson.ObjectId(id) })!;
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
  CLSDefinition: rules,
  mapper: true,
});

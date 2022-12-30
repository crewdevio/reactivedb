import { server } from "./src/websocket/mod.ts"


server.init({
  database: "1234",
  port: 7000,
  secret: "123456"
})
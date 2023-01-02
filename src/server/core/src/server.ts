import type {
  ListenOptionsBase,
  ListenOptionsTls,
} from "../../../../imports/server_oak.ts";
import { Application } from "../../../../imports/server_oak.ts";
import { StartDataBase } from "../../../database/mod.ts";
import type { DataBaseProps } from "../../../types.ts";
import { ITransmitterOptions } from "./interfaces.ts";
import * as mongo from "../../../../imports/mongo.ts";
import { EventEmitter } from "./event_emitter.ts";
import { Transmitter } from "./transmitter.ts";
import { Api } from "../../../api/mod.ts";
import { Client } from "./client.ts";
import { Packet } from "./packet.ts";

/**
 * remove auth from search params
 * @param url
 */
function sanitizeURL(url: string) {
  const [base = "", auth = ""] = url.split("?");

  return {
    base: base.trim(),
    auth: auth.trim(),
  };
}

interface RunOptionsTLS extends ListenOptionsTls {
  database: string | DataBaseProps;
  secret: string;
}

interface RunOptions extends ListenOptionsBase {
  database: string | DataBaseProps;
  secret: string;
}

/**
 * The `SocketServer` class is responsible for creating a users socket server.
 * Similar to how Drash.Http.Server creates a server instance.
 */
export class Server extends EventEmitter {
  /**
   * database connection
   */
  private database_connection: string | DataBaseProps;
  /**
   * A property to hold the Deno server. This property is set in this.run()
   * like so:
   *
   *     this.deno_server = serve();
   */
  public oak_server: Application;

  /**
   * A property to hold the transmitter. The transmitter is in charge of
   * transmitting data throughout the server-client lifecycle.
   */
  private transmitter: Transmitter;

  private secret = "Default";
  private options: RunOptions | RunOptionsTLS | null = null;
  private AbortController: AbortController;

  public Database: mongo.Database | null = null;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param transmitterOptions - See ITransmitterOptions.
   */
  constructor(transmitterOptions?: ITransmitterOptions) {
    super();
    this.transmitter = new Transmitter(this, transmitterOptions);
    this.AbortController = new AbortController();
    this.oak_server = new Application();
    this.database_connection = "";
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Close the server.
   */
  public close(): void {
    this.AbortController.abort();
  }

  /**
   * Handles websocket connection.  After a successful connection, the client
   * will be added to EventEmitter.clients and the server will start listening
   * to events.
   *
   * @param options - See HTTPOptions.
   *
   * @returns A Promise of DenoServer.
   */
  public async init(options: RunOptions | RunOptionsTLS): Promise<{
    server: Application;
    DB: mongo.Database;
  }> {
    this.database_connection = options.database;

    const { Database } = (await StartDataBase(this.database_connection))!;

    this.secret = options.secret;
    this.Database = Database;
    this.options = options;

    await Api(this.Database, this.secret, this.oak_server);
    await this.acceptWebSockets();

    return {
      server: this.oak_server,
      DB: Database,
    };
  }

  /**
   * start server
   */
  public async start() {
    await this.oak_server.listen({
      ...this.options,
      hostname: this.options?.hostname ?? "localhost",
      signal: this.AbortController.signal,
      port: this.options?.port ?? 1557,
    });
  }

  /**
   * Accept incoming web sockets as clients.
   */
  protected async acceptWebSockets() {
    this.oak_server.use(async (ctx) => {
      if (ctx.request.url.pathname === "/[WebSocket]") {
        if (ctx.isUpgradable) {
          const ws = ctx.upgrade();
          const id = ctx.request.url.searchParams.get("client-uid")!;

          const client = super.createClient(id, ws);

          ws.addEventListener("open", async () => {
            await this.transmitter.handlePacket(new Packet(client, `connect`));
          });

          ws.addEventListener("message", async (event) => {
            const message = event.data;

            // Handle binary
            if (message instanceof Uint8Array) {
              this.handleMessageAsBinary(client, message);

              // Handle strings
            } else if (typeof message === "string") {
              await this.handleMessageAsString(client, message);
            }
          });

          ws.addEventListener("close", async () => {
            await this.transmitter.handlePacket(
              new Packet(client, `disconnect`),
            );
            super.removeClient(client.id);
          });
        } else {
          ctx.throw(502);
        }
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Handle a binary message sent by the socket client.
   *
   * @param client - The client instance.
   * @param message - The message the client sent.
   */
  protected async handleMessageAsBinary(client: Client, message: Uint8Array) {
    const decoded = JSON.parse(new TextDecoder().decode(message));
    const packet = new Packet(client, decoded.to, decoded.message);
    return await this.transmitter.handlePacket(packet);
  }

  /**
   * Handle a string message sent by the socket client.
   *
   * @param client - The client instance.
   * @param message - The message the client sent.
   */
  protected async handleMessageAsString(
    client: Client,
    message: string,
  ): Promise<void> {
    switch (message) {
      case "id":
        return client.socket.send(`{ "data": "${client.id}" }`);

      case "ping":
        return client.socket.send(`{ "data": "pong", "time": ${Date.now()} }`);

      case "pong":
        return client.socket.send(`{ "data": "pong", "time": ${Date.now()} }`);

      case "test":
        return client.socket.send(
          `Server started on ${this.options?.hostname}:${this.options?.port}.`,
        );

      // If the message isn't any of the above, then it we expect the message
      // to be a JSON string.

      default:
        return await this.handleMessageAsJsonString(client, message);
    }
  }

  /**
   * Handle a message in the format of a JSON string.
   *
   * @param client - The client instance.
   * @param message - The message the client sent.
   */
  protected async handleMessageAsJsonString(
    client: Client,
    message: string,
  ): Promise<void> {
    try {
      const json = JSON.parse(message);

      // A send_packet message should be in the following format:
      //
      //     {
      //       "send_packet": {
      //         "to": string,
      //         "message": unknown
      //       }
      //     }
      //
      if (json.send_packet) {
        const packet = new Packet(
          client,
          json.send_packet.to,
          json.send_packet.message,
        );
        return await this.transmitter.handlePacket(packet);
      }

      // A connect_to message should be in the following format:
      //
      //     {
      //       "connect_to": [
      //         "array", "of", "channels"
      //       ]
      //     }
      //
      if (json.connect_to) {
        json.connect_to.forEach((channelName: string) => {
          try {
            super.addClientToChannel(channelName, client.id);
            client.socket.send(`Connected to ${channelName}.`);
          } catch (error) {
            client.socket.send(error.message);
          }
        });
        return;
      }

      // A disconnect_from message should be in the following format:
      //
      //     {
      //       "disconnect_from": [
      //         "array", "of", "channels"
      //       ]
      //     }
      //
      if (json.disconnect_from) {
        json.disconnect_from.forEach((channelName: string) => {
          try {
            super.removeClientFromChannel(channelName, client.id);
            client.socket.send(`Disconnected from ${channelName}.`);
          } catch (error) {
            client.socket.send(error.message);
          }
        });
        return;
      }
    } catch (error) {
      client.socket.send(error.message);
    }
  }
}

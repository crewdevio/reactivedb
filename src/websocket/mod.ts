/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Packet, Server } from "./core/mod.ts";

const server = new Server({
  reconnect: true,
  ping_interval: 1000,
  ping_timeout: 1000,
});

export { Packet, server };

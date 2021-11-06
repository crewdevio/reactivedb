/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * get http or ws url
 * @param {string} url
 */
export function parseURL(url: string) {
  let { protocol, hostname, port } = new URL(url);

  if (!["http:", "https:"].includes(protocol)) {
    throw new Error("only http protocol are allowed: http:// or https://")
      .message;
  }

  const isHTTPS = protocol === "https:";

  port = port ? `:${port}` : "";

  return {
    toWs() {
      const host = hostname === "localhost" ? "127.0.0.1" : hostname;

      return `${
        isHTTPS ? "wss:" : "ws:"
      }//${host}${port}/reactivedb_ws_connection`;
    },
    toHttp() {
      const host = hostname === "localhost" ? "127.0.0.1" : hostname;

      return `${isHTTPS ? "https:" : "http:"}//${host}${port}`;
    },
  };
}

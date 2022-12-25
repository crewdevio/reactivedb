/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { cyan, red, yellow } from "../../imports/fmt.ts";

function getDate() {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date());
}

export const Logs = {
  info(message: string) {
    const msg = `${cyan(`[ReactiveDB info] ${getDate()}`)}: ${message}`;
    console.log(msg);

    return msg;
  },
  warning(message: string) {
    const msg = `${yellow(`[ReactiveDB warning] ${getDate()}`)}: ${message}`;
    console.log(msg);

    return msg;
  },
  error(message: string, exit = false) {
    console.log(`${red(`[ReactiveDB error] ${getDate()}`)}: ${message}`);

    if (exit) return Deno.exit(1);
  },
};

/**
 * transform _id from a database Document
 */
export const transform = (documents: any[]) =>
  documents.map(({ _id, ...rest }) => ({ ...rest, _id: _id.toString() }));

export const enum MutableEvents {
  Remove = "child_removed",
  Change = "child_changed",
  Add = "child_added",
  Load = "load",
  Get = "get",
}

export const parseDataBaseUrl = (url: string) => {
  const { protocol, port, hostname, pathname } = new URL(url);

  return {
    Uri: `${protocol}//${hostname.replace("localhost", "127.0.0.1")}:${port}`,
    connectTo: pathname.replaceAll("/", ""),
  };
};

const pathRegx = /^(\/[^\/]+){1,}\/?$/gm;

const detectType = (path: string) => {
  if (/[a-zA-Z]/gim.test(path)) {
    return {
      values: {
        path,
        type: "string",
      },
      collection: path,
      path,
    };
  } else if (/[0-9]/gim.test(path)) {
    return {
      values: {
        path: parseInt(path),
        type: "number",
      },
      collection: path,
      path,
    };
  }
};

const normalizePath = (path: string) => {
  return path
    .trim()
    .split("/")
    .filter((chunk) => {
      return chunk !== "" && chunk.match(/[a-zA-Z]|[0-9]/gim);
    })
    .map(detectType);
};

export function filterData(path: string) {
  if (pathRegx.test(path)) {
    const [collection, ...rest] = path
      .match(pathRegx)
      ?.map(normalizePath)
      .flat(Infinity) as Array<any>;

    return {
      values: [collection, ...rest],
      collection: collection?.path,
      path: [collection, ...rest]?.map(({ path }: any) => path).join("/"),
    };
  } else {
    return detectType(path);
  }
}

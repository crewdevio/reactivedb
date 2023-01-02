/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { importModule, importString } from "../../imports/dynamic_import.ts";
import { IS_DENO_DEPLOY, Logs } from "../shared/utils.ts";
import { join, toFileUrl } from "../../imports/path.ts";
import type { WalkEntry } from "../../imports/fs.ts";
import type { HandlerFunction } from "../types.ts";
import * as colors from "../../imports/fmt.ts";

export async function handleFiles(file: WalkEntry, count: number) {
  const groupRegx = /\[((?:.|\r?\n)+?)\]/gim;

  const [name, method, extention] = file.name.split(".");
  const paths = file.path.split(Deno.build.os === "windows" ? "\\" : "/");
  const [_, ...restPath] = paths;

  const getMethods = (text: string) => {
    const results = text
      .replaceAll("[", "")
      .replaceAll("]", "")
      .split(",")
      .filter((method) => !!method && validateMethods(method.trim(), file));

    return results;
  };

  const validateMethods = (method: string, file: WalkEntry) => {
    const methods = [
      "get",
      "post",
      "put",
      "delete",
      "all",
      "patch",
      "head",
      "options",
    ];

    if (!methods.includes(method)) {
      Logs.error(
        colors.red(
          `\n this method ${
            colors.yellow(
              `"${method}"`,
            )
          } is not allowed, in file: ${colors.cyan(`${file.path}`)}\n`,
        ),
        true,
      );
    }

    return method;
  };

  const validateExt = (ext: string, file: WalkEntry) => {
    const extentions = ["ts", "js", "tsx", "jsx"];

    if (!extentions.includes(ext)) {
      Logs.error(
        colors.red(
          `this extention file is not supported ${
            colors.yellow(
              `"${ext}"`,
            )
          } is not supported, in file: ${colors.cyan(`${file.path}`)}\n`,
        ),
        true,
      );
    }

    return ext;
  };

  const routes = restPath.map((path) => {
    if (path.startsWith(`${name}.`)) {
      return name === "index" ? "" : name;
    }
    return path;
  }) as string[];

  let route = [
    "/",
    routes.map((route) => route.replace("$$", ":")).join("/"),
  ].join("");

  if (route.length > 1 && route.endsWith("/") && route.startsWith("/")) {
    route = route.substring(0, route.length - 1);
  }

  let handlerFunction;

  if (IS_DENO_DEPLOY) {
    handlerFunction = (
      await importModule(toFileUrl(join(Deno.cwd(), file.path)).href)
    )?.default as HandlerFunction | undefined;
  } else {
    handlerFunction = (
      await import(toFileUrl(join(Deno.cwd(), file.path)).href)
    )?.default as HandlerFunction | undefined;
  }

  if (!handlerFunction || typeof handlerFunction !== "function") {
    Logs.error(
      `\n in ${
        colors.green(
          file.path,
        )
      }\n file should export a function by default: ${`${
        colors.magenta(
          "export default",
        )
      } ${colors.green("function")}${colors.red("(")}ctx, utils${
        colors.red(
          ")",
        )
      } ${colors.red("{")} ... ${colors.red("}")}\n`}`,
      true,
    );

    handlerFunction = (ctx: any) => {};
  }

  return {
    name,
    path: file.path,
    route,
    handler: handlerFunction!,
    extention: validateExt(extention, file),
    methods: groupRegx.test(method)
      ? getMethods(method)
      : validateMethods(method, file),
  };
}

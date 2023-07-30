import { Database } from "../../imports/mongo.ts";
import { ExctractParams } from "../types.ts";
import { join } from "../../imports/path.ts";

type RuleResponse<T extends boolean = boolean> = Promise<T> | T;

interface WriteMethods {
  update: () => RuleResponse;
  delete: () => RuleResponse;
  create: () => RuleResponse;
}

type WriteResponse = WriteMethods | boolean;

export interface CLSDefinition {
  [key: string]: (
    params: <T>() => ExctractParams<T>,
    db: Database,
    context: {
      uuid: string;
      email: string;
      auth: boolean;
    }
  ) => {
    read?: () => RuleResponse;
    write?: () => WriteResponse;
  };
}

type Builder = () => CLSDefinition;

export function CLSBuilder(callback: Builder) {
  const definitions = callback();

  const rawPaths = Object.keys(definitions);
  const paths = rawPaths.map((path) => join("/v1/", path));

  const definition = paths.reduce((prev, current, index) => {
    return {
      ...prev,
      [current]: definitions[rawPaths[index]],
    };
  }, {}) as CLSDefinition;

  return definition;
}

import { Kind } from "../../deps.ts";

import { astFromType } from './astFromType.ts';

export function updateArgument(
  argName: string,
  argType: any,
  argumentNodes: Record<string, any>,
  variableDefinitionsMap: Record<string, any>,
  variableValues: Record<string, any>,
  newArg: any
): void {
  let varName;
  let numGeneratedVariables = 0;
  do {
    varName = `_v${(numGeneratedVariables++).toString()}_${argName}`;
  } while (varName in variableDefinitionsMap);

  argumentNodes[argName] = {
    kind: Kind.ARGUMENT,
    name: {
      kind: Kind.NAME,
      value: argName,
    },
    value: {
      kind: Kind.VARIABLE,
      name: {
        kind: Kind.NAME,
        value: varName,
      },
    },
  };
  variableDefinitionsMap[varName] = {
    kind: Kind.VARIABLE_DEFINITION,
    variable: {
      kind: Kind.VARIABLE,
      name: {
        kind: Kind.NAME,
        value: varName,
      },
    },
    type: astFromType(argType),
  };

  if (newArg === undefined) {
    delete variableValues[varName];
  } else {
    variableValues[varName] = newArg;
  }
}

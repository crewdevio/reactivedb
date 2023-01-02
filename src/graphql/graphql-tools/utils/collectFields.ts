import {
  getDirectiveValues,
  GraphQLIncludeDirective,
  GraphQLSkipDirective,
  isAbstractType,
  Kind,
  typeFromAST,
} from "../../deps.ts";

import type { GraphQLExecutionContext } from "./Interfaces.ts";

/**
 * Given a selectionSet, adds all of the fields in that selection to
 * the passed in map of fields, and returns it at the end.
 *
 * CollectFields requires the "runtime type" of an object. For a field which
 * returns an Interface or Union type, the "runtime type" will be the actual
 * Object type returned by that field.
 *
 * @internal
 */
export function collectFields(
  exeContext: GraphQLExecutionContext,
  runtimeType: any,
  selectionSet: any,
  fields: Record<string, Array<any>>,
  visitedFragmentNames: Record<string, boolean>,
): Record<string, Array<any>> {
  for (const selection of selectionSet.selections) {
    switch (selection.kind) {
      case Kind.FIELD: {
        if (!shouldIncludeNode(exeContext, selection)) {
          continue;
        }
        const name = getFieldEntryKey(selection);
        if (!(name in fields)) {
          fields[name] = [];
        }
        fields[name].push(selection);
        break;
      }
      case Kind.INLINE_FRAGMENT: {
        if (
          !shouldIncludeNode(exeContext, selection) ||
          !doesFragmentConditionMatch(exeContext, selection, runtimeType)
        ) {
          continue;
        }
        collectFields(
          exeContext,
          runtimeType,
          selection.selectionSet,
          fields,
          visitedFragmentNames,
        );
        break;
      }
      case Kind.FRAGMENT_SPREAD: {
        const fragName = selection.name.value;
        if (
          visitedFragmentNames[fragName] ||
          !shouldIncludeNode(exeContext, selection)
        ) {
          continue;
        }
        visitedFragmentNames[fragName] = true;
        const fragment = exeContext.fragments[fragName];
        if (
          !fragment ||
          !doesFragmentConditionMatch(exeContext, fragment, runtimeType)
        ) {
          continue;
        }
        collectFields(
          exeContext,
          runtimeType,
          fragment.selectionSet,
          fields,
          visitedFragmentNames,
        );
        break;
      }
    }
  }
  return fields;
}

/**
 * Determines if a field should be included based on the @include and @skip
 * directives, where @skip has higher precedence than @include.
 */
function shouldIncludeNode(
  exeContext: GraphQLExecutionContext,
  node: any,
): boolean {
  const skip: any = getDirectiveValues(
    GraphQLSkipDirective,
    node,
    exeContext.variableValues,
  );

  if (skip?.if === true) {
    return false;
  }

  const include: any = getDirectiveValues(
    GraphQLIncludeDirective,
    node,
    exeContext.variableValues,
  );

  if (include?.if === false) {
    return false;
  }

  return true;
}

/**
 * Determines if a fragment is applicable to the given type.
 */
function doesFragmentConditionMatch(
  exeContext: GraphQLExecutionContext,
  fragment: any,
  type: any,
): boolean {
  const typeConditionNode = fragment.typeCondition;
  if (!typeConditionNode) {
    return true;
  }
  const conditionalType = typeFromAST(exeContext.schema, typeConditionNode);
  if (conditionalType === type) {
    return true;
  }
  if (isAbstractType(conditionalType)) {
    return exeContext.schema.isPossibleType(conditionalType, type);
  }
  return false;
}

/**
 * Implements the logic to compute the key of a given field's entry
 */
function getFieldEntryKey(node: any): string {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return node.alias ? node.alias.value : node.name.value;
}

import {
  isScalarType,
  isEnumType,
  isInterfaceType,
  isUnionType,
  isObjectType,
  isSpecifiedScalarType,
} from "../../deps.ts";

import type { IResolvers } from "./Interfaces.ts";

import { cloneType } from "./clone.ts";

export function getResolversFromSchema(schema: any): IResolvers {
  const resolvers = Object.create({});

  const typeMap = schema.getTypeMap();

  Object.keys(typeMap).forEach((typeName) => {
    const type = typeMap[typeName];

    if (isScalarType(type)) {
      if (!isSpecifiedScalarType(type)) {
        resolvers[typeName] = cloneType(type);
      }
    } else if (isEnumType(type)) {
      resolvers[typeName] = {};

      const values = type.getValues();
      values.forEach((value: any) => {
        resolvers[typeName][value.name] = value.value;
      });
    } else if (isInterfaceType(type)) {
      if (type.resolveType != null) {
        resolvers[typeName] = {
          __resolveType: type.resolveType,
        };
      }
    } else if (isUnionType(type)) {
      if (type.resolveType != null) {
        resolvers[typeName] = {
          __resolveType: type.resolveType,
        };
      }
    } else if (isObjectType(type)) {
      resolvers[typeName] = {};

      if (type.isTypeOf != null) {
        resolvers[typeName].__isTypeOf = type.isTypeOf;
      }

      const fields = type.getFields();
      Object.keys(fields).forEach((fieldName) => {
        const field = fields[fieldName];

        resolvers[typeName][fieldName] = {
          resolve: field.resolve,
          subscribe: field.subscribe,
        };
      });
    }
  });

  return resolvers;
}

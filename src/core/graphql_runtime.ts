import {
  basename,
  dirname,
  extname,
  join,
  toFileUrl,
} from "../../imports/path.ts";
import { Application, Router } from "../../imports/server_oak.ts";
import { applyGraphQL, gql, GQLError } from "../graphql/mod.ts";
import { walk } from "../../imports/fs.ts";

export async function handleGraphql(dir: string, app: Application) {
  let typeDefs = null;

  const resolvers: any = {
    Mutation: {},
    Query: {},
  };

  for await (
    const file of walk(dir, {
      exts: ["ts", "js", "graphql"],
    })
  ) {
    if (file.path !== "graphql" && file.name !== "graphql") {
      // parse types
      if (
        file.isFile &&
        file.name === "$types.graphql" &&
        file.path === "graphql/$types.graphql"
      ) {
        const ast = gql`
          ${(await Deno.readTextFile(file.path)).trim()}
        `;

        typeDefs = ast;
      }

      // parse mutations
      if (
        dirname(file.path) === "graphql/Mutations" &&
        [".ts", ".js"].includes(extname(file.name))
      ) {
        const importeer = await import(
          toFileUrl(join(Deno.cwd(), file.path)).href
        );

        const handler = importeer.default;
        const name = file.name.split(".").at(0)!;

        resolvers.Mutation[name] = handler;
      }

      // parse querys
      if (
        dirname(file.path) === "graphql/Querys" &&
        [".ts", ".js"].includes(extname(file.name))
      ) {
        const importeer = await import(
          toFileUrl(join(Deno.cwd(), file.path)).href
        );

        const handler = importeer.default;
        const name = file.name.split(".").at(0)!;

        resolvers.Query[name] = handler;
      }
    }
  }

  const GraphQLService = await applyGraphQL({
    Router,
    // @ts-ignore
    typeDefs,
    resolvers: resolvers,
  });

  app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

  return {
    typeDefs,
    resolvers,
  };
}

import { Routes } from "../src/shared/utils.ts";

export class HTTPClient {
  #fetch_config: RequestInit;

  #fetch = globalThis.fetch;

  #url: string;

  constructor(url: string, token: string) {
    this.#url = url;
    this.#fetch_config = {
      headers: {
        token,
      },
    };
  }

  public async getDoc<T extends unknown = any>(
    collection: string,
    id: string
  ): Promise<T> {
    const respose = await this.#fetch(
      `${this.#url}${Routes.id
        .replace(":collection", collection)
        .replace(":id", id)}`,
      {
        ...this.#fetch_config,
      }
    );

    return (await respose.json()) as T;
  }

  public async updatetDoc<T extends unknown = any>(
    collection: string,
    id: string,
    data: T
  ): Promise<T> {
    const respose = await this.#fetch(
      `${this.#url}${Routes.id
        .replace(":collection", collection)
        .replace("id", id)}`,
      {
        ...this.#fetch_config,
        method: "PATCH",
        headers: {
          ...this.#fetch_config.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    return (await respose.json()) as T;
  }

  public async deleteDoc(id: string) {}

  public async getCollection<T extends unknown = any>(
    collection: string
  ): Promise<T[]> {
    const respose = await this.#fetch(
      `${this.#url}${Routes.collection.replace(":collection", collection)}`,
      {
        ...this.#fetch_config,
      }
    );

    return (await respose.json()) as T[];
  }
}

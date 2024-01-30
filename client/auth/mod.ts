/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Routes } from "../../src/shared/utils.ts";

export interface Token {
  email: string;
  uuid: string;
  token: string;
}

type Listener = (user: Token | null) => void | Promise<void>;

/**
 * authentication module
 */
export class Auth {
  #url: string;

  #store = globalThis.localStorage;

  #store_key = "__reactivedb__token__";

  #listeners: Listener[] = [];

  public token: Token | null = this.#store.getItem(this.#store_key)
    ? (JSON.parse(this.#store.getItem(this.#store_key)!) as Token)
    : null;

  constructor(connection: string) {
    this.#url = connection;
  }

  /**
   * registe a user using email and password.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{}>}
   */
  async registeUserWithEmailAndPassword(email: string, password: string) {
    const url = new URL(this.#url);

    url.pathname = Routes.auth.register;
    url.searchParams.set("token", this.token?.token!);
    url.searchParams.set("uuid", this.token?.uuid!);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data?.error) {
      throw new Error(`[ReactiveDB Auth]: ${data?.message}`).message;
    }

    return data;
  }

  /**
   * registe a user using email and password.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ uuid: string; email: string; token: string;}> | undefined}
   */
  async loginWithEmailAndPassword(email: string, password: string) {
    const url = new URL(this.#url);

    url.pathname = Routes.auth.login;

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data?.error) {
      throw new Error(`[ReactiveDB Auth]: ${data?.message}`).message;
    }

    this.token = data;

    this.#store.setItem(this.#store_key, JSON.stringify(this.token));

    this.#listeners.forEach((cb) => cb(this.token));

    return this.token;
  }

  onAuthStateChange(callback: Listener) {
    this.#listeners.push(callback);

    return () => {
      this.#listeners = [];
    };
  }

  logout() {
    this.token = null;

    this.#store.removeItem(this.#store_key);
    this.#listeners.forEach((cb) => cb(this.token));
  }
}

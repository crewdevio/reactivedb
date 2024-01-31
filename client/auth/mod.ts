/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Routes } from "../../src/shared/utils.ts";
import { Evt } from "../../imports/evt.ts";

const events = new Evt<AuthEvent>();

export interface Token {
  email: string;
  uuid: string;
  token: string;
}

type Listener = (user: Token | null, session: boolean) => void | Promise<void>;
type AuthEvent = { token: Token | null; session: boolean };

/**
 * authentication module
 */
export class Auth {
  #url: string;

  public token: Token | null = Auth.store.getItem(Auth.store_key)
    ? (JSON.parse(Auth.store.getItem(Auth.store_key)!) as Token)
    : null;

  private static get store_key() {
    return globalThis?.Deno
      ? "__reactivedb__token__"
      : "__reactivedb__token__web__";
  }

  private static get store() {
    return globalThis.localStorage;
  }

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

    Auth.store.setItem(Auth.store_key, JSON.stringify(this.token));

    events.post({
      token: this.token,
      session: !!this.token,
    });

    return this.token;
  }

  /**
   * change password for current user
   */
  async changePassword(current: string, update: string) {}

  /**
   * listen auth state changes
   */
  onAuthStateChange(callback: Listener) {
    events.attach(({ session, token }) => {
      callback(token, session);
    });

    events.post({
      token: this.token,
      session: !!this.token,
    });

    return () => events.detach();
  }

  logout() {
    this.token = null;

    Auth.store.removeItem(Auth.store_key);

    events.post({
      token: this.token,
      session: !!this.token,
    });
  }
}

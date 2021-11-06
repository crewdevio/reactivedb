/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * authentication module
 */
export class Auth {
  public token: { email: string; uuid: string; token: string } | null = null;
  #url: string;
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
    const response = await fetch(
      `${this.#url}/[auth]/registeUserWithEmailAndPassword?token=${this.token
        ?.token}&uuid=${this.token?.uuid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

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
    const response = await fetch(
      `${this.#url}/[auth]/loginWithEmailAndPassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

    const data = await response.json();

    if (data?.error) {
      throw new Error(`[ReactiveDB Auth]: ${data?.message}`).message;
    }

    this.token = data;

    return this.token;
  }
}

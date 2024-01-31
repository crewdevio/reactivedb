import { Auth, createClient } from "../../../client/browser.esm.js";

const url = "https://reactivedbserver-production.up.railway.app";

export const auth = new Auth(url);

export const reactive = createClient(url, auth.token);

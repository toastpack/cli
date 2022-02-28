import { Api } from "./lib/plugins/index.js";
import npmPlugin from "./lib/npm/index.js";

const api = new Api();
api.register(npmPlugin);

console.log(api)
import { Api } from "./packages/@toastpack/api/index.js";
import npmPlugin from "./packages/@toastpack/npmPlugin/index.js";

const api = new Api();
api.register(npmPlugin);

console.log(await api.install('npm', 'pkg', 'wgyt/pkg'))
import { Api } from './packages/@toastpack/api/index.js';
import npmPlugin from './packages/@toastpack/npmPlugin/index.js';
import Signale from './packages/signale/index.js';

const signale = new Signale();
const api = new Api();
api.register(npmPlugin);

signale.success('Operation successful');

console.log(await api.install('npm', 'npm', '1.2.8000'));

import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const defaultConf = {
  internalPlugins: ['git', 'npm'], // name of plugin to be used in path format `../${pluginName}Plugin/index.js`
  externalPlugins: [], // module absolute path
};

async function getPlugins() {
  let plugins = [];

  let { internalPlugins, externalPlugins } = defaultFunction();

  for (let internalPlugin of internalPlugins) {
    plugins.push((await import(`../${internalPlugin}Plugin/index.js`)).default);
  }

  for (let externalPlugin of externalPlugins) {
    plugins.push((await import(externalPlugin)).default);
  }

  return plugins;
}

function defaultFunction () {
  return (
    JSON.parse(readFileSync(join(homedir(), '.toastpack', 'config.json'))) ||
    defaultConf
  );
};

export { defaultFunction as default, defaultConf, getPlugins };

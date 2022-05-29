import { Command } from '../../commander/index.js';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path/posix';
import { homedir } from 'os';
import { getPlugins } from './config.js';

const plugins = await getPlugins();
const commander = new Command();

if (!existsSync(join(homedir(), '.toastpack'))) {
  mkdirSync(join(homedir(), '.toastpack'), { recursive: true });
  writeFileSync(
    join(homedir(), '.toastpack', 'config.json'),
    JSON.stringify({
      internalPlugins: ['git', 'npm'], // name of plugin to be used in path format `../${pluginName}Plugin/index.js`
      externalPlugins: [], // module absolute path
    })
  );
  mkdirSync(join(homedir(), '.toastpack', 'packages'), { recursive: true });
}

if (!existsSync(join(homedir(), '.toastpack', 'packages'))) {
  mkdirSync(join(homedir(), '.toastpack', 'packages'), { recursive: true });
}

if (!existsSync(join(homedir(), '.toastpack', 'config.json'))) {
  writeFileSync(
    join(homedir(), '.toastpack', 'config.json'),
    JSON.stringify({
      internalPlugins: ['git', 'npm'], // name of plugin to be used in path format `../${pluginName}Plugin/index.js`
      externalPlugins: [], // module absolute path
    })
  );
}

plugins.forEach((plugin) => {
  if (plugin.metadata.features.commands) {
    let command = new Command(plugin.metadata.id);
    plugins.commands(command);
    commander.addCommand(command);
  }
});

commander
  .name('toastpack')
  .description('a modern package manager')
  .version('0.0.1')
  .command('install [name...]', 'install one or more packages')
  .alias('i')
  .alias('add')
  .command('uninstall [name...]', 'unlink one or more packages')
  .alias('rm')
  .alias('remove')
  .alias('un')
  .command('config', 'opens toastpack config file in default editor');

commander.parse(process.argv);

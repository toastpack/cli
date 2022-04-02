#!/usr/bin/env -S node --experimental-fetch
import console from './overwriteConsole.js';
import { Command } from '../../commander/index.js';
import { packageStringParse, npmonlylockparse } from '../npmUtils/index.js';
import Enquirer from '../../enquirer/index.js';
import { mkdtempSync } from 'fs';

const commander = new Command();

let plugins = [
  (await import('../npmPlugin/index.js')).default,
  (await import('../gitPlugin/index.js')).default,
];

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
  .version('0.0.1');

commander
  .command('install [name...]')
  .description('install one or more packages')
  .alias('i')
  .action(async (name, options) => {
    let resolved = [];
    for (let item of name) {
      var { prefix, packagename, version } = packageStringParse(item);
      if (prefix == packagename) {
        const result = await new Enquirer.AutoComplete({
          message: 'Choose the source to use',
          choices: plugins.map((source) => source.metadata.name),
        }).run();
        prefix = plugins.find((source) => source.metadata.name == result)
          .metadata.id;
      }
      let plugin = plugins.find((source) => source.metadata.id == prefix);
      if (plugin.metadata.features.installFolder) {
        try {
          let folder = mkdtempSync(`toastpack-${packagename}-`);
          plugin.installFolder(packagename, version, folder);
          resolved.push[
            {
              packagename,
              version,
              folder,
            }
          ];
          name.push(...npmonlylockparse(folder));
        } catch (e) {
          console.error(e);
        }
      } else if (plugin.metadata.features.installTarball) {
        console.fatal(
          `installing ${packagename}@${version} using ${plugin.metadata.id} from tarball isn't implemented yet`
        );
        // TODO: implement installTarball
      } else {
        console.fatal(
          `${plugin.metadata.name} does not support installing packages`
        );
        // TODO: revert to previous state and exit with a code of 1
      }
    }
  });

commander.parse(process.argv);


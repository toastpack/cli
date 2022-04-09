#!/usr/bin/env -S node --experimental-fetch
import console from './overwriteConsole.js';
import { Command } from '../../commander/index.js';
import { packageStringParse, npmonlylockparse, isScoped } from '../npmUtils/index.js';
import Enquirer from '../../enquirer/index.js';
import { mkdtempSync, existsSync, mkdirSync, cpSync, symlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { env, cwd } from 'process';
import { execSync } from 'child_process';

const commander = new Command();

if (!existsSync(join(env.HOME, '.toastpack'))) {
  mkdirSync(join(env.HOME, '.toastpack'), { recursive: true });
  mkdirSync(join(env.HOME, '.toastpack', 'packages'), { recursive: true });
}

let plugins = [
  (await import('../npmPlugin/index.js')).default,
  (await import('../gitPlugin/index.js')).default,
];

function until(conditionFunction) {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout((_) => poll(resolve), 400);
  };

  return new Promise(poll);
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
  .version('0.0.1');

commander
  .command('install [name...]')
  .description('install one or more packages')
  .alias('i')
  .action(async (name, options) => {
    let resolved = [];
    for (let item of name) {
      var { prefix, packagename, version } = packageStringParse(item);
      var resolvefolder = join(
        env.HOME,
        '.toastpack',
        'packages',
        encodeURIComponent(`${prefix}:${packagename}-${version}`)
      );
      if (existsSync(resolvefolder)) {
        resolved.push({
          prefix,
          packagename,
          version,
          resolvefolder,
        });
        continue;
      }
      let plugin = plugins.find((source) => source.metadata.id == prefix);
      if (!plugin) {
        const result = await new Enquirer.AutoComplete({
          message: 'Choose the source to use',
          choices: plugins.map((source) => source.metadata.name),
        }).run();
        prefix = plugins.find((source) => source.metadata.name == result)
          .metadata.id;
        plugin = plugins.find((source) => source.metadata.id == prefix);
      }
      if (plugin.metadata.features.installFolder) {
        try {
          let folder = mkdtempSync(
            join(tmpdir(), `toastpack-${encodeURIComponent(packagename)}-`)
          );
          plugin.installFolder(packagename, version, folder);
          let resolvd = {
            prefix,
            packagename,
            version,
            folder,
            resolvefolder,
          };
          resolved.push(resolvd);
          name.push(...npmonlylockparse(folder));
        } catch (e) {
          console.error(e);
        }
      } else if (plugin.metadata.features.installTarball) {
        try {
          plugin.installTarball(
            packagename,
            version,
            join(tmpdir(), `${encodeURIComponent(packagename)}.tgz`)
          );
          let folder = mkdtempSync(
            join(tmpdir(), `toastpack-${encodeURIComponent(packagename)}-`)
          );
          await until(() => {
            return existsSync(
              join(tmpdir(), `${encodeURIComponent(packagename)}.tgz`)
            );
          });
          execSync(
            `tar -xzf ${join(
              tmpdir(),
              `${encodeURIComponent(packagename)}.tgz`
            )} --strip-components=1 -C ${folder}`
          );
          let resolvd = {
            prefix,
            packagename,
            version,
            folder,
            resolvefolder,
          };
          resolved.push(resolvd);
          name.push(...npmonlylockparse(folder));
        } catch (e) {
          console.error(e);
        }
      } else {
        console.fatal(
          `${plugin.metadata.name} does not support installing packages`
        );
      }
    }
    for (let resolvd of resolved) {
      console.info(resolvd.prefix);
      if (resolvd.folder) {
        cpSync(resolvd.folder, resolvd.resolvefolder, { recursive: true });
      }
      if (!existsSync(join(cwd(), 'node_modules'))) {
        mkdirSync(join(cwd(), 'node_modules'));
      }
      if (!existsSync(join(cwd(), 'node_modules', resolvd.packagename))) {
        if (isScoped(resolvd.packagename)) mkdirSync(join(cwd(), 'node_modules', resolvd.packagename, '..'));
        symlinkSync(
          resolvd.resolvefolder,
          join(cwd(), 'node_modules', resolvd.packagename),
          'dir'
        );
      }
    }
  });

commander.parse(process.argv);


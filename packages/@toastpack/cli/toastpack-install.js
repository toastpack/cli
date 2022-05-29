import console from './overwriteConsole.js';
import { Command } from '../../commander/index.js';
import {
  packageStringParse,
  packageJsonParse,
  isScoped,
} from '../utils/index.js';
import Enquirer from '../../enquirer/index.js';
import { mkdtempSync, existsSync, mkdirSync, cpSync, symlinkSync } from 'fs';
import { join } from 'path/posix';
import { tmpdir, homedir } from 'os';
import { cwd } from 'process';
import { execSync } from 'child_process';
import { getPlugins } from './config.js';

const plugins = await getPlugins();
const program = new Command();

program.parse(process.argv);

const name = program.args;

function until(conditionFunction) {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout((_) => poll(resolve), 400);
  };

  return new Promise(poll);
}

let resolved = [];

for (let item of name) {
  var { prefix, packagename, version } = packageStringParse(item);
  var resolvefolder = join(
    homedir(),
    '.toastpack',
    'packages',
    encodeURIComponent(`${prefix}-${packagename}-${version}`)
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
    prefix = plugins.find((source) => source.metadata.name == result).metadata
      .id;
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
      name.push(...new packageJsonParse(folder).dependencies(true));
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
        )} --strip-components=1 -C ${folder} --force-local` // note: the force-local flag is used to avoid tar trying to resolve the drive letter to another machine while running on Windows
      );
      let resolvd = {
        prefix,
        packagename,
        version,
        folder,
        resolvefolder,
      };
      resolved.push(resolvd);
      name.push(...new packageJsonParse(folder).dependencies(true));
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
  if (resolvd.folder) {
    cpSync(resolvd.folder, resolvd.resolvefolder, { recursive: true });
  }
  if (!existsSync(join(cwd(), 'node_modules'))) {
    mkdirSync(join(cwd(), 'node_modules'));
  }
  if (!existsSync(join(cwd(), 'node_modules', resolvd.packagename))) {
    if (isScoped(resolvd.packagename))
      mkdirSync(join(cwd(), 'node_modules', resolvd.packagename, '..'));
    symlinkSync(
      resolvd.resolvefolder,
      join(cwd(), 'node_modules', resolvd.packagename),
      'dir'
    );
  }
}

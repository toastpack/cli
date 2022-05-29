import { readFileSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { execSync } from 'child_process';

export class packageJsonParse {
  constructor(fileLocation) {
    this.data = JSON.parse(
      readFileSync(join(fileLocation, `package.json`), 'utf8')
    );
  }
  dependencies(addPrefix = false) {
    let returned = [];
    Object.entries(this.data.dependencies || {}).forEach((item) => {
      returned.push(`${addPrefix ? 'npm:' : ''}${item[0]}@${item[1]}`);
    });
    return returned;
  }
}

export function isScoped(str) {
  return str.startsWith('@');
}

export function packageStringParse(str) {
  const npmscope = /^(@[^\/]+\/[^@\/]+)(?:@(.+))?/;
  const npmunscope = /^([^@\/]+)(?:@(.+))?/;
  let [prefix, ...rest] = str.split(':');
  const pkg = rest.join(':') || prefix;
  var pkgver = npmscope.exec(pkg) || npmunscope.exec(pkg);
  return {
    prefix,
    packagename: pkgver[1],
    version: pkgver[2] || 'latest',
  };
}

export function open(path) {
  let platform = os.platform();
  if (platform === 'darwin') {
    execSync(`open ${path}`);
  } else if (platform === 'win32') {
    execSync(`start ${path}`);
  } else {
    execSync(`xdg-open ${path}`); // assuming some platforms other than linux have xdg-open, if not we are slightly screwed, except who is running this on aix, *bsd, sunos, or android?
  }
}

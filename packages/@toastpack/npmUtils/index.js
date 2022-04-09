import { readFileSync } from 'fs';
import { join } from 'path';

export function npmonlylockparse(fileLocation) {
  var data = JSON.parse(
    readFileSync(join(fileLocation, `package.json`), 'utf8')
  );
  let returned = [];
  Object.entries(data.dependencies || {}).forEach((item) => {
    returned.push(`npm:${item[0]}@${item[1]}`);
  });
  return returned;
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

export function isScoped(str) {
  return str.startsWith('@');
}

// todo: make general package.json parser

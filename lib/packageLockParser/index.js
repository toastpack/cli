import { readFileSync } from 'fs';
import YAML from '../yaml/index.js';

function npm(fileLocation) {
  var arrayone = Object.entries(
    JSON.parse(readFileSync(`${fileLocation}/package-lock.json`, 'utf8'))[
      'packages'
    ]['']['dependencies'] // usually ./package-lock.json
  );
  var arraytwo = [];
  arrayone.forEach((item) => {
    arraytwo.push({ name: item[0], version: item[1] });
  });
  return arraytwo;
}

function pnpm(fileLocation) {
  var arrayone = Object.entries(
    YAML.parse(readFileSync(`${fileLocation}/pnpm-lock.yaml`, 'utf8'))[
      'specifiers'
    ]
  );
  var arraytwo = [];
  arrayone.forEach((item) => {
    arraytwo.push({ name: item[0], version: item[1] });
  });
  return arraytwo;
}

function yarn(fileLocation) {
  var arrayone = JSON.parse(
    readFileSync(`${fileLocation}/node_modules/.yarn-integrity`, 'utf8')
  )['topLevelPatterns']; // this is an array of strings, not an object with the keys package and version
  var arraytwo = [];
  arrayone.forEach((item) => {
    var orgpkg = /^(@[^\/]+\/[^@\/]+)(?:@([^\/]+))?(\/.*)?$/;
    var pkg = /^([^@\/]+)(?:@([^\/]+))?(\/.*)?$/;
    var m = orgpkg.exec(item) || pkg.exec(item);
    arraytwo.push({
      name: m[1],
      version: m[2],
    });
  });
  return arraytwo;
}

export { npm, pnpm, yarn };

import { readFileSync } from 'fs';

export default (fileLocation) => {
  var data = JSON.parse(readFileSync(`${fileLocation}/package.json`, 'utf8'));
  data.dependencies.forEach((item) => {
    arrayfour.push({ prefix: 'npm', name: item[0], version: item[1] });
  });
  return arrayfour;
};

// todo: make general package.json parser
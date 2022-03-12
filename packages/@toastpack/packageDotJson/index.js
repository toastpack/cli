import { readFileSync } from 'fs';

export default (fileLocation) => {
  var data = JSON.parse(readFileSync(`${fileLocation}/package.json`, 'utf8'));
  let returned = [];
  Object.entries(data.dependencies).forEach((item) => {
    returned.push({ prefix: 'npm', name: item[0], version: item[1] });
  });
  return returned;
};

// todo: make general package.json parser
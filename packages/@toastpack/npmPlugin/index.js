import { mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdir, writeFile } from 'fs/promises';
import { spawnSync } from 'child_process';
import { Plugin } from '../api/index.js';
import packageDotJson from '../packageDotJson/index.js';
import { maxSatisfying, valid, validRange } from '../../semver/semver.cjs';

var ghshorthand =
  /([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\/([a-z\d](?:[a-z\d]|-_\.(?=[a-z\d])){0,99})(#.+)?/i;

var fileshorthand = /(\/|~\/|\.\.\/|\.\/|).+/g;

var plugin = new Plugin(
  'npm',
  'a source that installs packages from npm',
  '0.0.1'
);

plugin.registerSource(
  'npm',
  async (pkg, ver = '*') => {
    var tempDir = mkdtempSync(join(tmpdir(), 'toastpack-'));
    let m;
    if ((m = ghshorthand.exec(ver)) !== null) {
      if (!m[3]) {
        m[3] = '';
      }
      return {
        success: true,
        resolved_folder: tempDir,
        installed_packages: [],
        dependencies: [
          {
            prefix: 'git',
            name: pkg,
            version: `https://github.com/${m[1]}/${m[2]}.git${m[3]}`,
          },
        ],
      };
    } else if (fileshorthand.test(pkg)) {
      return {
        success: true,
        resolved_folder: tempDir,
        installed_packages: [],
        dependencies: [
          {
            prefix: 'file',
            name: pkg,
            version: `https://github.com/${m[1]}/${m[2]}.git${m[3]}`,
          },
        ],
      };
    } else {
      var data = await (
        await fetch(`https://registry.npmjs.org/${pkg}`)
      ).json();
      var packagedotjson = {};
      if (valid(ver)) {
        packagedotjson = data.versions[ver];
      } else if (validRange(ver)) {
        packagedotjson =
          data.versions[maxSatisfying(Object.keys(data.versions), ver)];
      } else {
        packagedotjson = data.versions[data['dist-tags'][ver]];
      }
      var tgzpath = join(tempDir, `${pkg}.tgz`);
      await writeFile(
        tgzpath,
        Buffer.from(
          await (await fetch(packagedotjson.dist.tarball)).arrayBuffer()
        )
      );
      await mkdir(join(tempDir, pkg));
      spawnSync('tar', [
        '-xf',
        tgzpath,
        '--strip-components=1',
        '-C',
        join(tempDir, pkg),
      ]);
      return {
        success: true,
        resolved_folder: tempDir,
        installed_packages: [pkg],
        dependencies: packageDotJson(join(tempDir, pkg)),
      };
    }
  },
  true
);

export default plugin;

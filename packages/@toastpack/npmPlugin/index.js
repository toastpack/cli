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

var plugin = new Plugin(
  'npm',
  'a source that installs packages from npm',
  '0.0.1'
);

plugin.registerSource(
  'npm',
  async (pkg, ver = 'latest') => {
    let m;ghshorthand
    if ((m = ghshorthand.exec(ver)) !== null) {
      return {
        success: true,
        resolved_folder: '',
        installed_packages: [],
        dependencies: [
          {
            prefix: 'git',
            name: pkg,
            version: `https://github.com/${m[1]}/${m[2]}.git${m[3] || ''}`,
          },
        ],
      };
    }
    // TODO: support file stuff
    var data = await (
      await fetch(`https://npmproxy.toastpack.dev/${encodeURI(pkg)}`)
    ).json();
    if (data.error) {
      return {
        success: false,
        error: data.error,
      };
    }
    var tempDir = mkdtempSync(join(tmpdir(), 'toastpack-'));
    var tgzpath = join(tempDir, `${pkg}.tgz`);
    await writeFile(
      tgzpath,
      Buffer.from(
        await (
          await fetch(
            `https://npmProxy.toastpack.dev/${encodeURI(pkg)}/${
              valid(ver) || validRange(ver)
                ? maxSatisfying(data.versions, ver)
                : data.tags[ver]
            }/tgz`
          )
        ).arrayBuffer()
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
  },
  true
);

export default plugin;

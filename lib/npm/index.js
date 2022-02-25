import { mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { writeFile, mkdir } from 'fs/promises';
import { spawn } from 'child_process';
import { Plugin } from '../plugins/index.js';
import { npm } from '../packageLockParser/index.js';

const semver =
  /(?:(?<=^v?|\sv?)(?:(?:0|[1-9]\d{0,9})\.){2}(?:0|[1-9]\d{0,9})(?:-(?:0|[1-9]\d*?|[\da-z-]*?[a-z-][\da-z-]*?){0,100}(?:\.(?:0|[1-9]\d*?|[\da-z-]*?[a-z-][\da-z-]*?))*?){0,100}(?:\+[\da-z-]+?(?:\.[\da-z-]+?)*?){0,100}\b){1,200}/gi;

var plugin = new Plugin(
  'npm source',
  'a source that installs packages from npm',
  '0.0.1'
);
plugin.registerSource(
  'npm',
  async (pkg, ver) => {
    var data = await (await fetch(`https://registry.npmjs.org/${pkg}`)).json();
    var tempDir = mkdtempSync(join(tmpdir(), 'toastpack-'));
    var packagedotjson = {};
    if (semver.test(ver)) {
      packagedotjson = data.versions[ver];
    } else {
      packagedotjson = data.versions[data['dist-tags'][ver]];
    }
    var tgzpath = join(tempDir, `${pkg}.tgz`);
    writeFile(
      tgzpath,
      Buffer.from(
        await (await fetch(packagedotjson.dist.tarball)).arrayBuffer()
      )
    );
    mkdir(join(tempDir, pkg));
    await spawn('tar', [
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
      dependencies: npm(tempDir),
    };
  },
  true
);

export default plugin;
import { spawnSync } from 'child_process';

export default {
  metadata: {
    name: 'git support',
    description: 'a plugin for git support',
    version: '0.0.1',
    id: 'git',
    features: {
      installTarball: false,
      installFolder: true,
      commands: false,
    },
  },
  installFolder: (pkg, ver, path) => {
    spawnSync('git', ['clone', ver, path]);
  },
};


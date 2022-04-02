import { writeFile } from 'fs/promises';

export default {
  metadata: {
    name: 'npm support',
    description: 'a plugin for npm support',
    version: '0.0.1',
    id: 'npm',
    features: {
      installTarball: true,
      installFolder: false,
      commands: false, // TODO: add commands in the future
    },
  },
  installTarball: async(pkg, ver, path) => {
    var data = await(
      await fetch(
        `https://npmproxy.toastpack.dev/${encodeURIComponent(pkg)}/${ver}`
      )
    ).json();
    // if there's an error return it
    if (data.error) {
      return {
        success: false,
        error: data.error,
      };
    }
    // fetch file and save to path provided to us
    await writeFile(
      path,
      Buffer.from(await(await fetch(data.tgz)).arrayBuffer())
    );
  },
};

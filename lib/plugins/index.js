class _PublicApi {
  constructor() {
    this.sources = {};
    this.commands = {};
  }
  register(plugin) {
    this.sources[plugin.source.prefix] = plugin.source.install;
    this.commands[plugin.name] = plugin.commands;
  }
  install(prefix = 'default', package, version = 'latest') {
    var result;
    try {
      result = this.sources[prefix](`${package}@${version}`);
    } catch (e) {
      result = {
        success: false,
        error: e,
        resolved_folder: '',
        installed_packages: [''],
      };
    }
  }
}

var PublicApi = new _PublicApi();

class Plugin {
  constructor(name, description, version) {
    this.name = name;
    this.description = description;
    this.version = version;
    this.source = {
      prefix: undefined,
      install: undefined,
    };
    this.commands = {};
  }
  registerSource(prefix, install) {
    this.source.prefix = prefix;
    this.source.install = install;
  }
  registerCommand(command, action) {
    this.commands[command] = action;
  }
}

export { PublicApi, Plugin };

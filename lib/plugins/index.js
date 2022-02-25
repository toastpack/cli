class Api {
  constructor() {
    this.sources = {};
    this.commands = {};
  }
  register(plugin) {
    this.sources[plugin.source.prefix] = plugin.source.install;
    if (plugin.source.default) {
      this.sources['default'] = plugin.source.install;
    }
    this.commands[plugin.name] = plugin.commands;
  }
  install(prefix = 'default', pkg, ver = 'latest') {
    var result;
    try {
      result = this.sources[prefix](pkg, ver);
    } catch (e) {
      result = {
        success: false,
        error: e,
        resolved_folder: '',
        installed_packages: [''],
        dependencies: [''],
      };
    }
  }
}

class Plugin {
  constructor(name, description, version) {
    this.name = name;
    this.description = description;
    this.version = version;
    this.source = {
      prefix: undefined,
      install: undefined,
      default: undefined,
    };
    this.commands = {};
  }
  registerSource(prefix, install, Default) {
    this.source.prefix = prefix;
    this.source.install = install;
    this.source.default = Default;
  }
  registerCommand(command, action) {
    this.commands[command] = action;
  }
}

export { Api, Plugin };

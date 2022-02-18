class PublicApi {
  constructor() {
    this.sources = {};
    this.commands = {};
  }
  register(plugin) {
    this.sources[plugin.source.prefix] = plugin.source.install;
    this.commands[plugin.name] = plugin.commands;
  }
  install(packagestring) {
    let pkg = packagestring.split(':');
    var result;
    if (pkg.length == 2) {
      try {
        result = this.sources[pkg[0]](pkg[1]);
      } catch (e) {
        result = {
          success: false,
          error: e,
          resolved_folder: '',
          installed_packages: [''],
        };
      }
    } else {
      try {
        result = this.sources['default'](pkg[1]);
      } catch (e) {
        result = {
          success: false,
          error: e,
          resolved_folder: '',
          installed_packages: [''],
        };
      }
    }
    console.log(result)
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

var api = new PublicApi();
var plugin = new Plugin('test', 'test', '1.0.0');
plugin.registerSource('test', () => {
  return {
    success: true,
    error: '',
    resolved_folder: '',
    installed_packages: [''],
  };
});
api.register(plugin);
api.install('test:pkg');
api.install('pkg');

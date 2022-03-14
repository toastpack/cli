import Signale from '../../signale/index.js';

const signale = new Signale({
  disabled: false,
  interactive: true,
  logLevel: 'info',
  scope: 'toastpack',
  stream: process.stdout,
});

signale.config({
  displayScope: true,
  displayBadge: true,
  displayDate: false,
  displayFilename: false,
  displayLabel: true,
  displayTimestamp: false,
  underlineLabel: true,
  underlineMessage: false,
  underlinePrefix: false,
  underlineSuffix: false,
  uppercaseLabel: false,
});

globalThis.oldConsole = Object.assign({}, globalThis.console);

globalThis.console = signale;
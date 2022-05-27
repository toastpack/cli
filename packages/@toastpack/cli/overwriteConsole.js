import Signale from '../../signale/index.js';

var console = new Signale({
  disabled: false,
  interactive: false,
  logLevel: 'info',
  scope: 'toastpack',
  stream: process.stdout,
});

console.config({
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

export default console;
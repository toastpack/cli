import console from './overwriteConsole.js';
import Enquirer from '../../enquirer/index.js';
import { Command } from '../../commander/index.js';
import { open } from '../utils/index.js';
import { join } from 'path';
import { homedir } from 'os';

const program = new Command();

program.parse(process.argv);

console.info(
  'attempting to open ~/.toastpack/config.json using the default app'
);

await open(join(homedir(), '.toastpack', 'config.json'));

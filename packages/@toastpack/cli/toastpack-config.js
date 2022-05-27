import console from './overwriteConsole.js';
import Enquirer from '../../enquirer/index.js';
import { Command } from '../../commander/index.js';

const program = new Command();

program.command('edit', 'Edit the config file').action(() => {

})

program.parse(process.argv);
#!/usr/bin/env node
import './overwriteConsole.js';
import { Command } from '../../commander/index.js';
import Enquirer from '../../enquirer/index.js';

const commander = new Command();

commander
  .name('toastpack')
  .description('a modern package manager')
  .version('0.0.1');

commander
  .command('install [name...]')
  .description('install one or more packages')
  .alias('i')
  .action((name, options) => {
    console.error(
      new Error(
        `Installing a package isn't implemented in the CLI. Installing ${JSON.stringify(
          name
        )} failed.`
      )
    );
  });

commander.parse(process.argv);

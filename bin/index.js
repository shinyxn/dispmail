#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import next from '../src/index.js';
import createAccount from '../src/utils/createAccount.js';
import deleteAccount from '../src/utils/deleteAccount.js';

yargs(hideBin(process.argv))
  .usage('Usage: $0 [command]')
  .command(
    '*',
    '',
    () => {},
    () => next(),
  )
  .command(
    'gen',
    'generate temporary email quickly (overwrite existing account)',
    () => {},
    () => createAccount({ quick: true }),
  )
  .command(
    'reset',
    'reset account',
    () => {},
    () => deleteAccount(),
  )
  .help('h')
  .alias('h', 'help')
  .parse();

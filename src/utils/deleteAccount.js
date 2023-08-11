import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import ora from 'ora';
import config from './config.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const spinner = ora({
  color: 'red',
  spinner: 'pong',
});

export default async function deleteAccount() {
  spinner.start('Deleting account');

  if (!config.get('isLogged')) {
    spinner.fail('Account is already empty');
    return;
  }

  config.clear();

  try {
    await fs.unlink(path.join(dirname, '../../downloads/index.html'));

    setTimeout(() => {
      spinner.succeed('Account and all downloaded email deleted');
      process.exit();
    }, 3000);
  } catch (e) {
    setTimeout(() => {
      spinner.succeed('Account deleted successfully');
      process.exit();
    }, 3000);
  }
}

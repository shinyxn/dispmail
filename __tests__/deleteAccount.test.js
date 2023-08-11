import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import test from 'ava';
import config from '../src/utils/config.js';
import deleteAccount from '../src/utils/deleteAccount.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

test('should delete account', async (t) => {
  await deleteAccount();
  t.false(config.get('isLogged'), 'should not be logged after deleting account');
  t.false(fs.existsSync(path.join(dirname, '../downloads/index.html')), 'downloaded email should be empty');
});

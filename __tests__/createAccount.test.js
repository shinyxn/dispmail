import test from 'ava';
import createAccount from '../src/utils/createAccount.js';
import config from '../src/utils/config.js';

test('should create account', async (t) => {
  await createAccount({ quick: true }, false);
  const expected = config.get('account');
  t.true(config.get('isLogged'), 'should be logged after creating an account');
  t.true(expected.quick);
  t.true(expected.username.length > 0, 'username should not be empty');
  t.regex(expected.email, /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/, 'email should be valid');
});

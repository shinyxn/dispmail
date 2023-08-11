/* eslint-disable arrow-parens */
import test from 'ava';
import getDomain from '../src/utils/getDomain.js';

test.beforeEach(async t => {
  t.context = await getDomain();
});

test('should return success with domain list', t => {
  const res = t.context;

  t.is(res.status, 'success', 'should return success status');
  t.true(Array.isArray(res.data), 'data should be an array');
  t.true(res.data.length > 0, 'data should not be empty');
});

// mocking buat apa?

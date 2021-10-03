import test from 'ava';
import tempy from 'tempy';
import verify from '../lib/verify.js';

test('Verify "ATOM_ACCESS_TOKEN" is set', async (t) => {
  t.deepEqual(await verify({}, {env: {ATOM_ACCESS_TOKEN: 'my_token'}}), []);
});

test('Return SemanticReleaseError if "ATOM_ACCESS_TOKEN" is not set', async (t) => {
  const [error] = await verify({}, {env: {}});

  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'ENOAPMTOKEN');
  t.truthy(error.message);
  t.truthy(error.details);
});

test('Return SemanticReleaseError if "apm" is not installed', async (t) => {
  const [error] = await verify({}, {env: {ATOM_ACCESS_TOKEN: 'my_token', PATH: tempy.directory()}});

  t.is(error.name, 'SemanticReleaseError');
  t.is(error.code, 'ENOAPMCLI');
  t.truthy(error.message);
  t.truthy(error.details);
});

import path from 'path';
import test from 'ava';
import {outputJson, readJson, pathExists} from 'fs-extra';
import execa from 'execa';
import {spy} from 'sinon';
import tempy from 'tempy';
import clearModule from 'clear-module';
import {WritableStreamBuffer} from 'stream-buffers';
import mockServer from './helpers/mockserver';

const env = {
  GITHUB_URL: mockServer.url,
  ATOM_ACCESS_TOKEN: 'ATOM_TOKEN',
  ATOM_HOME: tempy.directory(),
  ATOM_API_URL: mockServer.url,
  ATOM_RESOURCE_PATH: tempy.directory(),
};

test.before(async () => {
  await mockServer.start();
});

test.beforeEach(t => {
  // Clear npm cache to refresh the module state
  clearModule('..');
  t.context.m = require('..');
  t.context.log = spy();
  t.context.stdout = new WritableStreamBuffer();
  t.context.stderr = new WritableStreamBuffer();
  t.context.logger = {log: t.context.log};
});

test.after.always(async () => {
  await mockServer.stop();
});

test('Verify atom token, cli and package', async t => {
  const cwd = tempy.directory();
  const pkg = {name: 'valid-token', version: '0.0.0-dev'};
  await outputJson(path.resolve(cwd, 'package.json'), pkg);
  await t.notThrowsAsync(
    t.context.m.verifyConditions(
      {},
      {
        cwd,
        env: {ATOM_ACCESS_TOKEN: 'my_token'},
        options: {},
        stdout: t.context.stdout,
        stderr: t.context.stderr,
        logger: t.context.logger,
      }
    )
  );
});

test('Throw SemanticReleaseError Array if config option are not valid in verifyConditions', async t => {
  const cwd = tempy.directory();
  const pkg = {};
  await outputJson(path.resolve(cwd, 'package.json'), pkg);

  const errors = [
    ...(await t.throwsAsync(
      t.context.m.verifyConditions(
        {},
        {
          cwd,
          env: {PATH: tempy.directory()},
          stdout: t.context.stdout,
          stderr: t.context.stderr,
          logger: t.context.logger,
        }
      )
    )),
  ];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'ENOAPMTOKEN');
  t.truthy(errors[0].message);
  t.truthy(errors[0].details);
  t.is(errors[1].name, 'SemanticReleaseError');
  t.is(errors[1].code, 'ENOAPMCLI');
  t.truthy(errors[1].message);
  t.truthy(errors[1].details);
  t.is(errors[2].name, 'SemanticReleaseError');
  t.is(errors[2].code, 'ENOPKGNAME');
  t.truthy(errors[2].message);
  t.truthy(errors[2].details);
});

test('Prepare the package', async t => {
  const cwd = tempy.directory();
  const pkg = {name: 'prepare', version: '0.0.0'};
  await outputJson(path.resolve(cwd, 'package.json'), pkg);

  await t.context.m.prepare(
    {},
    {
      cwd,
      env: {ATOM_ACCESS_TOKEN: 'my_token'},
      options: {},
      stdout: t.context.stdout,
      stderr: t.context.stderr,
      logger: t.context.logger,
      nextRelease: {version: '1.0.0'},
    }
  );

  t.is((await readJson(path.resolve(cwd, 'package.json'))).version, '1.0.0');
  t.false(await pathExists(path.resolve(cwd, `${pkg.name}-1.0.0.tgz`)));
});

test('Throw SemanticReleaseError Array if config option are not valid in prepare', async t => {
  const cwd = tempy.directory();
  const pkg = {};
  await outputJson(path.resolve(cwd, 'package.json'), pkg);

  const errors = [
    ...(await t.throwsAsync(
      t.context.m.prepare(
        {},
        {
          cwd,
          env: {PATH: tempy.directory()},
          options: {},
          nextRelease: {version: '1.0.0'},
          stdout: t.context.stdout,
          stderr: t.context.stderr,
          logger: t.context.logger,
        }
      )
    )),
  ];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'ENOAPMTOKEN');
  t.truthy(errors[0].message);
  t.truthy(errors[0].details);
  t.is(errors[1].name, 'SemanticReleaseError');
  t.is(errors[1].code, 'ENOAPMCLI');
  t.truthy(errors[1].message);
  t.truthy(errors[1].details);
  t.is(errors[2].name, 'SemanticReleaseError');
  t.is(errors[2].code, 'ENOPKGNAME');
  t.truthy(errors[2].message);
  t.truthy(errors[2].details);
});

test('Publish the package', async t => {
  const name = 'publish';
  const repositoryUrl = `${mockServer.url}/owner/${name}.git`;
  const cwd = tempy.directory();

  await execa('git', ['init'], {cwd});
  await execa('git', ['config', 'remote.origin.url', repositoryUrl], {cwd});
  const pkg = {name, version: '0.0.0', repository: {url: repositoryUrl}};
  await outputJson(path.resolve(cwd, 'package.json'), pkg);

  const verifyApmMock = await mockServer.mock('/packages', {}, {body: {}, method: 'POST', statusCode: 201});
  const getApmVersionMock = await mockServer.mock(
    `/packages/${name}/versions`,
    {},
    {body: {}, method: 'POST', statusCode: 201}
  );

  const result = await t.context.m.publish(
    {},
    {
      cwd,
      env,
      options: {},
      stdout: t.context.stdout,
      stderr: t.context.stderr,
      logger: t.context.logger,
      nextRelease: {version: '1.0.0', gitTag: 'v1.0.0'},
    }
  );

  await mockServer.verify(verifyApmMock);
  await mockServer.verify(getApmVersionMock);

  t.deepEqual(result, {name: 'Atom package', url: `https://atom.io/packages/${name}`});
  t.is((await readJson(path.resolve(cwd, 'package.json'))).version, '1.0.0');
});

test('Throw SemanticReleaseError Array if config option are not valid in publish', async t => {
  const cwd = tempy.directory();
  const pkg = {};
  await outputJson(path.resolve(cwd, 'package.json'), pkg);

  const errors = [
    ...(await t.throwsAsync(
      t.context.m.publish(
        {},
        {
          cwd,
          env: {PATH: tempy.directory()},
          options: {},
          nextRelease: {version: '1.0.0'},
          stdout: t.context.stdout,
          stderr: t.context.stderr,
          logger: t.context.logger,
        }
      )
    )),
  ];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'ENOAPMTOKEN');
  t.truthy(errors[0].message);
  t.truthy(errors[0].details);
  t.is(errors[1].name, 'SemanticReleaseError');
  t.is(errors[1].code, 'ENOAPMCLI');
  t.truthy(errors[1].message);
  t.truthy(errors[1].details);
  t.is(errors[2].name, 'SemanticReleaseError');
  t.is(errors[2].code, 'ENOPKGNAME');
  t.truthy(errors[2].message);
  t.truthy(errors[2].details);
});

test('Verify token and set up auth only on the fist call, then prepare on prepare call only', async t => {
  const name = 'test-module';
  const repositoryUrl = `${mockServer.url}/owner/${name}.git`;
  const cwd = tempy.directory();
  await execa('git', ['init'], {cwd});
  await execa('git', ['config', 'remote.origin.url', repositoryUrl], {cwd});
  const pkg = {name, version: '0.0.0', repository: {url: repositoryUrl}};
  await outputJson(path.resolve(cwd, 'package.json'), pkg);

  await t.notThrowsAsync(
    t.context.m.verifyConditions(
      {},
      {cwd, env, options: {}, stdout: t.context.stdout, stderr: t.context.stderr, logger: t.context.logger}
    )
  );
  await t.context.m.prepare(
    {},
    {
      cwd,
      env: {ATOM_ACCESS_TOKEN: 'my_token', ...env},
      options: {},
      stdout: t.context.stdout,
      stderr: t.context.stderr,
      logger: t.context.logger,
      nextRelease: {version: '1.0.0'},
    }
  );

  const verifyApmMock = await mockServer.mock('/packages', {}, {body: {}, method: 'POST', statusCode: 201});
  const getApmVersionMock = await mockServer.mock(
    `/packages/${name}/versions`,
    {},
    {body: {}, method: 'POST', statusCode: 201}
  );

  const result = await t.context.m.publish(
    {},
    {
      cwd,
      env: {ATOM_ACCESS_TOKEN: 'my_token', ...env},
      options: {},
      stdout: t.context.stdout,
      stderr: t.context.stderr,
      logger: t.context.logger,
      nextRelease: {version: '1.0.0', gitTag: 'v1.0.0'},
    }
  );

  await mockServer.verify(verifyApmMock);
  await mockServer.verify(getApmVersionMock);

  t.deepEqual(result, {name: 'Atom package', url: `https://atom.io/packages/${name}`});
  t.is((await readJson(path.resolve(cwd, 'package.json'))).version, '1.0.0');
});

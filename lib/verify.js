import execa from 'execa';
import resolveConfig from './resolve-config.js';
import getError from './get-error.js';

export default async function verifyApm(pluginConfig, context) {
  const {cwd, env} = context;
  const errors = [];
  const {apmToken} = resolveConfig(pluginConfig, context);

  if (!apmToken) {
    errors.push(getError('ENOAPMTOKEN'));
  }

  if ((await execa('apm', ['-v'], {reject: false, cwd, env})).exitCode !== 0) {
    errors.push(getError('ENOAPMCLI'));
  }

  return errors;
}

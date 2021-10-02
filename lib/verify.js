const execa = require('execa');
const resolveConfig = require('./resolve-config.js');
const getError = require('./get-error.js');

module.exports = async (pluginConfig, context) => {
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
};

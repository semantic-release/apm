const readPkg = require('read-pkg');
const AggregateError = require('aggregate-error');
const getError = require('./get-error.js');

module.exports = async (pluginConfig, {cwd}) => {
  try {
    const pkg = await readPkg({cwd});

    if (!pkg.name) {
      throw getError('ENOPKGNAME');
    }

    return pkg;
  } catch (error) {
    const error_ = error.code === 'ENOENT' ? new AggregateError([getError('ENOPKG')]) : new AggregateError([error]);
    throw error_;
  }
};

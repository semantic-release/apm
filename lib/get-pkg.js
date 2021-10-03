import {readPackage} from 'read-pkg';
import AggregateError from 'aggregate-error';
import getError from './get-error.js';

export default async function getPkg(pluginConfig, {cwd}) {
  try {
    const pkg = await readPackage({cwd});

    if (!pkg.name) {
      throw getError('ENOPKGNAME');
    }

    return pkg;
  } catch (error) {
    const error_ = error.code === 'ENOENT' ? new AggregateError([getError('ENOPKG')]) : new AggregateError([error]);
    throw error_;
  }
}

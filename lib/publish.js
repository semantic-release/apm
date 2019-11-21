const execa = require('execa');

module.exports = async (pluginConfig, {name}, context) => {
  const {
    cwd,
    env,
    stdout,
    stderr,
    nextRelease: {gitTag, version},
    logger,
  } = context;

  logger.log(`Publishing version ${version} to apm registry`);

  const result = execa('apm', ['publish', '--tag', gitTag], {
    cwd,
    env,
  });
  result.stdout.pipe(stdout, {end: false});
  result.stderr.pipe(stderr, {end: false});
  await result;

  logger.log(`Published ${name}@${version}`);
  return {name: 'Atom package', url: `https://atom.io/packages/${name}`};
};

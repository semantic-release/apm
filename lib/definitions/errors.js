const pkg = require('../../package.json');

const [homepage] = pkg.homepage.split('#');
const linkify = (file) => `${homepage}/blob/master/${file}`;

module.exports = {
  ENOAPMTOKEN: () => ({
    message: 'No apm token specified.',
    details: `An [apm token](${linkify(
      'README.md#atom-authentication'
    )}) must be created and set in the \`ATOM_ACCESS_TOKEN\` environment variable on your CI environment.

Please visit your account page on [atom.io](https://atom.io/account) and to set it in the \`ATOM_ACCESS_TOKEN\` environment variable on your CI environment.`,
  }),
  ENOAPMCLI: () => ({
    message: 'The apm CLI must be installed.',
    details: `The \`apm\` command line has to be installed in your CI environment and available in the \`PATH\` environment varialbe.

See [Atom installation](${linkify('README.md#atom-installation')}) for more details.`,
  }),
  ENOPKGNAME: () => ({
    message: 'Missing `name` property in `package.json`.',
    details: `The \`package.json\`'s [name](https://docs.npmjs.com/files/package.json#name) property is required in order to publish an Atom package.

Please make sure to add a valid \`name\` for your package in your \`package.json\`.`,
  }),
  ENOPKG: () => ({
    message: 'Missing `package.json` file.',
    details: `A [package.json file](https://docs.npmjs.com/files/package.json) at the root of your project is required to publish an Atom package.

Please follow the [npm guideline](https://docs.npmjs.com/getting-started/creating-node-modules) to create a valid \`package.json\` file.`,
  }),
};

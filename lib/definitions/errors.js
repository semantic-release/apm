import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPackageSync} from 'read-pkg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = readPackageSync({cwd: resolve(__dirname, '../../')});
const [homepage] = pkg.homepage.split('#');
const linkify = (file) => `${homepage}/blob/master/${file}`;

const errors = {
  ENOAPMTOKEN() {
    return {
      message: 'No apm token specified.',
      details: `An [apm token](${linkify(
        'README.md#atom-authentication'
      )}) must be created and set in the \`ATOM_ACCESS_TOKEN\` environment variable on your CI environment.

Please visit your account page on [atom.io](https://atom.io/account) and to set it in the \`ATOM_ACCESS_TOKEN\` environment variable on your CI environment.`,
    };
  },

  ENOAPMCLI() {
    return {
      message: 'The apm CLI must be installed.',
      details: `The \`apm\` command line has to be installed in your CI environment and available in the \`PATH\` environment varialbe.

See [Atom installation](${linkify('README.md#atom-installation')}) for more details.`,
    };
  },

  ENOPKGNAME() {
    return {
      message: 'Missing `name` property in `package.json`.',
      details: `The \`package.json\`'s [name](https://docs.npmjs.com/files/package.json#name) property is required in order to publish an Atom package.

Please make sure to add a valid \`name\` for your package in your \`package.json\`.`,
    };
  },

  ENOPKG() {
    return {
      message: 'Missing `package.json` file.',
      details: `A [package.json file](https://docs.npmjs.com/files/package.json) at the root of your project is required to publish an Atom package.

Please follow the [npm guideline](https://docs.npmjs.com/getting-started/creating-node-modules) to create a valid \`package.json\` file.`,
    };
  },
};

export default errors;

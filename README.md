# @semantic-release/apm

[**semantic-release**](https://github.com/semantic-release/semantic-release) plugin to publish [Atom](https://www.atom.io) packages with [apm](https://github.com/atom/apm).

[![Build Status](https://github.com/semantic-release/apm/workflows/Test/badge.svg)](https://github.com/semantic-release/apm/actions?query=workflow%3ATest+branch%3Amaster)[![npm latest version](https://img.shields.io/npm/v/@semantic-release/apm/latest.svg)](https://www.npmjs.com/package/@semantic-release/apm)
[![npm next version](https://img.shields.io/npm/v/@semantic-release/apm/next.svg)](https://www.npmjs.com/package/@semantic-release/apm)
[![npm beta version](https://img.shields.io/npm/v/@semantic-release/apm/beta.svg)](https://www.npmjs.com/package/@semantic-release/apm)

| Step               | Description                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------- |
| `verifyConditions` | Verify the presence of the `ATOM_ACCESS_TOKEN` environment variable and the `apm` CLI.       |
| `prepare`          | Update the `package.json` version with [`npm version`](https://docs.npmjs.com/cli/version).  |
| `publish`          | [Publish the Atom package](https://flight-manual.atom.io/hacking-atom/sections/publishing/). |

## Install

```bash
$ npm install @semantic-release/apm @semantic-release/git -D
```

**Note**: apm require to have the version in `package.json` pushed to the repository so the [`@semantic-release/git`](https://github.com/semantic-release/git) plugin is required.

## Usage

The plugin can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/github",
    "@semantic-release/apm",
    "@semantic-release/git"
  ]
}
```

## Configuration

### Apm installation

The plugin uses the [`apm` CLI](https://github.com/atom/apm) which has to be installed in your CI environment and available in the `PATH`.

See the [Atom Package CI Scripts](https://github.com/atom/ci#atom-package-ci-scripts) documentation to install `apm` in your CI.

**Note**: If you are running multiple versions of Atom in CI (for example, Stable and Beta), ensure that the `semantic-release` command is run on a build using the Stable channel of Atom as the Beta channel builds only provide `apm-beta`. If you are using [travis-deploy-once](https://github.com/semantic-release/travis-deploy-once) this can be achieved by setting the Stable channel build to be the last build to run, or by using the [`buildLeaderId`](https://github.com/semantic-release/travis-deploy-once#-b---buildleaderid) option.

### Atom authentication

The Atom authentication configuration is **required** and can be set via [environment variables](#environment-variables).

Visit your account page on [Atom.io](https://atom.io/account) to obtain your authentication token. The token has to be made available in your CI environment via the `ATOM_ACCESS_TOKEN` environment variable.

### Environment variables

| Variable            | Description                                        |
| ------------------- | -------------------------------------------------- |
| `ATOM_ACCESS_TOKEN` | The token used to authenticate with Atom registry. |

/* eslint require-atomic-updates: off */

const AggregateError = require('aggregate-error');
const getPkg = require('./lib/get-pkg.js');
const verifyApm = require('./lib/verify.js');
const prepareApm = require('./lib/prepare.js');
const publishApm = require('./lib/publish.js');

let verified;
let prepared;

async function verifyConditions(pluginConfig, context) {
  const errors = await verifyApm(pluginConfig, context);

  try {
    await getPkg(pluginConfig, context);
  } catch (error) {
    errors.push(...error);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  verified = true;
}

async function prepare(pluginConfig, context) {
  const errors = verified ? [] : await verifyApm(pluginConfig, context);

  try {
    await getPkg(pluginConfig, context);
  } catch (error) {
    errors.push(...error);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  await prepareApm(pluginConfig, context);

  prepared = true;
}

async function publish(pluginConfig, context) {
  let pkg;
  const errors = verified ? [] : await verifyApm(pluginConfig, context);

  try {
    pkg = await getPkg(pluginConfig, context);
  } catch (error) {
    errors.push(...error);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  if (!prepared) {
    await prepareApm(pluginConfig, context);
    prepared = true;
  }

  return publishApm(pluginConfig, pkg, context);
}

module.exports = {verifyConditions, prepare, publish};

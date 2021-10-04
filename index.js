/* eslint require-atomic-updates: off */

import AggregateError from 'aggregate-error';
import getPkg from './lib/get-pkg.js';
import verifyApm from './lib/verify.js';
import prepareApm from './lib/prepare.js';
import publishApm from './lib/publish.js';

let verified;
let prepared;

export async function verifyConditions(pluginConfig, context) {
  const errors = await verifyApm(pluginConfig, context);

  try {
    await getPkg(pluginConfig, context);
  } catch (error) {
    errors.push(...error.errors);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  verified = true;
}

export async function prepare(pluginConfig, context) {
  const errors = verified ? [] : await verifyApm(pluginConfig, context);

  try {
    await getPkg(pluginConfig, context);
  } catch (error) {
    errors.push(...error.errors);
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  await prepareApm(pluginConfig, context);

  prepared = true;
}

export async function publish(pluginConfig, context) {
  let pkg;
  const errors = verified ? [] : await verifyApm(pluginConfig, context);

  try {
    pkg = await getPkg(pluginConfig, context);
  } catch (error) {
    errors.push(...error.errors);
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

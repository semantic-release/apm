export default function resolveConfig(pluginConfig, {env}) {
  return {
    apmToken: env.ATOM_ACCESS_TOKEN,
  };
}

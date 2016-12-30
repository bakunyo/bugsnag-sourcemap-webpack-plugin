import { describe } from 'ava-spec';
import BugsnagSourceMapPlugin from 'BugsnagSourceMapPlugin';

describe('.constructor', (it) => {
  it('can initialize', (t) => {
    const plugin = new BugsnagSourceMapPlugin({});
    t.is(plugin.constructor, BugsnagSourceMapPlugin);
  });

  it('can receive options', (t) => {
    const options = {
      apiKey: 'key',
      publicPath: 'https://example.com',
    };
    const plugin = new BugsnagSourceMapPlugin(options);

    t.is(plugin.apiKey, options.apiKey);
    t.is(plugin.publicPath, options.publicPath);
    t.is(plugin.silent, false);
  });
});

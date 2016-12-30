import async from 'async';
import superagent from 'superagent';
import path from 'path';

const BUGSNAG_ENDPOINT = 'https://upload.bugsnag.com'

class BugsnagSourceMapPlugin {
  constructor({
    apiKey,
    publicPath,
    silent = false
  }) {
    this.apiKey = apiKey
    this.publicPath = publicPath
    this.silent = silent
  }

  apply(compiler) {
    compiler.plugin('after-emit', (compilation) => {
      this.afterEmit(compilation);
    });
  }

  afterEmit(compilation) {
    const { assetsByChunkName } = compilation.getStats().toJson();
    const assets = this.getAssets(assetsByChunkName);
    this.uploadSourceMaps(assets, compilation);
  }

  getAssets(assetsByChunkName) {
    return Object.keys(assetsByChunkName).map(asset => {
      return assetsByChunkName[asset];
    });
  }

  uploadSourceMaps(assets, compilation) {
    const self = this;

    async.each(
      assets,
      (asset, callback) => {
        self.uploadSourceMap(self, asset[0], asset[1], compilation);
        callback();
      },
      (err) => {
        if (err && !self.silent) { throw err }
      }
    );
  }

  uploadSourceMap(self, sourceFile, sourceMap, compilation) {
    const minifiedUrl = path.join(self.publicPath, sourceFile);
    const sourceMapPath = compilation.assets[sourceMap].existsAt
    superagent.post(BUGSNAG_ENDPOINT)
              .field('apiKey', self.apiKey)
              .field('minifiedUrl', minifiedUrl)
              .attach('sourceMap', sourceMapPath)
              .end((err, res) => {
                if (err && !self.silent) { throw err }
              });
  }
}

module.exports = BugsnagSourceMapPlugin;

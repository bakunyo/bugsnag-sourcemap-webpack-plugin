import async from 'async';
import superagent from 'superagent';
import path from 'path';

const BUGSNAG_ENDPOINT = 'https://upload.bugsnag.com';

class BugsnagSourceMapPlugin {
  constructor({
    apiKey,
    publicPath,
    silent = false,
    overwrite = false,
  }) {
    this.apiKey = apiKey;
    this.publicPath = publicPath;
    this.silent = silent;
    this.overwrite = overwrite;
  }

  apply(compiler) {
    if (compiler.options.devtool === false) {
      console.warn('WARN: sourcemap option is not defined. (from bugsnag-sourcemap-webpack-plugin)\n');
      return;
    }

    compiler.plugin('after-emit', (compilation) => {
      this.afterEmit(compilation);
    });
  }

  afterEmit(compilation) {
    const { assetsByChunkName } = compilation.getStats().toJson();
    const assets = this.constructor.getAssets(assetsByChunkName);
    this.uploadSourceMaps(assets, compilation);
  }

  static getAssets(assetsByChunkName) {
    return Object.keys(assetsByChunkName).map(asset => assetsByChunkName[asset]);
  }

  uploadSourceMaps(assets, compilation) {
    async.each(
      assets,
      (asset, callback) => {
        const compiledAsset = asset[0];
        const mapAsset = asset[asset.indexOf(`${compiledAsset}.map`)];
        this.uploadSourceMap(compiledAsset, mapAsset, compilation);
        callback();
      },
      (err) => {
        if (err && !this.silent) { throw err; }
      },
    );
  }

  uploadSourceMap(sourceFile, sourceMap, compilation) {
    const minifiedUrl = `${this.publicPath}/${sourceFile}`;
    const sourceMapPath = compilation.assets[sourceMap].existsAt;
    const options = {
      apiKey: this.apiKey,
      minifiedUrl,
    };

    if (this.overwrite === true) { options.overwrite = true; }

    superagent.post(BUGSNAG_ENDPOINT)
              .field(options)
              .attach('sourceMap', sourceMapPath)
              .end((err) => { if (err && !this.silent) {
                if (err.response && err.response.text) {
                  throw `BugsnagSourceMapPlugin Error: ${err.response.text}`;
                } else {
                  throw err;
                }
              }});
  }
}

module.exports = BugsnagSourceMapPlugin;

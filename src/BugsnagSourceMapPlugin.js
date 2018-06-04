/* eslint-disable no-console */
import async from 'async';
import superagent from 'superagent';
import fs from 'fs';

const BUGSNAG_ENDPOINT = 'https://upload.bugsnag.com';

class BugsnagSourceMapPlugin {
  constructor({
    apiKey,
    publicPath,
    appVersion = null,
    silent = false,
    overwrite = false,
    uploadSource = false,
    removeSourceMap = true,
  }) {
    this.apiKey = apiKey;
    this.publicPath = publicPath;
    this.appVersion = appVersion;
    this.silent = silent;
    this.overwrite = overwrite;
    this.uploadSource = uploadSource;
    this.removeSourceMap = removeSourceMap;
  }

  apply(compiler) {
    if (compiler.options.devtool === false) {
      console.warn('WARN: sourcemap option is not defined. (from bugsnag-sourcemap-webpack-plugin)\n');
      return;
    }

    if (compiler.hooks
      && compiler.hooks.afterEmit
      && typeof compiler.hooks.afterEmit.tap === 'function'
    ) {
      // webpack 4
      compiler.hooks.afterEmit.tap('BugsnagSourceMapPlugin', (compilation, callback) => {
        this.afterEmit(compilation);
        if (typeof callback === 'function') {
          callback();
        }
      });
    } else {
      // webpack 3 or lower
      compiler.plugin('after-emit', (compilation, callback) => {
        this.afterEmit(compilation);
        callback();
      });
    }
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
        const compiledAsset = asset.filter(s => s.slice(-3) === '.js')[0];
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
    const sourceFilePath = compilation.assets[sourceFile].existsAt;
    const options = {
      apiKey: this.apiKey,
      minifiedUrl,
    };

    if (this.overwrite === true) { options.overwrite = true; }
    if (this.appVersion !== null) { options.appVersion = this.appVersion; }

    const request = superagent.post(BUGSNAG_ENDPOINT)
      .field(options)
      .attach('sourceMap', sourceMapPath);

    if (this.uploadSource === true) {
      request.attach('minifiedFile', sourceFilePath);
    }

    request.end((err) => {
      if (err) {
        if (!this.silent) {
          if (err.response && err.response.text) {
            throw new Error(`BugsnagSourceMapPlugin Error: ${err.response.text}`);
          } else {
            throw err;
          }
        } else {
          console.log('BugsnagSourceMapPlugin Warning: ', err);
        }
      }

      if (this.removeSourceMap) {
        fs.unlinkSync(sourceMapPath);
      }
    });
  }
}

module.exports = BugsnagSourceMapPlugin;

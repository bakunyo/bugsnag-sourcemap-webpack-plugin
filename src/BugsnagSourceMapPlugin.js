import async from 'async';
import fs from 'fs';

class BugsnagSourceMapPlugin {
  apply(compiler) {
    compiler.plugin('after-emit', (compilation) => {
      this.afterEmit(compilation);
    });
  }

  afterEmit(compilation, callback) {
    const { assetsByChunkName } = compilation.getStats().toJson();
    const assets = this.getAssets(assetsByChunkName);

    this.uploadSourceMaps(assets, (err) => {
      callback();
    });
  }

  getAssets(assetsByChunkName) {
    async.filter(assetsByChunkName, (file, callback) => {
      fs.accessSync(file);
    })
  }

  uploadSourceMaps(assets, callback) {
    callback();
  }
}

module.exports = BugsnagSourceMapPlugin;

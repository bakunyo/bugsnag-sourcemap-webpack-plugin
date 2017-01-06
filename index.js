'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BUGSNAG_ENDPOINT = 'https://upload.bugsnag.com';

var BugsnagSourceMapPlugin = function () {
  function BugsnagSourceMapPlugin(_ref) {
    var apiKey = _ref.apiKey,
        publicPath = _ref.publicPath,
        _ref$silent = _ref.silent,
        silent = _ref$silent === undefined ? false : _ref$silent,
        _ref$overwrite = _ref.overwrite,
        overwrite = _ref$overwrite === undefined ? false : _ref$overwrite;

    _classCallCheck(this, BugsnagSourceMapPlugin);

    this.apiKey = apiKey;
    this.publicPath = publicPath;
    this.silent = silent;
    this.overwrite = overwrite;
  }

  _createClass(BugsnagSourceMapPlugin, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      if (compiler.options.devtool === false) {
        console.warn('WARN: sourcemap option is not defined. (from bugsnag-sourcemap-webpack-plugin)\n');
        return;
      }

      compiler.plugin('after-emit', function (compilation) {
        _this.afterEmit(compilation);
      });
    }
  }, {
    key: 'afterEmit',
    value: function afterEmit(compilation) {
      var _compilation$getStats = compilation.getStats().toJson(),
          assetsByChunkName = _compilation$getStats.assetsByChunkName;

      var assets = this.constructor.getAssets(assetsByChunkName);
      this.uploadSourceMaps(assets, compilation);
    }
  }, {
    key: 'uploadSourceMaps',
    value: function uploadSourceMaps(assets, compilation) {
      var _this2 = this;

      _async2.default.each(assets, function (asset, callback) {
        _this2.uploadSourceMap(asset[0], asset[1], compilation);
        callback();
      }, function (err) {
        if (err && !_this2.silent) {
          throw err;
        }
      });
    }
  }, {
    key: 'uploadSourceMap',
    value: function uploadSourceMap(sourceFile, sourceMap, compilation) {
      var _this3 = this;

      var minifiedUrl = _path2.default.join(this.publicPath, sourceFile);
      var sourceMapPath = compilation.assets[sourceMap].existsAt;
      var options = {
        apiKey: this.apiKey,
        minifiedUrl: minifiedUrl
      };

      if (this.overwrite === true) {
        options.overwrite = true;
      }

      _superagent2.default.post(BUGSNAG_ENDPOINT).field(options).attach('sourceMap', sourceMapPath).end(function (err) {
        if (err && !_this3.silent) {
          throw err;
        }
      });
    }
  }], [{
    key: 'getAssets',
    value: function getAssets(assetsByChunkName) {
      return Object.keys(assetsByChunkName).map(function (asset) {
        return assetsByChunkName[asset];
      });
    }
  }]);

  return BugsnagSourceMapPlugin;
}();

module.exports = BugsnagSourceMapPlugin;

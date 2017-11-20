# BugsnagSourceMapPlugin
![dependencies](https://david-dm.org/bakunyo/bugsnag-sourcemap-webpack-plugin.svg)  ![Travis CI](https://travis-ci.org/bakunyo/bugsnag-sourcemap-webpack-plugin.svg?branch=master) [![npm version](https://badge.fury.io/js/bugsnag-sourcemap-webpack-plugin.svg)](https://badge.fury.io/js/bugsnag-sourcemap-webpack-plugin)

A [Webpack](http://webpack.github.io/) plugin to upload sourcemaps to [Bugsnag](https://bugsnag.com/) after build

## Installation
```
$ npm install --save-dev bugsnag-sourcemap-webpack-plugin
```

## Usage
In your webpack.config.js
```javascript
const BugsnagSourceMapPlugin = require('bugsnag-sourcemap-webpack-plugin');

module.exports = {
  // your settings for webpack
  devtool: 'source-map',
  plugins: [
    new BugsnagSourceMapPlugin({
      apiKey: 'YOUR_BUGSNAG_API_KEY',
      publicPath: 'https://your.site/assets/path'
    }),
  ]
}
```

## Options
|key|required|content|default|
|:--|:--|:--|:--|
|apiKey|y|the Bugsnag API key that is used in your app.|-|
|publicPath|y|the Base hosted url of your compiled assets.|-|
|appVersion||the version of the app that the source map applies to as set in the JavaScript notifier.|-|
|silent||whether or not ignore js errors in upload to Bugsnag.|false|
|overwrite||whether to overwrite any existing version of files.|false|
|uploadSource||whether to upload source file (see `minifiedFile` in Bugsnag docs).|false|
|removeSourceMap||whether to remove sourcemap file after uploaded.|true|

## Reference
[Bugsnag - Sourcemap Upload API](https://docs.bugsnag.com/api/js-source-map-upload/)


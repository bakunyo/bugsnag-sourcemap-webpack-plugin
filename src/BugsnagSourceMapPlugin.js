class BugsnagSourceMapPlugin {
  apply(compiler) {
    compiler.plugin('after-emit', (compilation) => {
      this.afterEmit(compilation);
    });
  }

  afterEmit(compilation) {
  }
}

module.exports = BugsnagSourceMapPlugin;

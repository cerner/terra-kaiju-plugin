const toolkitConfig = require('terra-toolkit/config/webpack/webpack.config');

const kaijuConfig = (rootPath, entryPath, inputFs) => {
  const aggregateOptions = {
    baseDirectory: '/',
    outputFileSystem: inputFs,
    inputFileSystem: inputFs,
  };

  const defaultConfig = toolkitConfig({ aggregateOptions });

  defaultConfig.entry.preview = entryPath;
  defaultConfig.module.rules.shift();
  defaultConfig.module.rules.unshift({
    test: /\.jsx?$/,
    exclude: /(node_modules|bower_components)/,
    use: {
      loader: 'babel-loader',
      options: {
        babelrc: false,
        presets: [require.resolve('babel-preset-es2015'), require.resolve('babel-preset-react')],
        plugins: [require.resolve('babel-plugin-transform-object-rest-spread')],
      },
    },
  });

  // Remove the output config so it does not override the config specified in kaiju-plugin-util.
  delete defaultConfig.output;

  return defaultConfig;
};

module.exports = kaijuConfig;

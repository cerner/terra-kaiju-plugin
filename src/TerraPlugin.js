const { PluginUtils } = require('kaiju-plugin-utils');
const config = require('./preview/webpack.config');
const generateCode = require('./code/generator');

class TerraPlugin {
  static generateCode(ast, rootId, fs) {
    fs.mkdirpSync('/src');
    fs.writeFileSync('/src/code.jsx', generateCode(ast, rootId));
    const manifest = ['/src/code.jsx'];
    return Promise.all([manifest, fs]);
  }

  // returns a memory fs containing the preview and the entry filename.
  static generatePreview(fs, publicPath) {
    const webpackFs = PluginUtils.webpackFs(fs);
    const outputPath = '/build/';
    const modifiedConfig = Object.assign({}, PluginUtils.defaultWebpackConfig(publicPath, outputPath), config(PluginUtils.rootPath(), '/src/code.jsx', webpackFs));
    return Promise.all([
      'preview.js',
      outputPath,
      PluginUtils.runCompiler(webpackFs, modifiedConfig),
    ]);
  }

  static componentModules() {
    return [
      'terra-kaiju-plugin',
    ];
  }

  static projectDescription() {
    return 'The default Terra project';
  }
}

module.exports = TerraPlugin;

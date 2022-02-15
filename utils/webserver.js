// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.ASSET_PATH = '/';

const XcodeBuildPlugin = require('xcode-build-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server'),
  webpack = require('webpack'),
  config = require('../webpack.config'),
  env = require('./env'),
  path = require('path');

const browser = process.env.BROWSER;
const isSafari = browser === 'safari';
const buildDir = browser === 'chrome' ? 'build/chrome' : 'build/firefox';
const directory = isSafari
  ? path.join(__dirname, '../build/safari/CasperLabs Signer')
  : path.join(__dirname, '../' + buildDir);

const options = config.chromeExtensionBoilerplate || {};
const excludeEntriesToHotReload = options.notHotReload || [];

for (const entryName in config.entry) {
  if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
    config.entry[entryName] = [
      'webpack/hot/dev-server',
      `webpack-dev-server/client?hot=true&hostname=localhost&port=${env.PORT}`
    ].concat(config.entry[entryName]);
  }
}

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(
  config.plugins || []
);

delete config.chromeExtensionBoilerplate;

if (isSafari) {
  config.plugins.push(
    new XcodeBuildPlugin({
      projectDir: './build/safari/CasperLabs Signer',
      args: {
        quiet: true,
        scheme: 'CasperLabs Signer'
      },
      buildActions: 'build'
    })
  );
}

const compiler = webpack(config);

const server = new WebpackDevServer(
  {
    https: false,
    hot: false,
    client: false,
    host: 'localhost',
    port: env.PORT,
    static: {
      directory
    },
    devMiddleware: {
      publicPath: `http://localhost:${env.PORT}/`,
      writeToDisk: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    allowedHosts: 'all'
  },
  compiler
);

if (process.env.NODE_ENV === 'development' && 'hot' in module) {
  // @ts-ignore
  module.hot.accept();
}

(async () => {
  await server.start();
})();

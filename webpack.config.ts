import * as webpack from 'webpack';
import * as path from 'path';

const DefinePlugin = webpack.DefinePlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NoEmitOnErrorsPlugin = webpack.NoEmitOnErrorsPlugin;
const OccurrenceOrderPlugin = webpack.optimize.OccurrenceOrderPlugin;
const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin;

let definePluginParams: any = {
  'process.env.NODE_ENV': JSON.stringify('development')
}
if (process.env.REMOTE_LOG) {
  definePluginParams = {
    ...definePluginParams,
    'process.env.REMOTE_LOG': JSON.stringify(process.env.REMOTE_LOG)
  }
}

const config = {
  mode: 'development',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: ['node_modules']
  },

  entry: {
    app: './example/index'
  },

  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, './dist'),
    publicPath: '/'
  },

  plugins: [
    new DefinePlugin(definePluginParams),

    new LoaderOptionsPlugin({
      debug: true
    }),

    new HtmlWebpackPlugin({
      chunksSortMode: 'dependency',
      filename: 'index.html',
      hash: true,
      inject: 'body',
      title: 'react-zoom-pan example',
      template: './example/index.html'
    }),

    new OccurrenceOrderPlugin(true),

    new NoEmitOnErrorsPlugin(),

    new HotModuleReplacementPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.(ts|tsx|jsx)$/,
        exclude: [/\.(spec|e2e|d)\.(ts|tsx|js|jsx)$/],
        loader: 'ts-loader'
      },
      {
        test: /\.styl$/,
        use: [
          { loader: 'style-loader', options: { sourceMap: true } },
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'stylus-loader', options: { sourceMap: true } }
        ]
      }
    ]
  },

  optimization: {
    minimize: false,
    runtimeChunk: {
      name: 'runtime'
    },
    splitChunks: {
      cacheGroups: {
        default: false,
        commons: {
          test: /node_modules/,
          name: 'vendor',
          chunks: 'initial',
          minSize: 1
        }
      }
    }
  },

  devServer: {
    host: '0.0.0.0',
    contentBase: './src',
    hot: true,
    port: 5000,
    stats: {
      cached: true,
      cachedAssets: true,
      chunks: true,
      chunkModules: false,
      colors: true,
      hash: false,
      reasons: true,
      timings: true,
      version: false
    }
  }
};

export default config;

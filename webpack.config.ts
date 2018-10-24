import * as webpack from 'webpack'
import * as path from 'path'

const DefinePlugin = webpack.DefinePlugin
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin
const HtmlWebpackPlugin = require('html-webpack-plugin')
const NoEmitOnErrorsPlugin = webpack.NoEmitOnErrorsPlugin
const OccurrenceOrderPlugin = webpack.optimize.OccurrenceOrderPlugin
const HotModuleReplacementPlugin = webpack.HotModuleReplacementPlugin

const isDev = process.env.NODE_ENV === 'development'

let definePluginParams: any = {
  'process.env.NODE_ENV': JSON.stringify('development')
}
if (process.env.REMOTE_LOG) {
  definePluginParams = {
    ...definePluginParams,
    'process.env.REMOTE_LOG': JSON.stringify(process.env.REMOTE_LOG)
  }
}

const config: webpack.Configuration = {
  mode: 'development',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: ['node_modules']
  },

  entry: {
    app: './example/src/index'
  },

  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, './example')
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
      template: './example/src/index.html'
    }),

    new OccurrenceOrderPlugin(true),

    new NoEmitOnErrorsPlugin()
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
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        loader: 'file-loader'
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
  }
}

if (process.env.NODE_ENV === 'development') {
  config.plugins.push(new HotModuleReplacementPlugin())
}

export default config

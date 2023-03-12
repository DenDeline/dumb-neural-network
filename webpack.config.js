const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const config = {
  mode: 'development',
    devtool: 'inline-source-map',
    entry: './src/index.ts',
    devServer: {
      open: true,
      client: {
          progress: true,
      }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            cache: false,
            inject: true,
            template: path.resolve(__dirname, './public/index.ejs'),
        })
    ],
}

module.exports = config

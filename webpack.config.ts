import path from "path";
import { EnvironmentPlugin } from "webpack";
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const config = {
  entry: "./src/index.ts",
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(ts|js)?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(wasm)$/i,
        type: 'asset/resource'
      }
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "maplibre-gl-wgs84-raster-protocol.js",
    library: "maplibreglWgs84RasterProtocol",
  },
  devServer: {
    static: path.join(__dirname, "dev"),
    compress: true,
    port: 3000,
    hot: true,
    open: false,
  },
  // optimization: {
  //   runtimeChunk: 'single',
  // },
  plugins: [
    new EnvironmentPlugin({
      'PUBLIC_URL': process.env.PUBLIC_URL,
    }),
    new ForkTsCheckerWebpackPlugin({
      async: false,
    })
  ]
};

export default config;

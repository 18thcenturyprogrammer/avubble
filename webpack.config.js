
const path = require("path");
const webpack = require("webpack");

const config = {
  entry: {
    app : "./src/app.js"
  },
  output: {
    path: path.resolve(__dirname, "dist/js"),
    filename : '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options:{
            presets: ['@babel/preset-env',"@babel/preset-react"],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        },
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        // This has effect on the react lib size
        NODE_ENV: JSON.stringify("production"),
      },
    }),
  ],
  node: {
    child_process: "empty",
    fs: "empty", // if unable to resolve "fs"
    net: 'empty', 
  },  
  // resolve: {
  //   fallback: {
  //       net: false,
  //       tls: false,
  //       /// ....
  //   }
  // },
};

module.exports = config;




// // basic webpack config ref) https://dev.to/typescripttv/6-ways-to-configure-webpack-5a33
// // html webpack plugin ref) https://webpack.js.org/plugins/html-webpack-plugin/
// // copy webpack plugin ref) https://webpack.js.org/plugins/copy-webpack-plugin/

// const path = require("path");

// const webpack = require('webpack');


// const config = {
//   entry: {
//     app : "./src/app.js"
//   },
//   mode: "development",
//   module: {
//     rules: [
//       {
//         exclude: /node_modules/,
//         test: /\.(js|jsx)$/i,
//         use:{
//           loader: "babel-loader",
//           options :{
//             presets:['@babel/preset-env', '@babel/preset-react']
//           }
//         }
//       }
//     ]
//   },
//   output: {
//     path: path.resolve(__dirname, "dist/js"),
//     filename : '[name].js'
//   },
//   plugins: [
//   ],
//   resolve: {
//     fallback: { crypto: false },
//   }
// };

// module.exports = config;
















// // basic webpack config ref) https://dev.to/typescripttv/6-ways-to-configure-webpack-5a33
// // html webpack plugin ref) https://webpack.js.org/plugins/html-webpack-plugin/
// // copy webpack plugin ref) https://webpack.js.org/plugins/copy-webpack-plugin/

// const path = require("path");
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CopyPlugin = require("copy-webpack-plugin");

// const webpack = require('webpack');


// const config = {
//   entry: {
//     popup : "./src/app.js"
//   },
//   mode: "development",
//   module: {
//     rules: [
//       {
//         exclude: /node_modules/,
//         test: /\.(js|jsx)$/i,
//         use:{
//           loader: "babel-loader",
//           options :{
//             presets:['@babel/preset-env', '@babel/preset-react']
//           }
//         }
//       }
//     ]
//   },
//   output: {
//     path: path.resolve(__dirname, "dist"),
//     filename : '[name].js'
//   },
//   plugins: [
//     new HtmlWebpackPlugin({
//     template:"./src/popup.html",
//     filename:"popup.html"
//     }),
//     new CopyPlugin({
//       patterns: [
//         { from: "public"}
//       ],
//     }),
//     new webpack.ProvidePlugin({
//       process: 'process/browser',
//     }),
//     new webpack.ProvidePlugin({
//       Buffer: ['buffer', 'Buffer'],
//     }),
//   ],
//   resolve: {
//     fallback: { crypto: false },
//   }
// };

// module.exports = config;
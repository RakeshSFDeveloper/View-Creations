const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
// const options = { publicpath: null, filename: "manifest.json" };

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(
      __dirname,
      "force-app/main/default/staticresources/reactComponent"
    )
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html")
    })
    // new WebpackManifestPlugin({
    //   options
    // })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "build")
    },
    port: 3000
  },
  module: {
    // exclude node_modules
    rules: [
      {
        test: /\.(js|jsx)$/, // <-- added `|jsx` here
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  // pass all js files through Babel
  resolve: {
    extensions: ["*", ".js", ".jsx"] // <-- added `.jsx` here
  }
};

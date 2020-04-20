const libraryName = require("./package.json").name;

const config = {
  entry: "./lib/index.tsx",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        exclude: /(node_modules)/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: ["node_modules"],
  },
  output: {
    filename: `${libraryName}.min.js`,
    path: `${__dirname}/`,
  },
};

module.exports = config;

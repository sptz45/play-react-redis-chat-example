
module.exports = {

  entry: './assets/javascripts/main.js',
  
  output: {
    path: 'target/web/public/main/javascripts',
    filename: '[name].js'
  },
  
  module: {
    loaders: [
      { test: /\.js$/,   loader: 'babel?stage=0', exclude: /node_modules/ },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.css$/,  loader: 'style!css' },
    ]
  },

  externals: {
    //'react': 'React',
    //'react-dom': 'ReactDom',
    'moment': 'moment'
  },
  
  resolve: {
    extensions: ['', '.js']
  },

  devtool: 'source-map'

};

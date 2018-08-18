const path = require('path');
var $ = require('./src/libs/jquery-3.1.1.js');

const serverConfig = {
  target: 'web',	
  mode: "production", // "production" | "development" | "none" 
  entry: './src/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../static/')
  }
}

//In case we need a seperate tests bundling
const testsConfig = {
  target: 'web',	
  mode: "production", // "production" | "development" | "none" 
  entry: './test/main.js',
  output: {
    filename: 'tests.js',
    path: path.resolve(__dirname, '../static/')
  }
}

module.exports = [
serverConfig, testsConfig
];


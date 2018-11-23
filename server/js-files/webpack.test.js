const path = require('path');
const TARGET = 'web';
const OUT_PATH = path.resolve(__dirname, '../static/');
const ALIASES = {
	libs: path.resolve(__dirname, 'libs/'),
	src: path.resolve(__dirname, 'src/'),
	test: path.resolve(__dirname, 'test/')
};

//	In case we need a separate tests bundling
const testsConfig = {
	target: TARGET,
	mode: 'development',
	devtool: 'source-map',
	entry: './test/main.js',
	resolve: { alias: ALIASES },
	output: {
		filename: 'tests.js',
		path: OUT_PATH
	},
	module: {
		rules: [
			{
				// Use the source map loader for all JS files to bundle them in
			//	test: /\.js$/,
			//	use: [ 'source-map-loader' ],
			//	enforce: 'pre'
			}
		]
	}
};

//	Node.js exports, intereted by Webpack
module.exports = [
	testsConfig
];

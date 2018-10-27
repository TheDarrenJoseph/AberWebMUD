const path = require('path');
const TARGET = 'web';
const MODE = 'development'; // "production" | "development" | "none"
const OUT_PATH = path.resolve(__dirname, '../static/');
const ALIASES = {
	libs: path.resolve(__dirname, 'libs/'),
	src: path.resolve(__dirname, 'src/'),
	test: path.resolve(__dirname, 'test/')
};

const serverConfig = {
	target: TARGET,
	mode: MODE,
	entry: './src/main.js',
	resolve: { alias: ALIASES },
	output: {
		filename: 'main.js',
		path: OUT_PATH
	}
};

// Enable development source mapping
if (MODE === 'development') {
	serverConfig.devtool = 'cheap-module-source-map';
}

//	In case we need a separate tests bundling
const testsConfig = {
	target: TARGET,
	mode: MODE,
	entry: './test/main.js',
	resolve: { alias: ALIASES },
	output: {
		filename: 'tests.js',
		path: OUT_PATH
	}
};

//	Node.js exports, intereted by Webpack
module.exports = [
	serverConfig, testsConfig
];

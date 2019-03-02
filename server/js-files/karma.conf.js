// const testConfig = require('./webpack.test.js');

// Karma configuration
// Generated on Wed Oct 31 2018 22:40:20 GMT+0000 (Greenwich Mean Time)

const HTTP_URL = 'http://localhost';
const PORT = 5001;

module.exports = function (config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '../static/',
		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['qunit'],
		plugins: ['karma-firefox-launcher', 'karma-qunit', 'karma-sourcemap-loader'],
		// list of files / patterns to 1load in the browser
		files: [
			{ pattern: 'tests.js', included: true, served: true },
			{ pattern: 'tests.js.map', included: false, served: true, watched: false, nocache: true },
			// Atlas images
			{ pattern: 'assets/**/*.png', included: false, served: true, watched: false, nocache: false },
			// Atlas files
			{ pattern: 'assets/**/*.json', included: false, served: true, watched: false, nocache: false }
		],
		// Proxy asset requests to the correct folder
		proxies: {
			'/static/': HTTP_URL + ':' + PORT + '/base/'
		},
		// Load the source map
		preprocessors: {
			'tests.js': [ 'sourcemap' ]
		},
		//webpack: testConfig,
		// webpackServer: { noInfo: true }
		// client configuration
		client: {
			clearContext: false,
			qunit: {
				showUI: true,
				testTimeout: 1000
			}
		},
		browserNoActivityTimeout: 60000,
		// list of files / patterns to exclude
		exclude: [
			''
		],
		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		//	preprocessors: {
		//	},
		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress'],
		// web server port
		port: PORT,
		// enable / disable colors in the output (reporters and logs)
		colors: true,
		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_ERROR,
		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,
		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['Firefox'],
		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,
		// Let the browser die if it gets killed / crashes
		retryLimit: 0,
		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	});
};

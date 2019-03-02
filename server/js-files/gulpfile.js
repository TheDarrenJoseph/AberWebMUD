// Get src and dest from gulp
const { src, dest, series } = require('gulp');

const rollup = require('rollup');
const sourcemaps = require('rollup-plugin-sourcemaps');
const alias = require('rollup-plugin-alias');

// rollup util plugins to help us understand our libs
const resolveNodePackages = require ('rollup-plugin-node-resolve');
const commonjs = require ('rollup-plugin-commonjs');
//const nodebuiltins = require ('rollup-plugin-node-builtins');
//const nodeglobals = require ('rollup-plugin-node-globals');

const del = require('delete');
const path = require('path');


const MAINFILE_IN_URI = 'src/main.js';
const TESTFILE_IN_URI = 'test/main.js';

const MAINFILE_OUT_URI = '../static/main.js';
const TESTFILE_OUT_URI = '../static/tests.js';
const SOURCEMAP_WILDCARD_URI = "../static/*.js.map";

const SOURCEMAP_GEN = true;

const paths = {
  src : 	 path.resolve(__dirname, 'src/'), 
  libs : 	 path.resolve(__dirname, 'libs/'), 
  test: 	 path.resolve(__dirname, 'test/')
};

function rollupBundleModule(inUri, outUri, cb) {
	console.log('rollup bundling: ' + inUri);
	
	if (SOURCEMAP_GEN) {
		console.log('With source mappings.')
	}

	let bundlePromise = rollup.rollup({
		input: inUri,
		output: {sourcemap:SOURCEMAP_GEN},
		plugins: [ sourcemaps(), alias ( paths ), resolveNodePackages({browser:true, preferBuiltins: false}), 
			commonjs()]
	});
	
	let bundleWritePromise = bundlePromise.then(
		(mainBundle) => { 
			// Output as self-executing function
			return mainBundle.write( { file: outUri, sourcemap: SOURCEMAP_GEN, format: 'iife'}) 
		},
		(err) => {
			console.log('Failed to generate rollup bundle: ' + err);
			console.log(err)
			cb(new Error('Failed to generate rollup bundle for: ' + inUri));
		}
	);
	
	return bundleWritePromise.then(console.log('Bundle outputted as: ' + outUri));
}


function promiseMainModule(cb) {
 	return rollupBundleModule(MAINFILE_IN_URI, MAINFILE_OUT_URI, cb);
}

function promiseTestModule(cb) {
	return rollupBundleModule(TESTFILE_IN_URI, TESTFILE_OUT_URI, cb);
}

function clean (cb) {
	console.log('Cleaning up static JS output files..');
	// Just delete any output files we find
	del([MAINFILE_OUT_URI, TESTFILE_OUT_URI, SOURCEMAP_WILDCARD_URI], {force: true}, cb);
}

// Bundle / Minify
function build (cb) {
	let mainFilePromise = promiseMainModule(cb);
	let testFilePromise = promiseTestModule(cb);

	return Promise.all([mainFilePromise, testFilePromise]);

}
// Bundle / Minify
function buildTest (cb) {
	let testFilePromise = promiseTestModule(cb);

	return Promise.all([testFilePromise]);

}


exports.default = series(clean, build);
exports.build = build;
exports.buildTest = buildTest;
exports.clean = clean;


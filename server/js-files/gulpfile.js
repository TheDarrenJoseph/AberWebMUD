// Get src and dest from gulp
const { src, dest, series, watch } = require('gulp');

const rollup = require('rollup');
const sourcemaps = require('rollup-plugin-sourcemaps');
const alias = require('rollup-plugin-alias');

// rollup util plugins to help us understand our libs
const resolveNodePackages = require ('rollup-plugin-node-resolve');
const commonjs = require ('rollup-plugin-commonjs');
const nodebuiltins = require ('rollup-plugin-node-builtins');
//const nodeglobals = require ('rollup-plugin-node-globals');

const del = require('delete');
const path = require('path');
const fs = require('fs');

// For gulp readable streams
const through = require('through2')

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

const EXCLUDED_TESTFILES = [TESTFILE_IN_URI, 'MapModelBuilder.js']
const EXCLUDED_TESTPATHS = ['utils/']

/**
function generateImport(vinylFile) {
	//console.log(JSON.stringify(chunk))
	let filePath = vinylFile.path;
	let relativePath = filePath.match("test/.*")[0]

	return 'import \''+relativePath+'\'';
}
**/

function generateImportLine(vinylFile, enc, cb) {
	//console.log(JSON.stringify(chunk))
	let filePath = vinylFile.path;
	let relativePath = filePath.match("test/.*")[0]

	let excluded = false;
	EXCLUDED_TESTPATHS.forEach( excludedPath => {
		if (relativePath.includes(excludedPath)) {
			console.log('Excluding: ' + relativePath + ' from import declarations, matches exclusion: ' + excludedPath);
			excluded = true;
			return;
		}
	});
	
	if (!excluded) {
		EXCLUDED_TESTFILES.forEach( excludedPath => {
			if (relativePath.endsWith(excludedPath)) {
				console.log('Excluding: ' + excludedPath + ' from import declarations.. ');
				excluded = true;
				return;
			}
		});
	}

	
	if (excluded) {
		cb();
	} else { 
		vinylFile.importLine = 'import \''+relativePath+'\'';
		cb(null, vinylFile);
	} 
}

function genTestMainfile(cb) {
	console.log('=== Generating the test main.js file ===')
	let testFilesPath = paths['test']+"/**/*.js"
	let outputPath = path.resolve(TESTFILE_IN_URI);
	console.log(testFilesPath);
	console.log(outputPath);
	let fileStream = src(testFilesPath)
	let imports = []
	/**
	fileStream.on('data', (vinylFile) => { 
		let imp = generateImport(vinylFile) 
		if (imp !== undefined) imports.push(imp);
	})
	//fileStream.on('readable', () => { generateImports(fileStream.read())})
	fileStream.on('end',() =>{
		console.log(imports);
		cb()
	})
	**/

	fileStream.pipe(through.obj(generateImportLine))
		.pipe(through.obj((file, enc, cb) => {
			fs.appendFile(TESTFILE_IN_URI, file.importLine + '\n' , cb );
		}))

	return fileStream;
}

function promiseBundleWrite(bundle, outUri) {
	console.log('Writing bundle: ' + outUri)
	// Output as self-executing function
	return bundle.write( { 
		file: outUri, 
		sourcemap: SOURCEMAP_GEN, 
		format: 'iife'})
		.then(() => {
		    console.log('Bundle written to: ' + outUri)
		});
}

function rollupBundleModule(inUri, outUri, cb) {
	console.log('rollup bundling: ' + inUri);
	if (SOURCEMAP_GEN) console.log('With source mappings.')

	//let rollupPlugins = [ sourcemaps(), alias ( paths ), resolveNodePackages({browser:true, preferBuiltins: true}), commonjs()]
	let rollupPlugins = [ alias ( paths ), commonjs()]
	console.log('Attempting rollup..');
	return new Promise((resolve, reject) => {
		rollup.rollup({
			input: inUri,
			output: {sourcemap:SOURCEMAP_GEN},
			plugins: rollupPlugins
		}).then((bundle) => {
			console.log('bundle rolled up. trying to write to: ' + outUri);
			return promiseBundleWrite(bundle, outUri)
		}).then(() =>{
			console.log('Bundle complete')
			resolve();
		}).catch(reject)
	});
}


function promiseMainModule(cb) {
 	return rollupBundleModule(MAINFILE_IN_URI, MAINFILE_OUT_URI, cb);
}

function promiseTestModule(cb) {
	return rollupBundleModule(TESTFILE_IN_URI, TESTFILE_OUT_URI, cb);
}
	

function cleanInputFiles (cb) {
	console.log('Cleaning up test mainfile..');
	del([ TESTFILE_IN_URI ], {force: true}, cb);
}


function cleanOutputFiles (cb) {
	console.log('Cleaning up static JS output files..');
	// Just delete any output files we find
	del([MAINFILE_OUT_URI, TESTFILE_OUT_URI, SOURCEMAP_WILDCARD_URI ], {force: true}, cb);
}

// Bundle / Minify
function buildMain (cb) {
	let mainFilePromise = promiseMainModule(cb);
	return Promise.all([mainFilePromise]);
}

// Bundle / Minify
function buildTest (cb) {
	let testFilePromise = promiseTestModule(cb);
	return Promise.all([testFilePromise]);
}

// Bundle / Minify
function build (cb) {
	let mainFilePromise = promiseMainModule(cb);
	let testFilePromise = promiseTestModule(cb);
	return Promise.all([mainFilePromise, testFilePromise]);
}

// Clean, rebuild, and watch for changes
function buildAndWatchFiles(cb) {
	build(() => {
		console.log('Build complete..')
	}).then(() => {
		console.log('Watching for changes..');
		
		let srcWatch = watch("src/**/*.js", series(cleanInputFiles, cleanOutputFiles, buildMain));
		let testWatch = watch(["test/**/*.js", "!test/main.js"], series(cleanInputFiles, cleanOutputFiles, genTestMainfile, buildTest));
		return Promise.all([srcWatch, testWatch]);
	}).catch((reason) => {
		console.log('Build and watch failed: ' + reason);
		cb();
	})
}

console.log('=== AberWebMUD JS Client ===')
exports.default = series(cleanInputFiles, cleanOutputFiles, genTestMainfile, promiseMainModule, promiseTestModule);
exports.watch = series(cleanInputFiles, cleanOutputFiles, genTestMainfile, buildAndWatchFiles);
exports.build = series(promiseMainModule, promiseTestModule);
exports.buildTest = buildTest;
exports.buildTestMain = genTestMainfile;
exports.clean = series(cleanInputFiles, cleanOutputFiles);


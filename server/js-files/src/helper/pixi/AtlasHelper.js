// Helper class for working with texture PixiJS atlasses / spritesheets
import * as PIXI from 'libs/pixi.min.js';

// Use PixiJS's premade resource loader
//	PIXI.loaders.Loader

let resourceQueue = [];
let loaderBusy = false;

function loadSubtexture (spriteSheet, subtileName) {
	// DEBUG
	var subTexture = spriteSheet.textures[subtileName];
	if (subTexture != null) {
		return subTexture;
	} else {
		throw String('No tile atlas subtile (not in tile atlas JSON?): ' + subtileName);
	}
}

// Extract the subTexture from a loaded spritesheet asses
function getLoadedSpritesheet (loader, resources, tileAtlasPath) {
	// Try using our loaded resource
	let atlasTexture = resources[tileAtlasPath];

	if (atlasTexture != null) {
		let spriteSheet = atlasTexture.spritesheet;
		//	Check the texture
		if (spriteSheet != null) {
			return spriteSheet;
		} else {
			throw String('Error loading tile atlas (not known to loader?): ' + tileAtlasPath);
		}
	}
}

var loaderListenerMappings = {};

// Wrappers operations on a PixiJS texture atlas
export default class AtlasHelper {
	static async loadAtlas (tileAtlasPath) {
		let atlasPromise = AtlasHelper.promiseAtlasLoading(tileAtlasPath, (loader, resources, tileAtlasPath) => {
			return tileAtlasPath;
		});

		await atlasPromise;
	}

	static async getAtlasSubtexture (tileAtlasPath, subtileName) {
		// Create an atlas Promise for loading the atlas
		// Hookup to a method for handling the returned spriteSheet
		// Then load the subtexturee
		let atlasPromise = AtlasHelper.promiseAtlasLoading(tileAtlasPath, getLoadedSpritesheet);
		let spriteSheet = await atlasPromise;
		loadSubtexture(spriteSheet, subtileName);

		console.log('Awaited promise resolved with:');
		console.log(spriteSheet);
		return spriteSheet;
	};

	static promiseAtlasLoading (tileAtlasPath, callback) {
		// console.log('Loader state:');
		// console.log(PIXI.loader);

		if (PIXI.loader.resources[tileAtlasPath] !== undefined && PIXI.loader.resources[tileAtlasPath].isComplete) {
			console.log('Atlas already loaded: ' + tileAtlasPath);
			return new Promise((resolve) =>
			resolve(callback(PIXI.loader, PIXI.loader.resources, tileAtlasPath)));
		} else if (resourceQueue.indexOf(tileAtlasPath) === -1) {
			console.log('Queuing up Atlas: ' + tileAtlasPath);
			resourceQueue.push(tileAtlasPath);

			if (!loaderBusy) {
				AtlasHelper.promiseResourceLoading(callback);
			} else {
				console.log('Awaiting free loader');
				// Call us back when the loader is free
				let callbackFunc = function () { AtlasHelper.promiseResourceLoading(callback); };
				loaderListenerMappings[tileAtlasPath] = callbackFunc;
				document.addEventListener('loaderFree', callbackFunc);
			}
		}
	}

	static promiseResourceLoading (callback) {
		// We can use .use here if needed to callback to some middleware parser
		// Allowing us to do s	etup ready for our loaded asset.
		if (resourceQueue.length > 0) {
			let resource = resourceQueue.pop();

			// Use a promise to wrap the load callback
			return new Promise((resolve) => {
				loaderBusy = true;
				// Load a PIXI.Spritesheet
				PIXI.loader.load((loader, resources) => {
					loader.reset();

					// Add the fully qualified path to the files to the loader
					// Queue up the atlas
					console.log('Adding resource to loader.');
					console.log(resource);
					PIXI.loader.add(resource);

									// Free up the loader
					loaderBusy = false;
					console.log('loader free!');
					// Fire off an event signalling the loader is free
					document.dispatchEvent(new Event('loaderFree'));

					// Clear a listener mapping if present
					if (loaderListenerMappings.resource !== undefined) {
						let mapping = loaderListenerMappings[resource];
						console.log('Clearing listener for resource: ' + resource);
						// Clear the event listener so we don't trigger a pop
						document.removeEventListener('loaderFree', mapping);
					}

					// resolve the promise
					resolve(callback(loader, resources, resource));
				});
			});
		}
	}
}

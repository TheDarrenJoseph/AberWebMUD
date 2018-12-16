// Helper class for working with texture PixiJS atlasses / atlass
import * as PIXI from 'libs/pixi.min.js';

// Use PixiJS's premade resource loader
//	PIXI.loaders.Loader

// We keep our own queue of what's been sent to the loader
// So we can queue up stuff for the next .load() batch
var loaderQueue = [];
var loaderBusy = false;

// Event Mapping for a resource
class ResourceMapping {
	constructor (resourcePath, event, callback) {
		this.event = event;
		document.addEventListener('loaderFree', this.mapping);
		// Setup the mapping
		this.mapping = function () {
			console.log('ResourceMapping called: ' + this.event);
			this.clearLoaderListener();
			callback();
		};
	}

	clearLoaderListener () {
		console.log('ResourceMapping complete: ' + this.event);
		document.removeEventListener('loaderFree', this.mapping);
	}
}

// Wrappers operations on a PixiJS texture atlas
export default class AtlasHelper {
	static getLoader () {
		return PIXI.loader;
	}

	static getResources () {
		return PIXI.loader.resources;
	}

	static getResource (resourcePath) {
		return PIXI.loader.resources[resourcePath];
	}
	
	static isResourceQueued (resourcePath) {
		return AtlasHelper.getQueuedResourceIndex(resourcePath) !== -1 
	}
	
	static isResourceLoading (resourcePath) {
		PIXI.loader.resources[resourcePath] !== undefined && PIXI.loader.resources[resourcePath].isLoading;
	}

	static isResourceLoaded (resourcePath) {
		return PIXI.loader.resources[resourcePath] !== undefined && PIXI.loader.resources[resourcePath].isComplete;
	}

	static isLoaderBusy () {
		return loaderBusy;
	}

	// Extract the subTexture from a loaded atlas
	// atlas - A fully loaded Pixi Resource describing the .json atlas
	// subtileName - the frameId of the subTexture
	static _getLoadedAtlasTexture (atlas, frameId, callback) {
		// Try using our loaded resource
		if (atlas !== undefined && atlas !== null) {
			let textures = atlas.textures;

			if (frameId === undefined || frameId === null) {
				throw new RangeError('No subtileName to load provided.');
			}

			if (textures !== undefined && textures !== null) {
				let subTexture = textures[frameId];
				if (subTexture !== undefined && subTexture !== null) {
					callback(subTexture);
				} else {
					throw new RangeError('Error loading tile atlas subtexture / frameId: ' + frameId);
				}
			} else {
				throw new RangeError('No textures in the provided atlas:' + atlas);
			}
		} else {
			throw new RangeError('No atlas to load subtexture from: ' + atlas);
		}
	}
	
	static getQueuedResourceIndex (resourcePath) {
		return loaderQueue.indexOf(resourcePath);
	}
	
	// Add a resource to the queue if possible
	// returns the index if success
	// throws an Error if we've queued it up before
	static addToLoaderQueue (resourcePath) {
		var queueIndex = loaderQueue.indexOf(resourcePath);
		if (queueIndex == -1) {
			loaderQueue.push(resourcePath);
			return loaderQueue.indexOf(resourcePath);
		} else {
			throw Error('Duplicate! Resource path already queued for the Loader: ' + resourcePath);
		}
	}
	
	static removeFromLoaderQueue(resourcePath) {
		var queueIndex = loaderQueue.indexOf(resourcePath);
		if (queueIndex !== -1) {
			// Remove it from the queue
			return loaderQueue.splice(queueIndex, 1);
		}
	}
	
	// For once a resource is loaded, log it and reset stuff
	static _resourceLoaded (...resourcePaths) {
		resourcePaths.forEach(resourcePath => {
			console.log('Resource completely loaded: ' + resourcePath);
		});
		AtlasHelper._freeLoader();
	}

	static _freeLoader () {
		// Free up the loader
		loaderBusy = false;
		// Fire off an event signalling the loader is free
		document.dispatchEvent(new Event('loaderFree'));
	}

	// Setup a callback for when the loader is free
	// Also maps it so we can handle listeners for it
	static mapResourceCallbackForLoaderFree (resourcePath, callback) {
		return new ResourceMapping('loaderFree', resourcePath, callback);
		// resourceMappings.push(mapping);
	}

	static loadAtlasSubtexture (atlasPath, subtileName, callback) {
		let argMessage = 'Attempting load of atlas: ' + atlasPath + ', ' + subtileName + ', ' + callback;

		if (atlasPath !== null && atlasPath !== undefined &&
		subtileName !== null && subtileName !== undefined &&
		callback !== null && callback !== undefined) {
			// This is the call we want to make
			// but it requires atlasPath to be loaded
			var onSheetCall = function () {
				let atlas = AtlasHelper.getResource(atlasPath);
				AtlasHelper._getLoadedAtlasTexture(atlas, subtileName, callback);
			};

			let loading = AtlasHelper.isResourceLoading(atlasPath);
			let loaded = AtlasHelper.isResourceLoaded(atlasPath);
			let queued = AtlasHelper.isResourceQueued(atlasPath);
			
			// If we've loaded the atlas, callback straight away
			if (loaded) {
				// console.log('loadAtlasSubtexture - Atlas is already loaded: ' + atlasPath);
				// If we have it already, use it
				onSheetCall();
			} else if (loading) {
				// console.log('loadAtlasSubtexture - Atlas is loading, adding callback. ' + atlasPath);
				AtlasHelper.getLoader().onComplete.add(() => {
					console.log('loadAtlasSubtexture - loading atlas is finished.');
					let atlas = AtlasHelper.getResource(atlasPath);
					console.log(atlas);
					onSheetCall();
				});
			} else {
				// Otherwise let us know and try to load it
				// console.log('Cannot extract texture! Provided Atlas is not loading or loaded!');
				console.log('loadAtlasSubtexture - Atlas not ready for use, attemting load of pixi resource: ' + atlasPath);
				AtlasHelper.attemptLoadPixiResource(atlasPath, -1 ,() => {
					// console.log('loadAtlasSubtexture - attempted atlas load is complete.');
					onSheetCall();
				});
			}
		} else {
			throw new RangeError(argMessage);
		}
	}

	static attemptLoadPixiResource (resourcePath, resourceQueueIndex, callback) {
		let resourcePathToLoad = resourcePath;
		
		let loading = AtlasHelper.isResourceLoading(resourcePath);
		let loaded = AtlasHelper.isResourceLoaded(resourcePath);
		let queued = AtlasHelper.isResourceQueued(resourcePath);

		if (loaded) {
			console.log('Resource already loaded..' + resourcePath);
			callback();
		}

		if (loading) {
			console.log('Resource already loading..' + resourcePath);
			AtlasHelper.getLoader().onComplete.add(callback);
		}
	
		// Try to use the loader
		if (!loading && !loaded && !loaderBusy) {
			// We've already queued up  a resource
			if (queued) {
				resourcePathToLoad = resourceQueue[resourceQueueIndex];
				console.log('Loading queued resource: ' + resourcePath);
				AtlasHelper._loadPixiResource(resourceQueue[resourceQueueIndex], callback);
			} else {
				console.log('Loading resource: ' + resourcePath);
				AtlasHelper._loadPixiResource(resourcePath, callback);
			}
		}
		
		// Queue up resources if the loader is busy and try again
		if (!loading && !loaded && loaderBusy) {
			
			let resourceQueueIndex = -1;
			// Add to the queue for use on re-try
			try {
				resourceQueueIndex = AtlasHelper.addToLoaderQueue(resourcePath);
			} catch (err) {
				// Already queued up this resource..
				// Try again on freeing the loader 
				// to give time for this reasource to load / loading
				console.log('Resource already queued, will try again once loader is free: ' + resourcePath);
			}
			
			var tryAgain = function () {
				console.log('Trying to load resource again: ' + resourcePath);
				AtlasHelper.attemptLoadPixiResource(resourcePath, resourceQueueIndex, callback);
			};

			console.log('Waiting for loader free to load resource: ' + resourcePath);
			AtlasHelper.mapResourceCallbackForLoaderFree(resourcePathToLoad, tryAgain);
		}
	}

	// Actually add resources to the pixi loader
	// These NEED to be enqued on the resourceQueue to be used here
	// Also sets up callbacks
	static _loadPixiResource (resourcePath, callback) {
		if (!loaderBusy) {
			let resourceIndex = loaderQueue.indexOf(resourcePath);

			if (resourceIndex === -1) {
				// Lock the loader before performing any action
				loaderBusy = true;
				// Reset the loader queue
				PIXI.loader.reset();
				PIXI.loader.add(resourcePath);

				PIXI.loader.load(() => {
					// console.log('Internally complete from load.');
					// console.log('Load complete:' + resourcePath);
					AtlasHelper._resourceLoaded(resourcePath);
					callback();
				});

				// PIXI.loader.onProgress.add(() => {
				// 	console.log('Loader progressed!');
				// });

				PIXI.loader.onError.add((err, loader, resource) => {
					throw new Error('Resource Loader -- failed with err: ' + err + ' during loading of resource: ' + resource);
				});
			}
		} else {
			throw new Error('Loader is busy at the moment!');
		}
	}
}

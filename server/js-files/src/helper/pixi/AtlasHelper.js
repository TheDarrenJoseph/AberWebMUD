// Helper class for working with texture PixiJS atlasses / atlass
// Use PixiJS's premade resource loader
//	PIXI.loaders.Loader
import PIXI from 'libs/pixi.min.js';
// We keep our own queue of what's been sent to the loader
// So we can queue up stuff for the next .load() batch
// var loaderQueue = [];
// Also keep our own log of loaded resource paths
//var loaded = [];
// Keeping our event mappings in scope
var eventMappings = [];
var loaderBusy = false;

const DEBUG = false;

var LOADER_FREE_EVENT = 'loaderFree';

// Event Mapping for loader free
class EventMapping {
	constructor (event, cb) {
		this.event = event;
		this.cb = cb;
		document.addEventListener(event, () => {this.mapping.apply(this)});
	}

	mapping () {
			document.removeEventListener(this.event, this.mapping);
			AtlasHelper.removeEventMapping(this);
			this.cb();
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

	//static isResourceQueued (resourcePath) {
	//	return AtlasHelper.getQueuedResourceIndex(resourcePath) !== -1
	//}

	static isResourceLoading (resourcePath) {
		let resource = PIXI.loader.resources[resourcePath];
		return (resource !== undefined && resource.isLoading);
	}

	static isResourceLoaded (resourcePath) {
		let resource = PIXI.loader.resources[resourcePath];
		return (resource !== undefined && resource.isComplete);
	}

	static isLoaderBusy () {
		return loaderBusy || AtlasHelper.isLoaderLoading();
	}

	// Extract the subTexture from a loaded atlas
	// atlas - A fully loaded Pixi Resource describing the .json atlas
	// subtileName - the frameId of the subTexture
	static _getLoadedAtlasTexture (atlas, frameId, callback) {
		
		// Try using our loaded resource
		if (atlas !== undefined && atlas !== null &&
				atlas.name !== undefined && atlas.name !== null) {

			if (frameId === undefined || frameId === null) {
				throw new RangeError('No subtileName to load provided.');
			}
			
			let textures = atlas.textures;
			if (textures !== undefined && textures !== null) {
				let subTexture = textures[frameId];
				if (subTexture !== undefined && subTexture !== null) {
					callback(subTexture);
				} else {
					throw new RangeError('Error loading tile atlas subtexture / frameId: ' + frameId);
				}
			} else {
				throw new RangeError('No textures in the provided atlas:' + atlas.name);
			}
		} else {
			throw new RangeError('No atlas to load sub-texture from: ' + atlas);
		}
	}

	//static getQueuedResourceIndex (resourcePath) {
	//	return loaderQueue.indexOf(resourcePath);
	//}

	// Add a resource to the queue if possible
	// returns the index if success
	// throws an Error if we've queued it up before
	//static addToLoaderQueue (resourcePath) {
	//	var queueIndex = loaderQueue.indexOf(resourcePath);
	//	if (queueIndex == -1) {
	//		loaderQueue.push(resourcePath);
	//		return queueIndex;
	//	} else {
	//		throw Error('Duplicate! Resource path already queued for the Loader: ' + resourcePath);
	//	}
	//}

	static removeEventMapping (eventMapping) {
		var queueIndex = eventMappings.indexOf(eventMapping);
		if (queueIndex !== -1) {
			// Remove it from the queue
			let eventMapping = eventMappings[queueIndex];
			//Remove it
			eventMappings.splice(queueIndex);
			// console.log("Cleared event mapping for: "+eventMapping.event);
		}
		
	}

	static isLoaderLoading() {
		let loaderLoading = PIXI.loader.loading;
		let loaderProgress = PIXI.loader.progress

		if(loaderLoading) {
			console.log('Loader is currently in progress on a queue, loading: ' + loaderLoading + ' progress: ' + loaderProgress + '%');
			return true;
		}

		return false;
	}

	//static removeFromLoaderQueue (resourcePath) {
	//	var queueIndex = loaderQueue.indexOf(resourcePath);
	//	if (queueIndex !== -1) {
	//		// Remove it from the queue
	//		return loaderQueue.splice(queueIndex, 1);
	//	}
	//}

	// For once a resource is loaded, log it and reset stuff
	static _resourceLoaded (...resourcePaths) {
		resourcePaths.forEach(resourcePath => {
			// Remove from the queue if present
			// AtlasHelper.removeFromLoaderQueue(resourcePath);
			console.log('Atlas Helper - Resource completely loaded: ' + resourcePath);
			let resourceLoadedEventName = AtlasHelper.getResourceLoadedEventName(resourcePath);
			document.dispatchEvent(new Event(resourceLoadedEventName));
		});
	}

	static _freeLoader () {
		// Free up the loader
		loaderBusy = false;
		// Fire off an event signalling the loader is free
		document.dispatchEvent(new Event(LOADER_FREE_EVENT));
	}

	// Setup a callback for when the loader is free
	// Also maps it so we can handle listeners for it
	static mapEvent (event, callback) {
		eventMappings.push(new EventMapping(event, callback));
	}

	static getResourceLoadedEventName (resourcePath) {
		return 'resource loaded: ' + resourcePath;
	}

	// Politely loads / accesses an atlas resource
	// Handling loading / queued / loaded / loader busy statuses. (waiting if needed)
	// Then extracts the subtile mentioned
	// Finally calling back the passed callback
	static loadAtlasSubtexture (atlasPath, subtileName, callback) {
		return new Promise ((resolve, reject) => {
			if (atlasPath !== null && atlasPath !== undefined && subtileName !== null && subtileName !== undefined) {
				// This is the call we want to make
				// but it requires atlasPath to be loaded
				AtlasHelper.attemptLoadPixiResource(atlasPath, () => {
					let loaded = AtlasHelper.isResourceLoaded(atlasPath);
					let atlas = AtlasHelper.getResource(atlasPath);

					if (!loaded) {
						console.log('Extracting subtexture, no atlas!');
						let atlas = AtlasHelper.getResource(atlasPath);
						console.log(atlas);
					}

					try {
						AtlasHelper._getLoadedAtlasTexture(atlas, subtileName, resolve);
					} catch (err) {
						reject(err);
					}
				});
			} else {
				let argMessage = 'Failed to load atlas: ' + atlasPath + ', ' + subtileName;
				reject(new RangeError(argMessage));
			}
		});
	}

	// A function for politely asking for a resource
	// Handling loading / queued / loaded / loader busy statuses. (waiting if needed)
	// Finally calling back when the resource it truly available
	static attemptLoadPixiResource (resourcePath, callback) {
		let loading = AtlasHelper.isResourceLoading(resourcePath);
		let loaded = AtlasHelper.isResourceLoaded(resourcePath);
		//let queued = AtlasHelper.isResourceQueued(resourcePath);

		if (DEBUG) console.log('Attempting load of resource: '+resourcePath)
		if (loaded) {
			// console.log('Resource already loaded: ' + resourcePath);
			callback();
			return;
		}

		if (loading) {
			if (DEBUG) console.log('Resource already loading, waiting for: ' + resourcePath);
			let resourceLoadedEventName = AtlasHelper.getResourceLoadedEventName(resourcePath);
			AtlasHelper.mapEvent(resourceLoadedEventName, callback);
			return;
		}

		// Try to use the loader
		if (!AtlasHelper.isLoaderBusy()) {
			try {
				AtlasHelper._loadPixiResource(resourcePath, callback);
			} catch (err) {
				throw new Error(err);
			}
		} else {
			if (DEBUG) console.log('Waiting for loader free to load resource: ' + resourcePath);
			AtlasHelper.mapEvent(LOADER_FREE_EVENT, () => {
				if (DEBUG) console.log('Trying to load resource again: ' + resourcePath);
				AtlasHelper.attemptLoadPixiResource(resourcePath, callback);
			});

			return;
		}
	}

	static handlePixiLoadComplete(resourcePath, callback) {
		console.log('Loader finished..' + resourcePath);

		//let resource = AtlasHelper.getResource(resourcePath);
		// loadedResources[resourcePath] = resource;

		AtlasHelper._resourceLoaded(resourcePath);
		callback();

		// Reset the loader queue
		// and all resources loaded so far
		// PIXI.loader.reset();
		AtlasHelper._freeLoader();
	}

	static handlePixiResourcesLoaded(loader, resources) {
		Object.keys(resources).forEach( (key) => {
			let resource = resources[key];
			console.log('Pixi Loader Loaded ' + resource.url);
		});
	}

	static handlePixiLoadError(err, loader, resource) {
		AtlasHelper._freeLoader();
		throw new Error('Resource Loader -- failed with err: ' + err + ' during loading of resource: ' + resource);
	}

	// Actually add resources to the pixi loader
	// These NEED to be enqued on the loaderQueue to be used here
	// Also sets up callbacks
	static _loadPixiResource (resourcePath, callback) {

		if (!AtlasHelper.isLoaderBusy()) {
			//let resourceIndex = loaderQueue.indexOf(resourcePath);

			if (resourcePath !== null && resourcePath !== undefined) {
				// Lock the loader before performing any action
				loaderBusy = true;

				// Queue up the single path
				PIXI.loader.add(resourcePath, () => AtlasHelper.handlePixiLoadComplete(resourcePath, callback));
				console.log('Resource added to PIXI loader queue: ' + resourcePath);
				PIXI.loader.onError.add((err, loader, resource) => AtlasHelper.handlePixiLoadError(err, loader, resource));
				PIXI.loader.load((loader, resources) => AtlasHelper.handlePixiResourcesLoaded(loader, resources));

				/**
				PIXI.loader.onComplete.add(() => {
					console.log('Loader finished..' + resourcePath);
					
					let resource = AtlasHelper.getResource(resourcePath);
					// loadedResources[resourcePath] = resource;
									
					AtlasHelper._resourceLoaded(resourcePath);
					callback();

					// Reset the loader queue
					// and all resources loaded so far
					// PIXI.loader.reset();
					AtlasHelper._freeLoader();
				});**/
				

			} else {
				throw new RangeError('Resource is not defined: ' + resourcePath);
			}
		} else {
			throw new RangeError('Bad timed call! Loader is busy at the moment!');
		}
	}
}

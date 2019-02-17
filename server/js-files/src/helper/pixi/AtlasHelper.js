// Helper class for working with texture PixiJS atlasses / atlass
// Use PixiJS's premade resource loader
//	PIXI.loaders.Loader
import * as PIXI from 'libs/pixi.min.js';
// We keep our own queue of what's been sent to the loader
// So we can queue up stuff for the next .load() batch
var loaderQueue = [];
// Also keep our own log of loaded resource paths
//var loaded = [];
// Keeping our event mappings in scope
var eventMappings = [];
var loaderBusy = false;

var LOADER_FREE_EVENT = 'loaderFree';

// Event Mapping for loader free
class EventMapping {
	constructor (event, callback) {
		this.event = event;
		this.callback = callback;
		document.addEventListener(event, () => {this.mapping.apply(this)});
	}

	mapping () {
			document.removeEventListener(this.event, this.mapping);
			AtlasHelper.removeEventMapping(this);
			this.callback();
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
		let resource = PIXI.loader.resources[resourcePath];
		return (resource !== undefined && resource.isLoading);
	}

	static isResourceLoaded (resourcePath) {
		let resource = PIXI.loader.resources[resourcePath];
		return (resource !== undefined && resource.isComplete);
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
			return queueIndex;
		} else {
			throw Error('Duplicate! Resource path already queued for the Loader: ' + resourcePath);
		}
	}

	static removeEventMapping (eventMapping) {
		var queueIndex = eventMappings.indexOf(eventMapping);
		if (queueIndex !== -1) {
			// Remove it from the queue
			loaderQueue.splice(queueIndex, 1);
		}
	}

	static removeFromLoaderQueue (resourcePath) {
		var queueIndex = loaderQueue.indexOf(resourcePath);
		if (queueIndex !== -1) {
			// Remove it from the queue
			return loaderQueue.splice(queueIndex, 1);
		}
	}

	// For once a resource is loaded, log it and reset stuff
	static _resourceLoaded (...resourcePaths) {
		resourcePaths.forEach(resourcePath => {
			// Remove from the queue if present
			AtlasHelper.removeFromLoaderQueue(resourcePath);

			let resourceLoadedEventName = AtlasHelper.getResourceLoadedEventName(resourcePath);
			document.dispatchEvent(new Event(resourceLoadedEventName));

			console.log('Atlas Helper - Resource completely loaded: ' + resourcePath);
		});
		// console.log('Pixi Loader freed.');
		AtlasHelper._freeLoader();
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
		let argMessage = 'Attempting load of atlas: ' + atlasPath + ', ' + subtileName + ', ' + callback;

		if (atlasPath !== null && atlasPath !== undefined &&
		subtileName !== null && subtileName !== undefined &&
		callback !== null && callback !== undefined) {
			// This is the call we want to make
			// but it requires atlasPath to be loaded
			AtlasHelper.attemptLoadPixiResource(atlasPath, () => {
				// console.log('Extracting subtexture, is atlas there? : ' + AtlasHelper.isResourceLoaded(atlasPath))
				let atlas = AtlasHelper.getResource(atlasPath);
				AtlasHelper._getLoadedAtlasTexture(atlas, subtileName, callback);
			});

		} else {
			throw new RangeError(argMessage);
		}
	}

	static tryResourceLoad (resourcePath, callback) {
		let loading = AtlasHelper.isResourceLoading(resourcePath);
		let loaded = AtlasHelper.isResourceLoaded(resourcePath);
		let queued = AtlasHelper.isResourceQueued(resourcePath);

		// Try to use the loader
		if (!loading && !loaded && !loaderBusy && queued)  {
			AtlasHelper._loadPixiResource(resourcePath, callback);
		}

		//if (!queued) throw new RangeError();
	}

	// A function for politely asking for a resource
	// Handling loading / queued / loaded / loader busy statuses. (waiting if needed)
	// Finally calling back when the resource it truly available
	static attemptLoadPixiResource (resourcePath, callback) {
		let loading = AtlasHelper.isResourceLoading(resourcePath);
		let loaded = AtlasHelper.isResourceLoaded(resourcePath);
		let queued = AtlasHelper.isResourceQueued(resourcePath);

		// console.log('Attempting load of resource: '+resourcePath)

		// Queue up the resource if needed
		if (!loaded && !loading && !queued) {
			console.log('Adding resource to queue: ' + resourcePath);
			AtlasHelper.addToLoaderQueue(resourcePath);
		}

		if (loaded) {
			console.log('Resource already loaded: ' + resourcePath);
			callback();
		}

		if (loading) {
			// console.log('Resource already loading..' + resourcePath);
			let resourceLoadedEventName = AtlasHelper.getResourceLoadedEventName(resourcePath);
			AtlasHelper.mapEvent(resourceLoadedEventName, callback);
			return;
		}

		// Try to use the loader
		if (!loading && !loaded && !loaderBusy && queued) {
			AtlasHelper.tryResourceLoad(resourcePath, callback);
			return;
		}

		if (!loading && !loaded && loaderBusy && queued) {
			console.log('Waiting for loader free to load resource: ' + resourcePath);
			AtlasHelper.mapEvent(LOADER_FREE_EVENT, () => {
				console.log('Trying to load resource again: ' + resourcePath);
				AtlasHelper.tryResourceLoad(resourcePath, callback);
			});
			return;
		}

		var message = 'loading? ' + loading
									+' loaded? ' + loaded
									+' queued? ' + queued
									+	' loaderBusy? ' + loaderBusy;
		//throw new RangeError('Unexpected loader state when attempting to load a Pixi Resource! ' + message);
	}

	// Actually add resources to the pixi loader
	// These NEED to be enqued on the loaderQueue to be used here
	// Also sets up callbacks
	static _loadPixiResource (resourcePath, callback) {
		if (!loaderBusy) {
			let resourceIndex = loaderQueue.indexOf(resourcePath);

			if (resourceIndex != -1) {
				// Lock the loader before performing any action
				loaderBusy = true;
				// Reset the loader queue
				PIXI.loader.reset();
				// Queue up the single path
				console.log('PIXI Resource Loader is loading resource: ' + resourcePath);
				PIXI.loader.add(resourcePath);

				PIXI.loader.load((loader, resources) => {
					console.log(resources)

					Object.keys(resources).forEach( (key) => {
						let resource = resources[key];
						let trulyLoaded = AtlasHelper.isResourceLoaded(key);
						console.log('Loaded Resource URL ('+trulyLoaded+'): ' + resource.url);

						if (resource.error !== null) {
							console.log('Resource error: ' + resource.error);
						}
						//resource.data
					});

					AtlasHelper._resourceLoaded(resourcePath);
					callback();
				});

				PIXI.loader.onError.add((err, loader, resource) => {
					throw new Error('Resource Loader -- failed with err: ' + err + ' during loading of resource: ' + resource);
				});
			} else {
				throw new RangeError('Resource is not on the loader queue prior to load call: ' + resourcePath);
			}
		} else {
			throw new Error('Loader is busy at the moment!');
		}
	}
}

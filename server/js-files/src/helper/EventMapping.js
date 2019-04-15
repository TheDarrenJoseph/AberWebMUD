/**
 * Meant to be something similar to the Node.js EventEmitter,
 * leveraging EventTargeter for listener support
 * Helps with MVC Observer pattern for simple callbacks
 */
export default class EventMapping {
	constructor () {
		this.mappings = {};
	}

	// Perform event callbacks with the emitted data
	dispatchEvent(dispatchedEvent) {
		let callbacks = this.mappings[dispatchedEvent.type];
		let data = dispatchedEvent.data;

		// for DEBUG
		console.log('Dispatching Event: ' + dispatchedEvent.type);
		for (let i in callbacks) {
			let callback = callbacks[i];

			callback(data);

			if (callback.singleShot === true) {
				console.log('Clearing single-shot mapping..');
				// Splice out the 1 callback function
				this.mappings[dispatchedEvent.type].splice(i, 1);
			}

		}
	}

	/**
	 * Maps the given callback to the event
	 * @param event Event name (String)
	 * @param cb Callback function
	 */
	on (eventString, cb) {
		// Check for existing mappings
		let mappings = this.mappings[eventString];

		if (mappings instanceof Array) {
			this.mappings[eventString].push(cb);
		} else {
			this.mappings[eventString] = new Array(cb);
		}
	}

	/**
	 * Maps the given callback to the event, to be called only on the first emission of Event
	 * @param event Event name (String)
	 * @param cb Callback function
	 */
	once(eventString, cb) {
		// Set a property we can check for at dispatch
		cb.singleShot = true;
		this.on(eventString, cb);
	}

	emit (eventString, data) {
		let dispatchedEvent = new Event(eventString);
		dispatchedEvent.data = data;

		this.dispatchEvent(dispatchedEvent);
	}

	getMappings(eventString) {
		return this.mappings[eventString];
	}

	/**
	 * Clear all mappings for an event string
 	 */
	removeMappings(eventString) {
		this.mappings[eventString] = new Array();
	}

	clearMappings() {
		this.mappings = {};
	}

}

export { EventMapping };
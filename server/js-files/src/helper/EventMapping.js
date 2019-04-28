var DEBUG = true;

/**
 * Meant to be something similar to the Node.js EventEmitter,
 * leveraging EventTargeter for listener support
 * Helps with MVC Observer pattern for simple callbacks
 */
export default class EventMapping {
	constructor (mappableEvents={}) {
		this.mappableEvents = mappableEvents;
		this.mappings = {};
	}

	// Perform event callbacks with the emitted data
	dispatchEvent(dispatchedEvent) {
		let callbacks = this.mappings[dispatchedEvent.type];
		let data = dispatchedEvent.data;

		if (callbacks !== undefined && callbacks.length > 0) {
			for (let i in callbacks) {
				let callback = callbacks[i];
				let singleShot = callback.singleShot;

				// for DEBUG
				if (singleShot) {
					if (DEBUG) console.log('Dispatching Event: ' + dispatchedEvent.type);
				} else {
					if (DEBUG) console.log('Dispatching single-shot Event: ' + dispatchedEvent.type);
				}

				callback(data);

				// Splice out the 1 callback function if we need to remove it after calling
				if (singleShot) {
					if (DEBUG) console.log('Clearing single-shot mapping..');
					this.mappings[dispatchedEvent.type].splice(i, 1);
				}

			}
		}
	}

	_validateMapping(eventString, cb) {
		if (eventString == undefined || eventString == null) {
			throw new RangeError('Cannot bind to non-existent event: ' + eventString);
		}

		if (cb == undefined || cb == null) {
			throw new RangeError('Cannot bind to non-existent callback: ' + cb);
		}

		let mappableEventNames = Object.values(this.mappableEvents);
		if (!mappableEventNames.includes(eventString)) {
			throw new RangeError('Cannot bind to that event: ' + eventString + '. Mappable events are: ' + mappableEventNames);
		}
	}

	/**
	 * Maps the given callback to the event
	 * @param event Event name (String)
	 * @param cb Callback function
	 */
	on (eventString, cb) {
		this._validateMapping(eventString, cb);
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
		this._validateMapping(eventString, cb);
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
		if (eventString == undefined || eventString == null) {
			throw new RangeError('Cannot get mappings. Event type String not defined.')
		}

		let mappings = this.mappings[eventString];
		if (mappings == undefined) {
			return [];
		} else {
			return mappings;
		}
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
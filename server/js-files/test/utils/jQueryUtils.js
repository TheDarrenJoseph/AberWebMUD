import jquery from 'jquery'

export default class jQueryUtils {

	/**
	 * Using undocumented jQuery _data for events
	 * @param domElement
	 * @param eventType
	 * @returns {*}
	 */
	static extractFirstJqueryBinding (domElement, eventType) {
		let boundEvents = jquery._data(domElement, 'events');
		if (boundEvents !== undefined) {
			return boundEvents[eventType][0].handler;
		} else {
			return boundEvents;
		}
	}

	/**
	 * Using undocumented jQuery _data for events bound to a domElement
	 * @param domElement the domElement to extract events from
	 * @returns the DOM Events by event type
	 */
	static getEventsForElement (domElement) {
		var boundEvents = jquery._data(domElement, 'events');
		return boundEvents;
	}
}

export { jQueryUtils };
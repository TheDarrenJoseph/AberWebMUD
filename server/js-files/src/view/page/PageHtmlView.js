// Class ID mappings
import jquery from 'jquery'
import { EventMapping } from 'src/helper/EventMapping.js';

// this.idSelectorMappings = { mainWindowId: '#main-window', messageWindowId: '#message-window', inventoryWindowId: '#inventory-window' };

export class PageHtmlView extends EventMapping {

	/**
	 *
	 * @param EVENTS
	 * @param htmlIdMappings -- mappings of local window IDs to their HTML equivalents for CSS selectors
	 */
	constructor (doc, EVENTS, htmlIdMappings) {
		super(EVENTS)

		if (doc == undefined) {
			throw new RangeError("No Document provided for a PageHtmlView");
		} else {
			this.doc = doc;
		}

		if (htmlIdMappings == undefined) {
			throw new RangeError("No HTML ID Mappings provided for a PageHtmlView");
		} else {
			this.idSelectorMappings = htmlIdMappings;
		}
	}

	getHtmlIdMapping(mappingId) {

		if (this.idSelectorMappings.hasOwnProperty(mappingId)) {
			let result = this.idSelectorMappings[mappingId];
			if ( result === undefined) {
				throw new RangeError('Mapping result invalid for ID: ' + mappingId);
			} else {
				return result;
			}
		} else {
			throw new RangeError('ID Selector mappings: ' + JSON.stringify(this.idSelectorMappings) + ' do not contain expected ID: ' + mappingId);
		}
	}

	extractElementFromJquery(elements) {
		if (elements.length >= 1) {
			return elements.get(0);
		} else {
			throw new Error("No HTML elements present in jQuery object.");
		}
	}

	isElementVisible(localWindowId) {
		//	Check if the dialog is visible to begin with
		return this.getWindowJquery(localWindowId).is(':visible');
	}

	getWindowJquery(localWindowId) {
		return jquery(this.getHtmlIdMapping(localWindowId), this.doc);
	}

	showElement (localWindowId) {
		this.getWindowJquery(localWindowId).show();
	}

	hideElement (localWindowId) {
		this.getWindowJquery(localWindowId).hide();
	}

	hideElements () {
		for (var windowId in this.idSelectorMappings) {
			this.hideElement(windowId);
		}
	}

	createElement(elementType, elementId) {
		let elemTypePresent = elementType !== undefined;
		let elemIdPresent = elementId !== undefined;
		if (elemTypePresent) {
			let theElement = this.doc.createElement(elementType);
			if (elemIdPresent) {
				theElement.setAttribute('id', elementId);
			}

			return theElement;
		} else {
			throw new RangeError('Missing the elementType to create a new HTML Element of.')
		}
	}

	createInputField(elementId, inputType) {
		let inputField = this.doc.createElement('input', elementId);
		inputField.setAttribute('type', inputType);
		return inputField;
	}

	toggleWindow (localWindowId) {
		//jquery('.dialog:visible', this.doc).hide();
		let thisWindow = this.getWindowJquery(localWindowId);
		this.isElementVisible(localWindowId) ? thisWindow.hide() : thisWindow.show();
	}

}

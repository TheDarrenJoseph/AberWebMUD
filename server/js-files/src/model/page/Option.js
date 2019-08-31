/**
 * JSON data model for a HTML <option>
 */
export default class Option {
	constructor (optionId, optionText) {
		this.id = optionId;
		this.text = optionText;
	}

	getOptionId () {
		return this.id;
	}

	setOptionId (id) {
		this.id = id;
	}

	getOptionText () {
		return this.text;
	}

	setOptionText (text) {
		this.text = text
	}
}

// Allow named import also
export { Option };

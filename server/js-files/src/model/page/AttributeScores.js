import ValidationHandler from '../../handler/ValidationHandler'

export const MIN_VALUE_NAME = 'min_value';
export const MAX_VALUE_NAME = 'max_value';
export const FREEPOINTS_NAME = 'free_points';
export const SCORES_NAME = 'scores';

export default class AttributeScores extends Map {
	constructor (attributeScores, minValue, maxValue, freePoints) {
		super()

		if (attributeScores === undefined) {
			throw new RangeError('Attribute Scores JSON required!');
		}
		if (minValue === undefined) {
			throw new RangeError('Minimum attribute value required!');
		}
		if (maxValue === undefined) {
			throw new RangeError('Maximum attribute value required!');
		}
		if (freePoints === undefined) {
			throw new RangeError('Free points required!');
		}

		this.scores = new Map();
		for (let [key, value] of Object.entries(attributeScores)) {
			this.setScore(key, value)
		}
		this.set(MIN_VALUE_NAME, minValue);
		this.set(MAX_VALUE_NAME, maxValue);
		this.set(FREEPOINTS_NAME, freePoints);
	}

	static fromJson(attribsJson) {
		console.debug('Building AttributeScores from JSON: ' + JSON.stringify(attribsJson));
		let minValue = ValidationHandler.validateAndGetAttribute(attribsJson, MIN_VALUE_NAME);
		let maxValue = ValidationHandler.validateAndGetAttribute(attribsJson, MAX_VALUE_NAME);
		let freePoints = ValidationHandler.validateAndGetAttribute(attribsJson, FREEPOINTS_NAME);
		let attribScores = ValidationHandler.validateAndGetAttribute(attribsJson, SCORES_NAME);
		let scores = new AttributeScores(attribScores, minValue, maxValue, freePoints);
		console.debug('Created new AttributeScores: ' + JSON.stringify(scores.getJson()));
		return scores;
	}

	getScore(attributeName) {
		return this.scores.get(attributeName);
	}

	setScore(attributeName, value) {
		return this.scores.set(attributeName, value);
	}

	getScores() {
		return this.scores;
	}

	getScoresJson() {
		let output = {};
		this.scores.forEach((value, key, map) => {
			output[key] = value;
		});
		console.debug('AttributeScoresJson : ' + JSON.stringify(output));
		return output;
	}

	getJson() {
		return {
			[MIN_VALUE_NAME]:  this.get(MIN_VALUE_NAME),
			[MAX_VALUE_NAME]:  this.get(MAX_VALUE_NAME),
			[FREEPOINTS_NAME]:  this.get(FREEPOINTS_NAME),
			[SCORES_NAME]: this.getScoresJson()
		}
	}

	getMinimumAttributeValue() {
		return this.get(MIN_VALUE_NAME);
	}

	setMinimumAttributeValue(value) {
		return this.set(MIN_VALUE_NAME, value);
	}

	getMaximumAttributeValue() {
		return this.get(MAX_VALUE_NAME);
	}

	setMaximumAttributeValue(value) {
		return this.set(MAX_VALUE_NAME, value);
	}

	getFreePoints() {
		return this.get(FREEPOINTS_NAME);
	}

	setFreePoints(value) {
		return this.set(FREEPOINTS_NAME, value);
	}

	validateAttributes(minVal, maxVal) {
		if (this.size > 0) {
			this.forEach((value, key, map) => {
				if (!(value >= minVal && value <= maxVal)) {
					throw new RangeError('Invalid Attribute: ' + key + ' : ' + value + ' Minimum allowed: ' + minVal
					+ ' Maximum allowed: ' + maxVal);
				}
			});
			return true;
		} else {
				throw new RangeError('No attribute scores defined!');
		}
	}

	validate() {
		if (this.size > 0) {
			let minVal = this.getMinimumAttributeValue();
			let maxVal = this.getMaximumAttributeValue();
			let freePoints = this.getFreePoints();
			if (minVal === undefined) throw new RangeError('Expected a minimum attribute value set!');
			if (maxVal === undefined ) throw new RangeError('Expected a maximum attribute value set!');
			if (freePoints === undefined ) throw new RangeError('Expected a free points attribute value set!');
			this.validateAttributes(minVal, maxVal);
			return true;
		} else {
			throw new RangeError('No attributes defined!');
		}
	}

	static validateAttributesJson(attributesJson) {
		return AttributeScores.fromJson(attributesJson).validate();
	}
}

// Allow named import also
export { AttributeScores };

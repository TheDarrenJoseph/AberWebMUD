
export const JSON_ATTRIBUTE_MIN_VALUE_NAME = 'min_value';
export const JSON_ATTRIBUTE_MAX_VALUE_NAME = 'max_value';
export const JSON_ATTRIBUTE_FREEPOINTS_NAME = 'free_points';
export const JSON_ATTRIBUTE_SCORES_NAME = 'scores';

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
		this.set(JSON_ATTRIBUTE_MIN_VALUE_NAME, minValue);
		this.set(JSON_ATTRIBUTE_MAX_VALUE_NAME, maxValue);
		this.set(JSON_ATTRIBUTE_FREEPOINTS_NAME, freePoints);
	}

	static fromJson(attribsJson) {

		console.debug('Building AttributeScores from JSON: ' + JSON.stringify(attribsJson))
		let minValue = attribsJson[JSON_ATTRIBUTE_MIN_VALUE_NAME];
		let maxValue = attribsJson[JSON_ATTRIBUTE_MAX_VALUE_NAME];
		let freePoints = attribsJson[JSON_ATTRIBUTE_FREEPOINTS_NAME];
		let attribScores = attribsJson[JSON_ATTRIBUTE_SCORES_NAME];

		let scores = new AttributeScores(attribScores, minValue, maxValue, freePoints)
		console.debug('Created new AttributeScores: ' + JSON.stringify(scores.getJson()))
		return scores;
	}

	getScore(attributeName) {
		return this.scores.get(attributeName);
	}

	setScore(attributeName, value) {
		return this.scores.set(attributeName, value);
	}

	getScoresJson() {
		let output = {};
		this.scores.forEach((value, key, map) => {
			output[key] = value;
		});
		return output;
	}

	getJson() {
		return {
			[JSON_ATTRIBUTE_MIN_VALUE_NAME]:  this.get(JSON_ATTRIBUTE_MIN_VALUE_NAME),
			[JSON_ATTRIBUTE_MAX_VALUE_NAME]:  this.get(JSON_ATTRIBUTE_MAX_VALUE_NAME),
			[JSON_ATTRIBUTE_FREEPOINTS_NAME]:  this.get(JSON_ATTRIBUTE_FREEPOINTS_NAME),
			[JSON_ATTRIBUTE_SCORES_NAME]: this.getScoresJson()
		}
	}

	getMinimumAttributeValue() {
		return this.get(JSON_ATTRIBUTE_MIN_VALUE_NAME);
	}

	setMinimumAttributeValue(value) {
		return this.set(JSON_ATTRIBUTE_MIN_VALUE_NAME, value);
	}

	getMaximumAttributeValue() {
		return this.get(JSON_ATTRIBUTE_MAX_VALUE_NAME);
	}

	setMaximumAttributeValue(value) {
		return this.set(JSON_ATTRIBUTE_MAX_VALUE_NAME, value);
	}

	getFreePoints() {
		return this.get(JSON_ATTRIBUTE_FREEPOINTS_NAME);
	}

	setFreePoints(value) {
		return this.set(JSON_ATTRIBUTE_FREEPOINTS_NAME, value);
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

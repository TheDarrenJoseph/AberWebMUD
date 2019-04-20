var MOVEMENT_UPDATE_ATTRIBS = ['username', 'old_x', 'old_y', 'pos_x', 'pos_y'];


/**
 * Static data validation helper methods
 */
export default class ValidationHandler {

	/**
	 *
	 * @param data the JSON data to check
	 * @param attributeNamesArray an array of the attributes to check data for
	 * @returns {boolean}
	 */
	static checkDataAttributes(data, attributeNamesArray) {
		var dataDefined = ValidationHandler.notUndefOrNull(data);
		var attribsDefined = ValidationHandler.notUndefOrNull(attributeNamesArray);

		if (dataDefined && attribsDefined) {
			var allValid = true;
			for (var i = 0; i < attributeNamesArray.length; i++) {
				let attributeName = attributeNamesArray[i];

				let attribDefined = ValidationHandler.notUndefOrNull(data[attributeName]);
				if (!attribDefined) {
					// console.log('Expected data attribute not defined: (' + attributeName + ') Data: ' + JSON.stringify(data));
					allValid = false;
				}
			}
			// console.log('Validated: (' + attributeNamesArray + ') result : ' + allValid);
			return allValid;
		}
		
		throw new RangeError('Bad arguements for validation. Data / Attributes to validate undefined.');
		return false;
	}
	
	static notUndefOrNull(data) {
		return (data !== null && data !== undefined);
	}

	//	Checks for the presence of data for each of the movement update fields
	static isValidMovementUpdateData (updateJSON) {
		if (ValidationHandler.notUndefOrNull(updateJSON)) {
			return (ValidationHandler.checkDataAttributes(updateJSON, MOVEMENT_UPDATE_ATTRIBS));
		}
		
		return false;
	}

}

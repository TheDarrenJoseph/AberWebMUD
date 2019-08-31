var MOVEMENT_UPDATE_ATTRIBS = ['username', 'old_position', 'position'];
var POSITION_TYPE_ATTRIBS = ['old_position', 'position'];
var POSITION_ATTRIBS = [ 'pos_x', 'pos_y']

/**
 * Static data validation helper methods
 */
export default class ValidationHandler {

	/**
	 *
	 * @param data the JSON data to check
	 * @param attributeNamesArray an array of the attributeScores to check data for
	 * @returns {boolean}
	 */
	static checkDataAttributes(data, attributeNamesArray) {
		var dataDefined = (ValidationHandler.notUndefOrNull(data) && typeof data === "object" && Object.keys(data).length > 0);

		var attribsDefined = (ValidationHandler.notUndefOrNull(attributeNamesArray) &&
		attributeNamesArray instanceof Array &&
		attributeNamesArray.length > 0);

		if (!dataDefined) {
			throw new RangeError('Data input undefined / not an object with keys!');
		}

		if (!attribsDefined) {
			throw new RangeError('No attributes provided to check for!');
		}

		for (var i = 0; i < attributeNamesArray.length; i++) {
			let attributeName = attributeNamesArray[i];

			let attribDefined = ValidationHandler.notUndefOrNull(data[attributeName]);
			if (!attribDefined) {
				throw new RangeError('Expected data attribute not defined: (' + attributeName + ') in data: ' + JSON.stringify(data));
			}
		}

		return true;
	}
	
	static notUndefOrNull(data) {
		return (data !== null && data !== undefined);
	}

	static validString(input) {
		return input !== undefined && typeof input == 'string' && input.length >= 0;
	}

	/**
	 * Checks for the presence of data for each of the movement update fields
	 * TODO Move this to some messaging model
	 * @param updateJSON
	 * @returns {boolean}
	 */
	static validateMovementUpdateData (updateJSON) {
		if (ValidationHandler.notUndefOrNull(updateJSON)) {
			let topLevelAttribsExist = (ValidationHandler.checkDataAttributes(updateJSON, MOVEMENT_UPDATE_ATTRIBS));

			if (topLevelAttribsExist) {
				let positionAttribsExist = true;

				POSITION_TYPE_ATTRIBS.forEach( key => 	{
					if (!ValidationHandler.checkDataAttributes(updateJSON[key], POSITION_ATTRIBS)) positionAttribsExist = false
				});

				return topLevelAttribsExist && positionAttribsExist;
			}
		} else {
			throw new RangeError('Arguement undefined!');
		}
		
		return false;
	}

}

//	Static helper class

var MOVEMENT_UPDATE_ATTRIBS = ['username', 'old_x', 'old_y', 'pos_x', 'pos_y'];
var CHARACTER_UPDATE_ATTRIBS = ['success','username','char-data','sessionId'];
var CHARACTER_DATA_ATTRIBS = ['charname', 'pos_x','pos_y', 'health', 'charclass', 'free_points', 'scores'];

export default class ValidationHandler {
	
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
	
	static isValidCharacterUpdateData (updateJSON) {
		if (ValidationHandler.notUndefOrNull(updateJSON)) {
			let bodyValid = ValidationHandler.checkDataAttributes(updateJSON,
				CHARACTER_UPDATE_ATTRIBS);
			if (bodyValid) {
				let contentValid = ValidationHandler.isValidCharacterData(updateJSON['char-data']);
				return bodyValid && contentValid;
			} 
		}
		
		return false;
	}
	
	// Checks for the presence of data for character update
	//	Example JSON
	//{"charname":"roo","pos_x":10,"pos_y":10,"health":100,
	// "charclass":"fighter","free_points":5,
	// "scores": {"STR":1,"DEX":1,"CON":1,"INT":1,"WIS":1,"CHA":1}};
	static isValidCharacterData (updateJSON) {
		
		if (ValidationHandler.notUndefOrNull(updateJSON)) {
			let coreDataExists = ValidationHandler.checkDataAttributes(updateJSON, updateJSON['free_points','scores']);
			console.log('Validating scores:'); console.log(updateJSON['scores'])
			let attributesExist = ValidationHandler.checkDataAttributes(updateJSON['scores'], ['STR','DEX','CON','INT','WIS','CHA']);

			return coreDataExists && attributesExist;

		} else {
			console.log('Missing character update data.');
			return false;
		}
	}
}

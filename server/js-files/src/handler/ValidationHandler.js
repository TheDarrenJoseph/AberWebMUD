//	Static helper class
export default class ValidationHandler {
	
	static notUndefOrNull(data) {
		return data !== null && data !== undefined;
	}
	
	//	Checks for the presence of data for each of the movement update fields
	static isValidMovementUpdateData (updateJSON) {
		let username = updateJSON['username'];
		let oldX = updateJSON['old_x'];
		let oldY = updateJSON['old_y'];
		let posX = updateJSON['pos_x'];
		let posY = updateJSON['pos_y'];

		return (ValidationHandler.notUndefOrNull(username) &&
			ValidationHandler.notUndefOrNull(oldX) &&
			ValidationHandler.notUndefOrNull(oldY) &&
			ValidationHandler.notUndefOrNull(posX) &&
			ValidationHandler.notUndefOrNull(posY)
			);
	}
	
	static isValidCharacterUpdateData (updateJSON) {
		if (ValidationHandler.notUndefOrNull(updateJSON)) {
			let bodyValid = ValidationHandler.notUndefOrNull(updateJSON['success']) &&
			ValidationHandler.notUndefOrNull(updateJSON['username']) &&
			ValidationHandler.notUndefOrNull(updateJSON['char-data']) &&
			ValidationHandler.notUndefOrNull(updateJSON['sessionId']);
			
			if (bodyValid) {
				let contentValid = ValidationHandler.isValidCharacterData(updateJSON['char-data']);
				return bodyValid && contentValid;
			} 
		} else {
			return false;
		}
	}
	
	// Checks for the presence of data for character update
	//	Example JSON
	//{"charname":"roo","pos_x":10,"pos_y":10,"health":100,
	// "charclass":"fighter","free_points":5,
	// "scores": {"STR":1,"DEX":1,"CON":1,"INT":1,"WIS":1,"CHA":1}};
	static isValidCharacterData (updateJSON) {
		let charname = updateJSON['charname'];
		let pos_x = updateJSON['pos_x'];
		let pos_y = updateJSON['pos_y'];
		let health = updateJSON['health'];
		let charclass = updateJSON['charclass'];
		
		if (ValidationHandler.notUndefOrNull(updateJSON)) {
			let coreDataExists = (
				ValidationHandler.notUndefOrNull(charname) &&
				ValidationHandler.notUndefOrNull(pos_x) &&
				ValidationHandler.notUndefOrNull(pos_y) &&
				ValidationHandler.notUndefOrNull(health) &&
				ValidationHandler.notUndefOrNull(charclass)
			);
			
			let free_pounts = updateJSON['free_points'];
			let scores = updateJSON['scores'];
			
			let attributesExist = (ValidationHandler.notUndefOrNull(free_pounts) &&
			ValidationHandler.notUndefOrNull(scores) &&
			ValidationHandler.notUndefOrNull(scores['STR']) &&
			ValidationHandler.notUndefOrNull(scores['DEX']) &&
			ValidationHandler.notUndefOrNull(scores['CON']) &&
			ValidationHandler.notUndefOrNull(scores['INT']) &&
			ValidationHandler.notUndefOrNull(scores['WIS']) &&
			ValidationHandler.notUndefOrNull(scores['CHA'])
			);
			return coreDataExists && attributesExist;

		} else {
			return false;
		}
	}
}

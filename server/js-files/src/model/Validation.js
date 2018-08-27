//	Checks for the presence of data for each of the movement update fields
function isValidMovementUpdateData (updateJSON) {
	var username = updateJSON['username'];
	var oldX = updateJSON['old_x'];
	var oldY = updateJSON['old_y'];
	var posX = updateJSON['pos_x'];
	var posY = updateJSON['pos_y'];

	if ((username !== null &&
		username !== undefined) &&
		(oldX !== null &&
		oldX !== undefined) &&
		(oldY !== null &&
		oldY !== undefined) &&
		(posX !== null &&
		posX !== undefined) &&
		posY !== null &&
		posY !== undefined) {
		return true;
	} else {
		return false;
	}
}

export { isValidMovementUpdateData };

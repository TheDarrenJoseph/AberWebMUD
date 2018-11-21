import { MapPositionHelper } from 'src/helper/MapPositionHelper\.js';

// Constructor for a standardised character JSON
function GridCharacter (charname, x, y, sprite) {
	if (!PositionHelper.isPositionInMap(x, y)) throw new RangeError('Invalid position for GridCharacter! (must be valid overworld co-ord)');

	return {
		charname: charname,
		pos_x: x,
		pos_y: y,
		sprite: sprite
	};
}

export { GridCharacter };

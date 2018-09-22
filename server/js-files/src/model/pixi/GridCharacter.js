import { PositionHelper } from 'src/helper/PositionHelper.js';

function GridCharacter (charname, x, y, sprite) {
	if (!PositionHelper.isPositionInOverworld(x, y)) throw new RangeError('Invalid position for GridCharacter! (must be valid overworld co-ord)');

	return {
		charname: charname,
		pos_x: x,
		pos_y: y,
		sprite: sprite
	};
}

export { GridCharacter };

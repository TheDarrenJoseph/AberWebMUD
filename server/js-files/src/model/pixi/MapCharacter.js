// Constructor for a standardised character JSON
export default function MapCharacter (charname, x, y, sprite) {
	return {
		charname: charname,
		pos_x: x,
		pos_y: y,
		sprite: sprite
	};
}

export { MapCharacter };

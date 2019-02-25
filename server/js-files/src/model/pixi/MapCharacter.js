// Constructor for a standardised character JSON
export default class MapCharacter {
	constructor (charname, x, y, sprite) {
		this.charname = charname;
		this.x = x;
		this.y = y;
		this.sprite = sprite;
	}
}

export { MapCharacter };

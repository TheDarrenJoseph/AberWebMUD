const DEFAULT_TILETYPE = 0;

export default class MapTile {
	constructor (tileType = DEFAULT_TILETYPE) {
		this.tileType = tileType;
	}
}

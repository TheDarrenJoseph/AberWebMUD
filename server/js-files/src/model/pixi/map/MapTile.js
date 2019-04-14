const DEFAULT_TILETYPE = 0;

/**
 * Map tile
 *  mapTile - raw map tile data
 *  sprite - A Pixi Sprite for representing the given tileType
 */
export default class MapTile {
	constructor (tileType = DEFAULT_TILETYPE) {
		this.tileType = tileType;
		this.sprite = null;
	}

	getSprite() {
		return this.sprite;
	}

	setSprite(sprite) {
		this.sprite = sprite;
	}
}

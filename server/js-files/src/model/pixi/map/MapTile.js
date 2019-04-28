const DEFAULT_TILETYPE = 0;

/**
 * Map tile
 *  mapTile - raw map tile data
 *  sprite - A Pixi Sprite for representing the given tileType
 */
export default class MapTile {
	constructor (tileType = DEFAULT_TILETYPE, sprite=null) {
		this.tileType = tileType;
		this.sprite = sprite;
	}

	getTileType() {
		return this.tileType;
	}

	setTileType(tileType) {
		if (Number.isInteger(tileType)) {
			this.tileType = tileType;
		} else {
			throw new RangeError("tileType is not an Integer");
		}
	}

	getSprite() {
		return this.sprite;
	}

	setSprite(sprite) {
		this.sprite = sprite;
	}
}

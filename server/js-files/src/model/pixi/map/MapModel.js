import ArrayHelper from 'src/helper/ArrayHelper.js'
import Player from 'src/model/Player.js';
import MapTile from 'src/model/pixi/map/MapTile.js';

// Default map size in tiles
export var DEFAULT_MAP_SIZE_XY = 20;
// Default tile size in pixels
export var DEFAULT_TILE_SIZE = 40;

/**
 * Map Model for storing map tiles and players
 */
export default class MapModel {

	constructor (tileCount = DEFAULT_MAP_SIZE_XY) {
		this.mapSizeX = tileCount;
		this.mapSizeY = tileCount;
		// We can store multiple Players per tile
		this.mapPlayerArray = ArrayHelper.create2dArray(this.mapSizeX, this.mapSizeY, Array);
		this.mapTileArray = ArrayHelper.create2dArray(this.mapSizeX, this.mapSizeY, MapTile);
	}

	/**
	 * Async Sprite init
	 * @returns {Promise<void>}
	 */
	async initialise () {
		if (this.tileSpriteArray === undefined) {
			//	Sprites for the map viewPixiMapView
			await this.initMapTileSpriteArray();
		}

		return;
	}

	/**
	 * Checks whether the position is valid in the range of 0 - < mapSizeXorY
	 * @param globalX global map position X
	 * @param globalY global map position Y
	 * @returns {boolean} whether the given position is in this map
	 */
	isPositionInMap (globalX, globalY) {
		// < for max range as map tiles are 0-indexed
		if (globalX < this.mapSizeX &&
		globalX >= 0 &&
		globalY < this.mapSizeY &&
		globalY >= 0) {
			return true;
		} else {
			return false;
		}
	}

	getMapSizes () {
		return [this.mapSizeX, this.mapSizeY];
	}

	/**
	 * Get the MapTile at a position
	 * @param x
	 * @param y
	 * @returns {*}
	 */
	getTile(x,y) {
		return this.mapTileArray[x][y];
	}

	/**
	 * Get the Players at a position
	 * @param x
	 * @param y
	 */
	getPlayers(x,y) {
		return this.mapPlayerArray[x][y];
	}

	setPlayers(x,y, players) {
		this.mapPlayerArray[x][y] = players;
	}

	addPlayer(x,y, player) {
		this.mapPlayerArray[x][y].push(player)
	}

	getPlayer(x, y, username) {
		let locationPlayers = this.mapPlayerArray[x][y];

		if (locationPlayers == undefined || locationPlayers == null) {
			throw new RangeError("Could not find player on the map: " + x + ", " + y + " with username: " + username);
		} else {
			let found = locationPlayers.filter(player => { player.username == username });
			if (found.length == 1) {
				return found[0];
			} else if (found > 1)
				throw new Error("Multiple Players for username at location: " + x + ", "+ y);
			}

			return null;
	}

	async initMapTileSpriteArray () {
		// Create enough dummy tiles for the map model
		// Create a pretty crappy 2d array of tileCount size
		for (var x = 0; x < this.mapSizeX; x++) {
			for (var y = 0; y < this.mapSizeY; y++) {
				let tileSprite = await SpriteHelper.makeSpriteFromAtlas(this.assetPaths.ASSET_PATH_OVERWORLD_GRASS, 'grass-plain', DEFAULT_TILE_SIZE, DEFAULT_TILE_SIZE);

				//console.log('Sprite made: '+x+' '+y+' ');
				let pixelX = x * this.mapSizeX;
				let pixelY = y * this.mapSizeY;
				let spritePos = new PIXI.Point(pixelX, pixelY);
				tileSprite.position = spritePos;
				tileSprite.interactive = true;
				tileSprite.name = ('' + x) + y;

				// Finally assign the sprite
				this.getTile(x,y).setSprite(tileSprite);
			}
		}
	}
}

// Allow named import also
export { MapModel };
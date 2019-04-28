import ArrayHelper from 'src/helper/ArrayHelper.js'
import MapTile from 'src/model/pixi/map/MapTile.js';
import { MessageHandler } from 'src/handler/socket/MessageHandler.js';
import { DATA_JSON_NAME, MAPSIZE_X_JSON_NAME, MAPSIZE_Y_JSON_NAME } from '../../../handler/socket/MessageHandler'

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
		// We can store multiple Players per tile, so initialise as Arrays
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

	getTiles(){
		return this.mapTileArray;
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
	 * @returns a 2D Array of Arrays (3D) containing any Player(s) for each position
	 */
	getPlayers(){
		return this.mapPlayerArray;
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

	/**
	 *
	 * @param x
	 * @param y
	 * @param sprite
	 */
	setTileSprite(x,y, tileSprite) {
		this.getTile(x,y).setSprite(tileSprite);
	}

	async initMapTileSpriteArray () {
		// Create enough dummy tiles for the map model
		// Create a pretty crappy 2d array of tileCount size
		for (var x = 0; x < this.mapSizeX; x++) {
			for (var y = 0; y < this.mapSizeY; y++) {
				let tileType = this.getTile(x,y).getTileType();

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

	updateFromJson(data) {
		// Unpack the message data
		let mapTiles = JSON.parse(data[DATA_JSON_NAME]);
		let mapSizeX = data[MAPSIZE_X_JSON_NAME];
		let mapSizeY = data[MAPSIZE_Y_JSON_NAME];

		this.mapTileArray = mapTiles;
		this.mapSizeX = mapSizeX;
		this.mapSizeY = mapSizeY;
	}


}

// Allow named import also
export { MapModel };
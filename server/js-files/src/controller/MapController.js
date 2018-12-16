//	Manages a Map model, updates to it, and handles delegation to the PixiMapView renderer
// Default imports
import SessionController from 'src/controller/SessionController.js';
import MapPositionHelper from 'src/helper/MapPositionHelper.js';
import ValidationHandler from 'src/handler/ValidationHandler.js';
import Map from 'src/model/Map.js';
import PixiMapView from 'src/view/pixi/PixiMapView.js';

// Named imports
import { PageView } from 'src/view/page/PageView.js';
// import { SpriteHelper } from 'src/helper/pixi/SpriteHelper.js';

export var POS_NOT_VALID_MAP_VIEW_ERROR = 'Cannot set Map view start position, map view position invalid';

export default class MapController {
	// Create a map controller for a specific map view
	// renderer - the renderer from the main pixi view
	constructor (renderer, map = new Map(), pixiMapView = null, assetPaths) {
		// Setup the pixi map view so we have our window dimensions
		this.windowSize = PageView.getWindowDimensions();
		
		this.mapModel = map;

		if (pixiMapView === null) {
			this.pixiMapView = new PixiMapView(this.mapModel, renderer, this.windowSize, assetPaths);
		} else {
			this.pixiMapView = pixiMapView;
		}
		console.log('Setup Map Window Size: ' + this.windowSize);
		console.log('Map View Tilecount: ' + this.pixiMapView.tileCount);
		//this.pixiMapView.setupPixiContainers(this.pixiMapView.tileCount);

		this.mapPositionHelper = new MapPositionHelper(this.pixiMapView);
	}

	getPositionHelper () {
		return this.mapPositionHelper;
	}

	redrawCharacters () {
		this.pixiMapView.drawMapCharacterArray();
		this.pixiMapView.renderCharacterContainer();
	}

	//	Handles a movement
	// 'movement-update', {'username':message['username'],'oldX':oldX, 'oldY':oldY,'pos_x':pos_x,'pos_y':pos_y}
	handleMovementUpdate (updateJSON) {
		var username = updateJSON['username'];
		// var oldX = updateJSON['old_x'];
		// var oldY = updateJSON['old_y'];
		var posX = updateJSON['pos_x'];
		var posY = updateJSON['pos_y'];

		if (ValidationHandler.isValidMovementUpdateData(updateJSON)) {
			//	If it's the player, follow them with the view
			if (username === SessionController.getClientSessionUsername()) {
				this.showMapPosition(posX, posY);
			}

			console.log('A character has moved.. \nUser:' + username + ' to ' + posX + ' ' + posY);
			// updateCharacterSpritePos(username, old_x, old_y, pos_x, pos_y);
			this.pixiMapView.newCharacterOnMap(username, posX, posY);
			this.redrawCharacters();
		} else {
			throw new Error('Missing movement update data ' + JSON.stringify(updateJSON));
		}
	}

	//	Moves the UI to a new position and draws the map there
	showMapPosition (gridX, gridY) {
		this.mapModel.getViewPosition(gridX, gridY);

		//	This will throw a RangeError if our position is invalid (doubles as a sanity-check)
		this.setMapViewPosition(gridX - this.mapModel.halfZeroIndexedTileCountFloored, gridY - this.mapModel.halfZeroIndexedTileCountFloored);
		console.log('Drawing map from this position: ' + gridX + ' ' + gridY);
		//	Draw the view at this position
		PixiMapView.drawMapToGrid(gridX, gridY);
	}

	// Wrappers calls to the data model to include validation
	// throws a RangeError if args are invalid
	setMapViewPosition (startX, startY) {
		//	Checks that we have half the view out of the map maximum
		if (this.pixiMapView.isValidMapViewPosition(startX, startY)) {
			//	Adjusting the start values for drawing the map
			this.pixiMapView.setMapViewPosition(startX, startY);
		} else {
			throw new RangeError(POS_NOT_VALID_MAP_VIEW_ERROR + ': ' + startX + ' ' + startY);
		}
	}

	getMap () {
		return this.mapModel;
	}

	getPixiMapView () {
		return this.pixiMapView;
	}
}

export { MapController };

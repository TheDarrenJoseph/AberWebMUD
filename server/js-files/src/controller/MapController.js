//	Manages a Map model, updates to it, and handles delegation to the PixiMapView renderer
// Default imports
import MapPositionHelper from 'src/helper/MapPositionHelper.js';
import ValidationHandler from 'src/handler/ValidationHandler.js';
import MapModel from 'src/model/pixi/map/MapModel.js';
import PixiMapView from 'src/view/pixi/PixiMapView.js';

// Named imports
import { Session } from 'src/model/Session.js';
import { PageView } from 'src/view/page/PageView.js';
// import { SpriteHelper } from 'src/helper/pixi/SpriteHelper.js';

export var POS_NOT_VALID_MAP_VIEW_ERROR = 'Cannot set Map view start position, map view position invalid';

export default class MapController {
	// Create a map controller for a specific map view
	// renderer - the renderer from the main pixi view
	constructor (renderer, map = new MapModel(), windowSize, pixiMapView, assetPaths) {

		// Setup the pixi map view so we have our window dimensions
		if (map instanceof  MapModel) {
			this.mapModel = map;
		} else {
			throw new RangeError("map is not a MapModel: " + map);
		}

		if (pixiMapView === undefined) {
			this.pixiMapView = new PixiMapView(this.mapModel, renderer, windowSize, assetPaths);
		} else {
			this.pixiMapView = pixiMapView;
		}
		this.mapPositionHelper = new MapPositionHelper(this.pixiMapView);
	}

	// Async setup
	//async initialise() {
	//	await this.pixiMapView.initialise();
	//}

	getPositionHelper () {
		return this.mapPositionHelper;
	}

	getMap () {
		return this.mapModel;
	}

	getPixiMapView () {
		return this.pixiMapView;
	}


	//	Handles a character movement
	handleMovementUpdate (updateJSON) {
		var username = updateJSON['username'];
		// var oldX = updateJSON['old_x'];
		// var oldY = updateJSON['old_y'];
		var posX = updateJSON['pos_x'];
		var posY = updateJSON['pos_y'];

		if (ValidationHandler.isValidMovementUpdateData(updateJSON)) {
			//	If it's the player, follow them with the view
			if (username === Session.ActiveSession.getClientSessionUsername()) {
				this.showMapPosition(posX, posY);
			}

			console.log('A character has moved.. \nUser:' + username + ' to ' + posX + ' ' + posY);
			// updateCharacterSpritePos(username, old_x, old_y, pos_x, pos_y);
			this.pixiMapView.newPlayerOnMap(username, 'Unknown', posX, posY);
			this.pixiMapView.drawMapPlayerArray();
		} else {
			throw new Error('Missing movement update data ' + JSON.stringify(updateJSON));
		}
	}

	//	Moves the UI to a new position and draws the map there
	showMapPosition (startX, startY) {
		this.setMapViewPosition(startX, startY);

		// Either full re-draw or just re-render
		//return this.pixiMapView.drawMapTiles();
		this.pixiMapView.renderAll();
	}

	// Wrappers calls to the data model to include validation
	// throws a RangeError if args are invalid
	setMapViewPosition (startX, startY) {
		if (this.pixiMapView.isValidMapViewPosition(startX, startY)) {
			//	Adjusting the start values for drawing the map
			this.pixiMapView.setMapViewPosition(startX, startY);
		} else {
			throw new RangeError(POS_NOT_VALID_MAP_VIEW_ERROR + ': ' + startX + ' ' + startY);
		}
	}

}

export { MapController };

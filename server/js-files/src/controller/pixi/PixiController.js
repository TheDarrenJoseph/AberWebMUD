import * as PIXI from 'libs/pixi.min.js';

import { Map } from 'src/model/pixi/Map.js';
import { PageChatView } from 'src/view/page/PageChatView.js';
import { SocketHandler } from 'src/handler/socket/SocketHandler.js';
import { MapController } from 'src/controller/pixi/MapController.js';
import { Session } from 'src/model/SessionModel.js';
import { PageController } from 'src/controller/PageController.js';
import { SpriteHelper } from 'src/helper/pixi/SpriteHelper.js';
import { PositionHelper } from 'src/helper/PositionHelper.js';
import { PixiMapView } from 'src/view/pixi/PixiMapView.js';
import { PixiView } from 'src/view/pixi/PixiView.js';
import { PageView } from 'src/view/page/PageView.js';

import { ValidationHandler } from 'src/handler/ValidationHandler.js';

// Main Pixi handling point
//	App Constants
export var titleText = 'AberWebMUD';

var zeldaAssetPath = 'static/assets/gfx/';
var overworldAtlasPath = zeldaAssetPath + 'overworld-texture-atlas.json';
var zeldaObjectsAtlasPath = zeldaAssetPath + 'zelda-objects-texture-atlas.json';
var characterAtlasPath = zeldaAssetPath + 'character-texture-atlas.json';

//	Handles the PixiJS renderer
class PixiControllerClass {
	constructor () {
		// resolution 1 for now as default (handles element scaling)
		this.renderingOptions = {
			resolution: 1
		};

		// Create our PixiJS renderer space
		// Create a renderer with a square canvas of the view's suggested size
		this.renderer = PIXI.autoDetectRenderer(PixiMapView.mapWindowSize, PixiMapView.mapWindowSize);
		this.renderer.autoresize = true;
		console.log('Created renderer: ' + this.renderer);

		//	Maps tile codes to resource keys
		this.tileMappings = ['grass-plain', 'barn-front'];
	}

	renderStage () {
		this.renderer.render(PixiMapView.stage); // Re-renders the stage to show blank
	}

	renderControlsContainer () {
		this.renderer.render(PixiMapView.controlsContainer); // Re-renders the stage to show blank
	}

	getTileMapping (tileTypeIndex) {
		return this.tileMappings[tileTypeIndex];
	}

	createSprite (atlasPath, subtileName, tileHeight, tileWidth, x, y, interactive) {
		var thisSprite = SpriteHelper.makeSpriteFromAtlas(atlasPath, subtileName);

		thisSprite.height = tileHeight;
		thisSprite.width = tileWidth;

		thisSprite.x = x;
		thisSprite.y = y;

		thisSprite.interactive = interactive;
		return thisSprite;
	}

	setupConsoleButton () {
		var mapTileSize = Map.tileSize;

		var consoleButtonSprite = this.createSprite(zeldaObjectsAtlasPath,
																						'chat-bubble-blank',
																						mapTileSize,
																						mapTileSize,
																						0,
																						Map.mapWindowSize - mapTileSize,
																						true);

		PixiMapView.controlsContainer.addChild(consoleButtonSprite);
		consoleButtonSprite.on('click', PageView.toggleConsoleVisibility);
	}

	setupContextButtons () {
		//	var inventoryButtonSprite = makeSpriteFromTileset(zeldaObjectsTilesetPath, 0, 0, 16, 16);
		var inventoryButtonSprite = this.createSprite(zeldaObjectsAtlasPath,
		'chest-single',
		Map.tileSize,
		Map.tileSize * 2,
		Map.mapWindowSize - (Map.tileSize * 2),
		Map.mapWindowSize - Map.tileSize,
		true
		);

		PixiMapView.controlsContainer.addChild(inventoryButtonSprite);

		var statsButtonSprite = this.createSprite(zeldaObjectsAtlasPath,
		'chest-single',
		Map.tileSize,
		Map.tileSize * 2,
		Map.mapWindowSize - Map.tileSize * 4,
		Map.mapWindowSize - Map.tileSize,
		true
		);

		PixiMapView.controlsContainer.addChild(statsButtonSprite);

		return [inventoryButtonSprite, statsButtonSprite];
	}

	displayStatBars () {
		var statBars = this.setupStatBars();
		console.log(statBars);
		statBars[0].setValue(Session.clientSession.character.health);
		statBars[0].drawBackgroundBar(Map.thirdMapWindowSize, this.mapTileSize);
		statBars[0].drawInnerBar();
	}

	//	Shows just the controls needed for login
	showLoginControls () {
		PageView.hideWindows();
		//	Make the console only visisble
		PageView.toggleConsoleVisibility();
		//	Check connection every 5 seconds
		setTimeout(function () { return PageController.checkConnection(); }, 5000);
	}

	setupUI () {
		this.setupDialogWindow();

		this.displayStatBars();

		PixiMapView.tileSpriteArray = PixiMapView.setupMapUI(overworldAtlasPath, Map.tileCount, Map.tileSize);

		this.setupConsoleButton();
		var contextButtons = this.setupContextButtons();

		contextButtons[0].on('click', PageView.toggleIventoryWinVisibility);
		contextButtons[1].on('click', PageView.toggleStatWinVisibility);

		PageView.appendToConsoleButtonClass(contextButtons);
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
			if (username === Session.clientSession.username) {
				MapController.showMapPosition(posX, posY);
			}

			console.log('A character has moved.. \nUser:' + username + ' to ' + posX + ' ' + posY);
			// updateCharacterSpritePos(username, old_x, old_y, pos_x, pos_y);
			PixiMapView.newCharacterOnMap(username, posX, posY);
			// And redraw
			MapController.drawMapCharacterArray();
		} else {
			throw new Error('Missing movement update data ' + JSON.stringify(updateJSON));
		}
	}

	assetsLoaded () {
		console.log(this);
		// Check that WebGL is supported and that we've managed to use it
		var rendererType = 'Canvas';
		var renderer = this.renderer;
		if (PIXI.utils.isWebGLSupported() && (renderer instanceof PIXI.WebGLRenderer)) {
			rendererType = 'WebGL';
		}
		console.log('Using renderer option: ' + rendererType);

		PageView.appendToMainWindow(this.renderer.view);

		this.showLoginControls();
	}

	setupPixiUI () {
		console.log('Setting up' + this);
		PageChatView.clearMessageLog();
		PageChatView.hidePasswordInput();

		// Callback for after assets have loaded (for drawing)
		PIXI.loader.add([overworldAtlasPath,
			zeldaObjectsAtlasPath,
			characterAtlasPath]).load(this.assetsLoaded.apply(this));
	}

	stageClicked () {
		var mouseEvent = this.renderer.plugins.interaction.pointer.originalEvent;
		//	console.log(pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY));
		setTimeout(function () { return PageController.stageDoubleClicked(mouseEvent); }, 150);
	}

	stageDoubleClicked (mouseEvent) {
		if (mouseEvent.type === 'pointerdown') {
			console.log('movement click!');

			try {
				var coords = PositionHelper.pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY);
				coords = PositionHelper.localTilePosToGlobal(coords[0], coords[1]);

				console.log('GLOBAL POSITION CLICKED: ' + coords);

				SocketHandler.sendMovementCommand(coords[0], coords[1]);
			} catch (err) {
				//	Invalid tile position clicked on, do nothing
				console.log('MOVEMENT-COMMAND| ' + err);
			}
		}
	}

	showDialog () {
		PixiView.setDialogBackgroundVisibility(true);
		this.renderStage(); //	update the view to show this
	}

	showControls (show) {
		PixiMapView.controlsContainer.visisble = show;
		this.renderControlsContainer();
	}
}

// Create an instance we can refer to nicely (hide instanciation)
var pixiController = new PixiControllerClass();
export { pixiController as PixiController };

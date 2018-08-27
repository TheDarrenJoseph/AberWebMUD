import { UIPageChatView } from 'src/view/page/UIPageChatView.js'
import { UIPageStatsDialogView } from 'src/view/page/UIPageStatsDialogView.js';

//	Hooking up to a bunch of other controllers for now
import { SessionController } from 'src/controller/SessionController.js'

//	We're going to call out to the SocketHandler from here for now
import SocketHandler from 'src/handler/socket/SocketHandler.js;'

//	Very loose controller for the Page
//	Binding to click / key events using jQuery and controlling the overall UI elements
class UIPageController {
	static bindEvents () {
		 bindMessageButton(true);
		 bindSaveCharacterDetails();
	}

 static sendCharDetails() {
	 SocketHandler.sendCharacterDetails(UIPageStatsDialogView.getStats(), UIPageStatsDialogView.getSessionInfoJSON());
 }

	static bindSaveCharacterDetails() {
		$('#save-stats-button').click(this.sendCharDetails());
	}

	static checkConnection () {
		if (!isSocketConnected()) {
			hideWindows();
			showControls(false);
			showDialog();
			updateMessageLog ('Connection lost to server!', 'client');
		}
	}

	//	Handles a movement response (success/fail) for this client's move action
	static handleMovementResponse (responseJSON) {
		var success = responseJSON['success'];

		//	Let the player know if their move is invalid/unsuccessful
		if (!success) {
			updateMessageLog('You cannot move there!', 'server');
		}
	}

	static stageClicked (renderer) {
		var mouseEvent = renderer.plugins.interaction.pointer.originalEvent;
		//	console.log(pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY));
		setTimeout(static () { return stageDoubleClicked(mouseEvent); }, 150);
	}

	static stageDoubleClicked (mouseEvent) {
		if (renderer.plugins.interaction.pointer.originalEvent.type === 'pointerdown') {
			console.log('movement click!');

			try {
			var coords = pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY);
			coords = localTilePosToGlobal (coords[0], coords[1]);

			console.log('GLOBAL POSITION CLICKED: '+coords);

			sendMovementCommand(coords[0], coords[1], UIPageStatsDialogView.getSessionInfoJSON());
		} catch (err) { //Invalid tile position clicked on, do nothing
			console.log('MOVEMENT-COMMAND| '+err);
		}
		}
	}

	//Binds 'Enter' to send message behavior
	static enterKeySendMessage(username){
		var messageField = $('#message-input');
		var passwordField = $('#password-input');
		messageField.unbind('keyup'); //Clear previous bindings first
		passwordField.unbind('keyup');

		messageField.on('keyup', static (evnt) {
			if (evnt.keyCode == 13) { //Enter key check
					console.log('ENTER on messagefield');
					sendNewChatMessage(UIPageChatView.getMessageInput(), SessionController.getSessionInfoJSON());
					clearMessageInputField();
			}
		});

		passwordField.on('keyup', static (evnt, username) {
			if (evnt.keyCode == 13) { //Enter key check
					console.log('ENTER on passwordfield');
					sendPassword(username);
			}
			});

	}

	//Switches the 'Send' message behavior from message to password sending
	static bindMessageButton(isText){
		var thisButton = $('#send-message-button');
		thisButton.unbind('click');
		enterKeySendMessage(clientSession.username); //	Bind the enter key too

		if(isText) {
			thisButton.click(
					static() {
						sendNewChatMessage(UIPageChatController.getMessageInput(), SessionController.getSessionInfoJSON());
						clearMessageInputField();
					}
			);
		} else {
			//Only bind password sending if the expected (current) username is set
			if (clientSession.username != null) {
				thisButton.click (static () { sendPassword(clientSession.username); });
			}
		}
	}

	static bindStageClick(enabled) {
		var mainWindow = $('#main-window');
		if(enabled){
			mainWindow.on('click',
					static () {
						return stageClicked(renderer);
					}
				);
		} else {
			mainWindow.unbind('click');
		}
	}

	static disableUI() {
		bindStageClick(false); //	Turns off stage-click input
		showControls (false); //	Hides major controls
		renderer.render(stage); // Re-renders the stage to show blank
	}

	static enableUI() {
		bindStageClick(true); //	Activate movement click input
		showControls (true); //	Shows major controls
		renderer.render(stage); // Re-renders the stage to show blank
	}
}

export { UIPageController };

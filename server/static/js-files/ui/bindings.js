function bindEvents () {
	 bindMessageButton(true);
	 bindSaveCharacterDetails();
}

function bindSaveCharacterDetails() {
	$('#save-stats-button').click(function(){sendCharacterDetails()});
}

function stageClicked (renderer) {
	var mouseEvent = renderer.plugins.interaction.pointer.originalEvent;
	//	console.log(pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY));
	setTimeout(function () { return stageDoubleClicked(mouseEvent); }, 150);
}

function stageDoubleClicked (mouseEvent) {
	if (renderer.plugins.interaction.pointer.originalEvent.type === 'pointerdown') {
		console.log('movement click!');

		try {
		var coords = pixiPosToTileCoord(mouseEvent.clientX, mouseEvent.clientY);
		coords = localTilePosToGlobal (coords[0], coords[1]);

		console.log('GLOBAL POSITION CLICKED: '+coords);

		sendMovementCommand(coords[0], coords[1]);
	} catch (err) { //Invalid tile position clicked on, do nothing
		return;
	}
	}
}

//Binds 'Enter' to send message behavior
function enterKeySendMessage(username){
	var messageField = $('#message-input');
	var passwordField = $('#password-input');
	messageField.unbind('keyup'); //Clear previous bindings first
	passwordField.unbind('keyup');

	messageField.on('keyup', function (evnt) {
		if (evnt.keyCode == 13) { //Enter key check
				console.log('ENTER on messagefield');
				sendNewChatMessage();
				clearMessageInputField();
		}
	});

	passwordField.on('keyup', function (evnt, username) {
		if (evnt.keyCode == 13) { //Enter key check
				console.log('ENTER on passwordfield');
				sendPassword(username);
		}
		});

}

//Switches the 'Send' message behavior from message to password sending
function bindMessageButton(isText){
	var thisButton = $('#send-message-button');
	thisButton.unbind('click');
	enterKeySendMessage(clientSession.username); //	Bind the enter key too

	if(isText) {
		thisButton.click(
				function() {
					sendNewChatMessage();
					clearMessageInputField();
				}
		);
	} else {
		//Only bind password sending if the expected (current) username is set
		if (clientSession.username != null) {
			thisButton.click (function () { sendPassword(clientSession.username); });
		}
	}
}

function bindStageClick(enabled) {
	var mainWindow = $('#main-window');
	if(enabled){
		mainWindow.on('click',
				function () {
					return stageClicked(renderer);
				}
			);
	} else {
		mainWindow.unbind('click');
	}
}

function disableUI() {
	bindStageClick(false); //	Turns off stage-click input
	showControls (false); //	Hides major controls
	renderer.render(stage); // Re-renders the stage to show blank
}

function enableUI() {
	bindStageClick(true); //	Activate movement click input
	showControls (true); //	Shows major controls
	renderer.render(stage); // Re-renders the stage to show blank
}

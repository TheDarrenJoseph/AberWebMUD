import $ from 'libs/jquery-3.1.1.js';

import { PageView } from 'src/view/page/PageView.js';
import { SessionController } from 'src/controller/SessionController.js';

//	2 arrays of the same length to allow looping for creating each line of the table
var attributeNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
var numberInputIds = ['strNumber', 'dexNumber', 'conNumber', 'intNumber', 'wisNumber', 'chaNumber'];
var minAttributeVal = 1;
var maxAttributeVal = 100;

var _SAVE_STATS_BUTTON_CLASS_SELECTOR = '#save-stats-button';
var _STATS_INFO_FIELD_CLASS_SELECTOR = '#stats-info';

// DOM View for the stats dialog window
class PageStatsDialogView {
	// And in the darkness bind them
	static bindSaveCharacterDetails (callback) {
		$(_SAVE_STATS_BUTTON_CLASS_SELECTOR).click(this.sendCharDetails());
	}

	static createSelectorOption (tagValue, text) {
		var classSelector = document.createElement('option');
		classSelector.setAttribute('value', tagValue);
		classSelector.append(document.createTextNode(text));

		return classSelector;
	}

	//	Generates the attribute rows and appends them to the given table element
	static createTableRows (statsTable) {
		for (var i = 0; i < attributeNames.length; i++) {
			var attributeRow = document.createElement('tr');
			var attributeNameElem = document.createElement('td');
			attributeNameElem.append(document.createTextNode(attributeNames[i]));

			var attributeValElem = document.createElement('td');

			var attributeValInput = document.createElement('input');
			attributeValInput.setAttribute('class', 'attrVal');
			attributeValInput.setAttribute('type', 'number');
			attributeValInput.setAttribute('value', 1);
			attributeValInput.setAttribute('id', numberInputIds[i]);
			attributeValInput.setAttribute('min', minAttributeVal);
			attributeValInput.setAttribute('max', maxAttributeVal);
			attributeValElem.append(attributeValInput);

			attributeRow.append(attributeNameElem);
			attributeRow.append(attributeValElem);

			statsTable.append(attributeRow);
		}
	}

	static createStatsTable () {
		var statsTable = document.createElement('table');
		statsTable.setAttribute('id', 'stat-table');

		var statsTableHeaderRow = document.createElement('tr');
		var statsTableLeftHeader = document.createElementStatsDialog('th');
		statsTableLeftHeader.append(document.createTextNode('Attributes'));
		var statsTableRightHeader = document.createElement('th');
		statsTableHeaderRow.append(statsTableLeftHeader);
		statsTableHeaderRow.append(statsTableRightHeader);

		statsTable.append(statsTableHeaderRow);

		this.createTableRows(statsTable);

		return statsTable;
	}

	static clearStatInfo () {
		$(_STATS_INFO_FIELD_CLASS_SELECTOR).val(''); //	JQuery find the field and set it to blank
	}

	static updateStatsInfoLog (message, username) {
		var statsField = $(_STATS_INFO_FIELD_CLASS_SELECTOR);
		var msg = message;

		//	Add a user (server/client) tag to the message
		if (username != null && username !== undefined) msg = '[' + username + '] ' + message;
		statsField.val(statsField.val() + msg + '\n');
	}

	static generateStatWindow () {
		//	Form div to append our elements to
		var form = document.createElement('form');

		//	'Character Name' section
		var nameLabel = document.createElement('p');
		nameLabel.setAttribute('class', 'classLabel');
		nameLabel.append(document.createTextNode('Character Name'));

		var nameInput = document.createElement('input');
		nameInput.setAttribute('type', 'text');
		nameInput.setAttribute('id', 'char-name-input');
		nameInput.setAttribute('required', 'required');
		nameInput.setAttribute('pattern', '[\\w]{1,12}');
		nameInput.setAttribute('Title', '1-12 characters using: a-Z, 0-9, and _');

		//	'Character Class' section
		var classLabel = document.createElement('p');
		classLabel.setAttribute('class', 'classLabel');
		classLabel.append(document.createTextNode('Character Class'));
		//	Dropdown for class type
		var classSelector = document.createElement('select');
		classSelector.setAttribute('id', 'class-selection');
		classSelector.setAttribute('disabled', true);
		classSelector.append(this.createSelectorOption('fighter', 'Fighter'));
		classSelector.append(this.createSelectorOption('spellcaster', 'Spellcaster'));

		//	'Attributes' section
		var statsTable = this.createStatsTable();

		//	This allows displaying any needed info
		var statsInfo = document.createElement('textarea');
		statsInfo.setAttribute('id', 'stats-info');

		var saveButton = document.createElement('input');
		saveButton.setAttribute('type', 'submit');
		saveButton.setAttribute('id', 'save-stats-button');
		saveButton.setAttribute('value', 'Save');

		form.setAttribute('onsubmit', 'return false');
		form.append(nameLabel);
		form.append(nameInput);
		form.append(classLabel);
		form.append(classSelector);
		form.append(statsTable);
		form.append(statsInfo);
		form.append(saveButton);

		return form;
	}

	static createStatsWindow () {
		var statWindowDiv = this.generateStatWindow();
		$('#stat-window').append(statWindowDiv);
	}

	//	Brings up the stats window
	static showStatWindow () {
		PageView.showWindow('statWindowId');
	}

	static requestCharacterDetails () {
		this.showStatWindow();
		this.updateStatsInfoLog('You need to set your character details.', 'client');
	}

	//	Checks that the player's character details are set
	//	and asks them to set them if false
	static checkCharacterDetails () {
		if (!SessionController.characterDetailsExist()) {
			PageStatsDialogView.requestCharacterDetails();
		} else {
			PageView.characterDetailsConfirmed();
		}
	}

	static getStatsCharacterName () {
		return $('#char-name-input').val();
	}

	static setStatsCharacterName (name) {
		$('#char-name-input').val(name);
	}

	static getStatsCharacterClass () {
		return $('#class-selection').val();
	}

	static setStatsCharacterClass (selectionNo) {
		var options = $('#class-selection').find('option');
		var optionsLen = options.length;

		if (selectionNo > 0 && selectionNo < optionsLen) {
			var optionChoice = options[selectionNo].value; //	Choice id e.g 'spellcaster'
			$('#class-selection').val(optionChoice); //	Set the value
		}
	}

	static getStatsAttributeValues () {
		var output = {};

		for (var i = 0; i < numberInputIds.length; i++) {
			var statId = '#' + numberInputIds[i];
			var statValue = $(statId).val();
			output[attributeNames[i]] = statValue;
		}

		return output;
	}

	//	Grabs Character Name, Class, and Attribute values
	static getStats () {
		return {
			'charname': PageStatsDialogView.getStatsCharacterName(),
			'charclass': PageStatsDialogView.getStatsCharacterClass(),
			'attributes': PageStatsDialogView.getStatsAttributeValues()
		};
	}

	//	Takes a JSON object of form: {'STR':1,'DEX':2,...} and sets the value fields to match
	static setStatsAttributeValues (attrValuesJSON) {
		for (var i = 0; i < numberInputIds.length; i++) {
			var statId = '#' + numberInputIds[i];
			var inputVal = attrValuesJSON[attributeNames[i]];

			// Set the value of the field
			$(statId).val(inputVal);
		}
	}

	//	Doesn't seem to hook up to anything yet?
	static setStatsFromJsonResponse (statsValuesJson) {
		console.log('Setting from: ' + statsValuesJson);

		// var charname = statsValuesJson['charname'];
		// var charclass = statsValuesJson['charclass'];
		// var posX = statsValuesJson['pos_x'];
		// var posY = statsValuesJson['pos_x'];
		// var freePoints = statsValuesJson['free_points'];

		var attrValuesJSON = {'STR': statsValuesJson['STR'],
			'DEX': statsValuesJson['DEX'],
			'CON': statsValuesJson['CON'],
			'INT': statsValuesJson['INT'],
			'WIS': statsValuesJson['WIS'],
			'CHA': statsValuesJson['CHA']};

		PageStatsDialogView.setStatsAttributeValues(attrValuesJSON);
	}
}

export { PageStatsDialogView };

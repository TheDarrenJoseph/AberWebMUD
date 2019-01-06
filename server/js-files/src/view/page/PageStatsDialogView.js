import $ from 'libs/jquery.js';
import { PageView } from 'src/view/page/PageView.js';

//	2 arrays of the same length to allow looping for creating each line of the table
const attributeNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
const numberInputIds = ['strNumber', 'dexNumber', 'conNumber', 'intNumber', 'wisNumber', 'chaNumber'];
const minAttributeVal = 1;
const maxAttributeVal = 100;

export var _STATS_WINDOW_ID = 'stat-window';
const _STATS_FORM_ID = 'stat-form';
const _STATS_TABLE_ID = 'stat-table';
const _STATS_INFO_FIELD_ID = 'stats-info';
const _SAVE_STATS_BUTTON_ID = 'save-stats-button';

const _CHAR_NAME_INPUT_ID = 'char-name-input';
const _CHAR_CLASS_SELECTION_ID = 'class-selection';

// DOM View for the stats dialog window
export default class PageStatsDialogView {
	static buildView () {
		var statsWindowJquery = $('#'+_STATS_WINDOW_ID);
		var statsFormJquery = $('#'+_STATS_FORM_ID);
		
		var statsWindowExists = statsWindowJquery.length > 0;
		var statsFormBuilt    = statsFormJquery.length > 0;
		
		// Check we haven't built the form before
		if (!statsFormBuilt) {
			var statWindowForm = PageStatsDialogView.generateStatWindow();
			
			// There should be a stat-window div in our HTML to append to
			// Otherwise create it
			if (statsWindowExists) {
				statsWindowJquery.append(statWindowForm);
			} else {
				console.log('No preset stat window div found, building it..');
				var statWindow = document.createElement('div');
				statWindow.setAttribute('class', 'dialog');
				statWindow.setAttribute('id', _STATS_WINDOW_ID);
				statWindow.appendChild(statWindowForm);

				PageView.getMainWindowJquery().append(statWindow);
			}
			
			//console.log('Built stats window DOM element:');
			//console.log($('#'+_STATS_WINDOW_ID)[0]);
		}
	}
	
	// And in the darkness bind them
	static bindSaveCharacterDetails (callback) {
		$('#'+_SAVE_STATS_BUTTON_ID).click(callback);
	}
	
	static getSaveStatsButton() {
		return $('#'+_SAVE_STATS_BUTTON_ID).get(0);
	}
	
	static clearStatsInfoField () {
		$('#'+_STATS_INFO_FIELD_ID).val('');
	};
	
	static getStatsInfoField() {
		return $('#'+_STATS_INFO_FIELD_ID).get(0);
	}
	
	static getStatsInfoFieldValue () {
		return $('#'+_STATS_INFO_FIELD_ID).val();
	};
	
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
		statsTable.setAttribute('id', _STATS_TABLE_ID);

		var statsTableHeaderRow = document.createElement('tr');
		var statsTableLeftHeader = document.createElement('th');
		statsTableLeftHeader.append(document.createTextNode('Attributes'));
		var statsTableRightHeader = document.createElement('th');
		statsTableHeaderRow.append(statsTableLeftHeader);
		statsTableHeaderRow.append(statsTableRightHeader);

		statsTable.append(statsTableHeaderRow);

		PageStatsDialogView.createTableRows(statsTable);

		return statsTable;
	}

	static clearStatInfo () {
		PageStatsDialogView.getStatsInfoField().value = '';
	}

	static updateStatsInfoLog (message, username) {
		var statsField = PageStatsDialogView.getStatsInfoField();
		var msg = message;

		//	Add a user (server/client) tag to the message
		if (username != null && username !== undefined) msg = '[' + username + '] ' + message;
		statsField.value = statsField.value + msg + '\n';
	}
	
	// Generate the inner content for the stat window
	static generateStatWindow () {
		//	Form div to append our elements to
		var form = document.createElement('form');
		form.setAttribute('id', 'char-name-input');
		
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
		classSelector.append(PageStatsDialogView.createSelectorOption('fighter', 'Fighter'));
		classSelector.append(PageStatsDialogView.createSelectorOption('spellcaster', 'Spellcaster'));

		//	'Attributes' section
		var statsTable = PageStatsDialogView.createStatsTable();
		
		//	This allows displaying any needed info
		var statsInfo = document.createElement('textarea');
		statsInfo.setAttribute('id', _STATS_INFO_FIELD_ID);

		var saveButton = document.createElement('input');
		saveButton.setAttribute('type', 'submit');
		saveButton.setAttribute('id', _SAVE_STATS_BUTTON_ID);
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

	//	Brings up the stats window
	static showStatWindow () {
		PageView.showWindow('statWindowId');
	}

	static requestCharacterDetails () {
		PageStatsDialogView.showStatWindow();
		PageStatsDialogView.updateStatsInfoLog('You need to set your character details.', 'client');
	}

	static getStatsCharacterName () {
		return $('#'+_CHAR_NAME_INPUT_ID).val();
	}

	static setStatsCharacterName (name) {
		$('#'+_CHAR_NAME_INPUT_ID).val(name);
	}

	static getStatsCharacterClass () {
		return $('#'+_CHAR_CLASS_SELECTION_ID).val();
	}

	static setStatsCharacterClass (selectionNo) {
		var options = $('#'+_CHAR_CLASS_SELECTION_ID).find('option');
		var optionsLen = options.length;

		if (selectionNo > 0 && selectionNo < optionsLen) {
			var optionChoice = options[selectionNo].value; //	Choice id e.g 'spellcaster'
			$('#'+_CHAR_CLASS_SELECTION_ID).val(optionChoice); //	Set the value
		}
	}

	static getStatsAttributeValues () {
		var output = {};

		for (var i = 0; i < numberInputIds.length; i++) {
			var statId = '#' + numberInputIds[i];
			// Extract the value of the first match to statId
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

			// Set the value of the first match for our field
			$(statId).val(inputVal);
		}
	}

	static setStatsFromJsonResponse (statsValuesJson) {		
		// TODO Need to set these also
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

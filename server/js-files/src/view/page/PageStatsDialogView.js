import $ from 'libs/jquery.js';
import { PageView } from 'src/view/page/PageView.js';

//	2 arrays of the same length to allow looping for creating each line of the table
const attributeNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
const defaultStats = {'STR':1,'DEX':1,'CON':1,'INT':1,'WIS':1,'CHA':1};
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

export var SET_CHARDETAILS_PROMPT_MESSAGE = 'You need to set your character details.';

// this might be a little messy
// but we want to be able to store a simple ID and the Option display text
// While still allowing indexing from option number
export var CLASS_OPTIONS = [
		{ id: 'fighter', text : 'Fighter'},
		{ id: 'spellcaster', text : 'Spellcaster'}
	];


// DOM View for the stats dialog window
export default class PageStatsDialogView {

	constructor (pageView) {
		this.pageView = pageView;
	}

	buildView () {
		var statsWindowJquery = $('#' + _STATS_WINDOW_ID, this.pageView.DOCUMENT);
		var statsFormJquery = $('#' + _STATS_FORM_ID, this.pageView.DOCUMENT);

		var statsWindowExists = statsWindowJquery.length > 0;
		var statsFormBuilt = statsFormJquery.length > 0;

		// Check we haven't built the form before
		if (!statsFormBuilt) {
			var statWindowForm = this.generateStatWindow();

			// There should be a stat-window div in our HTML to append to
			// Otherwise create it
			if (statsWindowExists) {
				statsWindowJquery.append(statWindowForm);
			} else {
				console.log('No preset stat window div found, building it..');
				var statWindow = this.pageView.DOCUMENT.createElement('div');
				statWindow.setAttribute('class', 'dialog');
				statWindow.setAttribute('id', _STATS_WINDOW_ID);
				statWindow.appendChild(statWindowForm);

				this.pageView.getMainWindowJquery().append(statWindow);
			}

			//console.log('Built stats window DOM element:');
			//console.log($('#'+_STATS_WINDOW_ID)[0]);
		}
	}

	// And in the darkness bind them
	bindSaveCharacterDetails (callback) {
		this.getSaveStatsButtonJquery().click(callback);
	}

	getSaveStatsButton () {
		return $('#' + _SAVE_STATS_BUTTON_ID, this.pageView.DOCUMENT).get(0);
	}

	getSaveStatsButtonJquery () {
		return $('#' + _SAVE_STATS_BUTTON_ID, this.pageView.DOCUMENT);
	}

	clearStatsInfoField () {
		this.getStatsInfoFieldJquery().val('');
	};

	getStatsInfoField () {
		return $('#' + _STATS_INFO_FIELD_ID,  this.pageView.DOCUMENT).get(0);
	}

	getStatsInfoFieldJquery () {
		return $('#' + _STATS_INFO_FIELD_ID,  this.pageView.DOCUMENT);
	}

	getStatsInfoFieldValue () {
		return this.getStatsInfoFieldJquery().val();
	};

	createSelectorOption (tagValue, text) {
		var classSelector = this.pageView.DOCUMENT.createElement('option');
		classSelector.setAttribute('value', tagValue);
		classSelector.append(this.pageView.DOCUMENT.createTextNode(text));

		return classSelector;
	}

	//	Generates the attribute rows and appends them to the given table element
	createTableRows (statsTable) {
		for (var i = 0; i < attributeNames.length; i++) {
			var attributeRow = this.pageView.DOCUMENT.createElement('tr');
			var attributeNameElem = this.pageView.DOCUMENT.createElement('td');
			attributeNameElem.append(this.pageView.DOCUMENT.createTextNode(attributeNames[i]));

			var attributeValElem = this.pageView.DOCUMENT.createElement('td');

			var attributeValInput = this.pageView.DOCUMENT.createElement('input');
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

	createStatsTable () {
		var statsTable = this.pageView.DOCUMENT.createElement('table');
		statsTable.setAttribute('id', _STATS_TABLE_ID);

		var statsTableHeaderRow = this.pageView.DOCUMENT.createElement('tr');
		var statsTableLeftHeader = this.pageView.DOCUMENT.createElement('th');
		statsTableLeftHeader.append(this.pageView.DOCUMENT.createTextNode('Attributes'));
		var statsTableRightHeader = this.pageView.DOCUMENT.createElement('th');
		statsTableHeaderRow.append(statsTableLeftHeader);
		statsTableHeaderRow.append(statsTableRightHeader);

		statsTable.append(statsTableHeaderRow);

		this.createTableRows(statsTable);

		return statsTable;
	}

	clearStatInfo () {
		this.getStatsInfoField().value = '';
	}

	updateStatsInfoLog (message, username) {
		var statsField = this.getStatsInfoField();
		var msg = message;

		//	Add a user (server/client) tag to the message
		if (username != null && username !== undefined) msg = '[' + username + '] ' + message;
		statsField.value = statsField.value + msg + '\n';
	}

	// Generate the inner content for the stat window
	generateStatWindow () {
		//	Form div to append our elements to
		var form = this.pageView.DOCUMENT.createElement('form');
		form.setAttribute('id', _STATS_FORM_ID);

		//	'Character Name' section
		var nameLabel = this.pageView.DOCUMENT.createElement('p');
		nameLabel.setAttribute('class', 'classLabel');
		nameLabel.append(this.pageView.DOCUMENT.createTextNode('Character Name'));

		var nameInput = this.pageView.DOCUMENT.createElement('input');
		nameInput.setAttribute('type', 'text');
		nameInput.setAttribute('id', 'char-name-input');
		nameInput.setAttribute('required', 'required');
		nameInput.setAttribute('pattern', '[\\w]{1,12}');
		nameInput.setAttribute('Title', '1-12 characters using: a-Z, 0-9, and _');

		//	'Character Class' section
		var classLabel = this.pageView.DOCUMENT.createElement('p');
		classLabel.setAttribute('class', 'classLabel');
		classLabel.append(this.pageView.DOCUMENT.createTextNode('Character Class'));
		//	Dropdown for class type
		var classSelector = this.pageView.DOCUMENT.createElement('select');
		classSelector.setAttribute('id', 'class-selection');
		classSelector.setAttribute('disabled', true);

		CLASS_OPTIONS.forEach(classOption => {
			classSelector.append(this.createSelectorOption(classOption.id, classOption.text));
		});

		//	'Attributes' section
		var statsTable = this.createStatsTable();

		//	This allows displaying any needed info
		var statsInfo = this.pageView.DOCUMENT.createElement('textarea');
		statsInfo.setAttribute('id', _STATS_INFO_FIELD_ID);

		var saveButton = this.pageView.DOCUMENT.createElement('input');
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
	showStatWindow () {
		this.pageView.showWindow('statWindowId');
	}

	requestCharacterDetails () {
		this.showStatWindow();
		this.updateStatsInfoLog(SET_CHARDETAILS_PROMPT_MESSAGE, 'client');
	}

	getStatsCharacterNameVal () {
		return $('#' + _CHAR_NAME_INPUT_ID, this.pageView.DOCUMENT).val();
	}

	getStatsCharacterNameJquery () {
		return $('#' + _CHAR_NAME_INPUT_ID, this.pageView.DOCUMENT);
	}

	setStatsCharacterName (name) {
		this.getStatsCharacterNameJquery().val(name);
	}

	getStatsCharacterClass () {
		return $('#' + _CHAR_CLASS_SELECTION_ID, this.pageView.DOCUMENT).val();
	}

	getClassOptionIndex (optionId) {
		return CLASS_OPTIONS.findIndex(obj => { return obj.id == optionId } );
	}

	// Set the stats charClass choice to a given selection number
	// As this will be a procedurally generated option selection
	setStatsCharacterClass (selectionNo) {
		var options = $('#'+_CHAR_CLASS_SELECTION_ID, this.pageView.DOCUMENT).find('option');
		if (selectionNo > 0 && selectionNo < options.length) {
			var optionChoice = options[selectionNo].value;
			$('#'+_CHAR_CLASS_SELECTION_ID, this.pageView.DOCUMENT).val(optionChoice); //	Set the value
		} else {
			throw new RangeError('Invalid character class selection option: '+ selectionNo);
		}
	}
	
	clearAll() {
		this.setStatsCharacterName('');
		this.setStatsCharacterClass(0);
		this.setStatsAttributeValues(defaultStats);
	}

	getStatsAttributeValues () {
		var output = {};

		for (var i = 0; i < numberInputIds.length; i++) {
			var statId = '#' + numberInputIds[i];
			// Extract the value of the first match to statId
			var statValue = parseInt($(statId, this.pageView.DOCUMENT).val());
			output[attributeNames[i]] = statValue;
		}

		return output;
	}

	//	Grabs Character Name, Class, and Attribute values
	getStats () {
		return {
			'charname': this.getStatsCharacterNameVal(),
			'charclass': this.getStatsCharacterClass(),
			'attributes': this.getStatsAttributeValues()
		};
	}

	//	Takes a JSON object of form: {'STR':1,'DEX':2,...} and sets the value fields to match
	setStatsAttributeValues (attrValuesJSON) {
		for (var i = 0; i < numberInputIds.length; i++) {
			var statId = '#' + numberInputIds[i];
			var inputVal = attrValuesJSON[attributeNames[i]];
			// Set the value of the first match for our field
			$(statId, this.pageView.DOCUMENT).val(inputVal);
		}
	}

	setStatsFromJsonResponse (statsValuesJson) {
		console.log('Saving stats:'+JSON.stringify(statsValuesJson));
		this.setStatsCharacterName(statsValuesJson['charname']);
		this.setStatsCharacterClass(this.getClassOptionIndex(statsValuesJson['charclass']));
		
		// TODO Assign free points to something
		// var freePoints = statsValuesJson['free_points'];
		
		// Extract just the attribute fields
		this.setStatsAttributeValues(statsValuesJson['scores']);
	}
}

export { PageStatsDialogView };

import jquery from 'jquery';

//import EventMapping from 'src/helper/EventMapping.js';

//import $ from 'libs/jquery.js';
import { EVENTS as characterDetailsEvents, CLASS_OPTIONS, DEFAULT_STATS, ATTRIB_NAMES, ATTRIB_INPUT_IDS, MIN_ATTRIB_VAL, MAX_ATTRIB_VAL } from 'src/model/page/CharacterDetails.js';
import { PageView } from 'src/view/page/PageView.js';
import { EventMapping } from 'src/helper/EventMapping.js';

export var _STATS_WINDOW_ID = 'stat-window';
const _STATS_FORM_ID = 'stat-form';
const _STATS_TABLE_ID = 'stat-table';
const _STATS_INFO_FIELD_ID = 'stats-info';
const _SAVE_STATS_BUTTON_ID = 'save-stats-button';

const _CHAR_NAME_INPUT_ID = 'char-name-input';
const _CHAR_CLASS_SELECTION_ID = 'class-selection';

export var SET_CHARDETAILS_PROMPT_MESSAGE = 'You need to set your character details.';

export const EVENTS = { SAVE_STATS : 'save_stats' };

// DOM View for the Character Stats dialog window
export default class PageCharacterDetailsView  extends EventMapping {

	/**
	 * Construct and manage the HTML view elements for Character Details
	 * @param pageView the parent Page View so we can access parent view elements and behaviours
	 * @param characterDetails CharacterDetails model to display
	 */
	constructor (pageView, characterDetails) {
		super();

		// We need to be able to make some calls to show/hide windows etc
		this.pageView = pageView;
		// Extract the page view document
		let doc = this.pageView.pageModel.doc;
		if (doc == undefined) {
			throw new RangeError("No Document provided for PageCharacterDetailsView");
		}

		this.doc = this.pageView.pageModel.doc;

		// Assign the stats window to the main page view windows
		this.pageView.htmlWindows['statWindowId'] = '#'+_STATS_WINDOW_ID;

		this.characterDetails = characterDetails;
	}

	buildView () {
		var statsWindowJquery = jquery('#' + _STATS_WINDOW_ID, this.doc);
		var statsFormJquery = jquery('#' + _STATS_FORM_ID, this.doc);

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
				var statWindow = this.doc.createElement('div');
				statWindow.setAttribute('class', 'dialog');
				statWindow.setAttribute('id', _STATS_WINDOW_ID);
				statWindow.appendChild(statWindowForm);

				return statWindow;
			}

			//console.log('Built stats window DOM element:');
			//console.log(jquery('#'+_STATS_WINDOW_ID)[0]);
		}
	}

	bindEvents () {
			// Ensure we update our view whenever the model is updated
			this.characterDetails.on(characterDetailsEvents.SET_STATS, this.setStatsAttributeValues);
			let statsButtonJquery = this.getSaveStatsButtonJquery();

			if (statsButtonJquery.length >= 1) {
				statsButtonJquery[0].click(this.emit(EVENTS.SAVE_STATS));
			} else {
				throw new Error("Cannot bind to non-existent save stats button");
			}

	}

	getStatsWindow() {
		let elements = this.getStatsWindowJquery();
		if (elements.length >= 1) {
			return elements.get(0);
		} else {
			throw new Error("Stats window not present.");
		}
	}

	getStatsWindowJquery() {
		return jquery('#'+_STATS_WINDOW_ID, this.doc);
	}

	getSaveStatsButton() {
		let elements = this.getSaveStatsButtonJquery();
		if (elements.length >= 1) {
			return elements.get(0);
		} else {
			throw new Error("Save stats button not present.");
		}
	}

	getSaveStatsButtonJquery() {
		return jquery('#' + _SAVE_STATS_BUTTON_ID, this.doc);
	}

	clearStatsInfoField() {
		this.getStatsInfoFieldJquery().val('');
	};

	getStatsInfoField() {
		let elements = this.getStatsInfoFieldJquery();
		if (elements.length >= 1) {
			return elements.get(0);
		} else {
			throw new Error("Stats info field not present.");
		}
	}

	getStatsInfoFieldJquery () {
		return jquery('#' + _STATS_INFO_FIELD_ID,  this.doc);
	}

	getStatsInfoFieldValue () {
		return this.getStatsInfoFieldJquery().val();
	};

	createSelectorOption (tagValue, text) {
		var classSelector = this.doc.createElement('option');
		classSelector.setAttribute('value', tagValue);
		classSelector.append(this.doc.createTextNode(text));

		return classSelector;
	}

	//	Generates the attribute rows and appends them to the given table element
	createTableRows (statsTable) {
		let ATTRIB_NAMES = Object.keys(DEFAULT_STATS);

		for (var i = 0; i < ATTRIB_NAMES.length; i++) {

			let attribName = ATTRIB_NAMES[i]
			var attributeRow = this.doc.createElement('tr');
			var attributeNameElem = this.doc.createElement('td');
			attributeNameElem.append(this.doc.createTextNode(attribName));

			var attributeValElem = this.doc.createElement('td');

			var attributeValInput = this.doc.createElement('input');
			attributeValInput.setAttribute('class', 'attrVal');
			attributeValInput.setAttribute('type', 'number');
			attributeValInput.setAttribute('value', 1);
			attributeValInput.setAttribute('id', ATTRIB_INPUT_IDS[i]);
			attributeValInput.setAttribute('min', MIN_ATTRIB_VAL);
			attributeValInput.setAttribute('max', MAX_ATTRIB_VAL);
			attributeValElem.append(attributeValInput);

			attributeRow.append(attributeNameElem);
			attributeRow.append(attributeValElem);

			statsTable.append(attributeRow);
		}
	}

	createStatsTable () {
		var statsTable = this.doc.createElement('table');
		statsTable.setAttribute('id', _STATS_TABLE_ID);

		var statsTableHeaderRow = this.doc.createElement('tr');
		var statsTableLeftHeader = this.doc.createElement('th');
		statsTableLeftHeader.append(this.doc.createTextNode('Attributes'));
		var statsTableRightHeader = this.doc.createElement('th');
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
		var form = this.doc.createElement('form');
		form.setAttribute('id', _STATS_FORM_ID);

		//	'Character Name' section
		var nameLabel = this.doc.createElement('p');
		nameLabel.setAttribute('class', 'classLabel');
		nameLabel.append(this.doc.createTextNode('Character Name'));

		var nameInput = this.doc.createElement('input');
		nameInput.setAttribute('type', 'text');
		nameInput.setAttribute('id', 'char-name-input');
		nameInput.setAttribute('required', 'required');
		nameInput.setAttribute('pattern', '[\\w]{1,12}');
		nameInput.setAttribute('Title', '1-12 characters using: a-Z, 0-9, and _');

		//	'Character Class' section
		var classLabel = this.doc.createElement('p');
		classLabel.setAttribute('class', 'classLabel');
		classLabel.append(this.doc.createTextNode('Character Class'));
		//	Dropdown for class type
		var classSelector = this.doc.createElement('select');
		classSelector.setAttribute('id', 'class-selection');
		classSelector.setAttribute('disabled', true);

		CLASS_OPTIONS.forEach(classOption => {
			classSelector.append(this.createSelectorOption(classOption.id, classOption.text));
		});

		//	'Attributes' section
		var statsTable = this.createStatsTable();

		//	This allows displaying any needed info
		var statsInfo = this.doc.createElement('textarea');
		statsInfo.setAttribute('id', _STATS_INFO_FIELD_ID);

		var saveButton = this.doc.createElement('input');
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

	requestCharacterDetails () {
		this.pageView.showWindow('statWindowId');
		this.updateStatsInfoLog(SET_CHARDETAILS_PROMPT_MESSAGE, 'client');
	}

	getStatsCharacterNameVal () {
		return jquery('#' + _CHAR_NAME_INPUT_ID, this.doc).val();
	}

	getStatsCharacterNameJquery () {
		return jquery('#' + _CHAR_NAME_INPUT_ID, this.doc);
	}

	setStatsCharacterName (name) {
		this.getStatsCharacterNameJquery().val(name);
	}

	getStatsCharacterClass () {
		return jquery('#' + _CHAR_CLASS_SELECTION_ID, this.doc).val();
	}

	getClassOptionIndex (optionId) {
		return CLASS_OPTIONS.findIndex(obj => { return obj.id == optionId } );
	}

	// Set the stats charClass choice to a given selection number
	// As this will be a procedurally generated option selection
	setStatsCharacterClass (selectionNo) {
		var options = jquery('#'+_CHAR_CLASS_SELECTION_ID, this.doc).find('option');
		if (selectionNo > 0 && selectionNo < options.length) {
			var optionChoice = options[selectionNo].value;
			jquery('#'+_CHAR_CLASS_SELECTION_ID, this.doc).val(optionChoice); //	Set the value
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

		for (var i = 0; i < ATTRIB_INPUT_IDS.length; i++) {
			var statId = '#' + ATTRIB_INPUT_IDS[i];
			// Extract the value of the first match to statId
			var statValue = parseInt(jquery(statId, this.doc).val());
			output[ATTRIB_NAMES[i]] = statValue;
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
		console.log('Displaying stats:'+JSON.stringify(attrValuesJSON));

		for (var i = 0; i < ATTRIB_INPUT_IDS.length; i++) {
			var statId = '#' + ATTRIB_INPUT_IDS[i];
			var inputVal = attrValuesJSON[ATTRIB_NAMES[i]];
			// Set the value of the first match for our field
			jquery(statId, this.doc).val(inputVal);
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

export { PageCharacterDetailsView };

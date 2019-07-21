import jquery from 'jquery';

//import EventMapping from 'src/helper/EventMapping.js';

//import $ from 'libs/jquery.js';
import { EVENTS as characterDetailsEvents, CLASS_OPTIONS, DEFAULT_ATTRIBUTES, ATTRIB_NAMES, ATTRIB_INPUT_IDS, MIN_ATTRIB_VAL, MAX_ATTRIB_VAL } from 'src/model/page/CharacterDetails.js';
import { PageView } from 'src/view/page/PageView.js';
import { EventMapping } from 'src/helper/EventMapping.js';

// These should be in mostly hierarchical order
export var _STATS_WINDOW_ID = 'stat-window';
const _STATS_FORM_ID = 'stat-form';
const _STATS_TABLE_ID = 'stat-table';
const _STATS_INFO_FIELD_ID = 'stats-info';
const _SAVE_STATS_BUTTON_ID = 'save-stats-button';

const _CHAR_NAME_INPUT_ID = 'char-name-input';
const _CHAR_CLASS_SELECTION_ID = 'class-selection';

export var SET_CHARDETAILS_PROMPT_MESSAGE = 'You need to set your character details.';

// To enable debug logging for quick event checking
const DEBUG = false;

export const EVENTS = {
	// For submitting some values for confirmation
	SUBMIT_STATS : 'submit-stats',
	// This means the view has been updated
	VIEW_STATS_SET : 'stats-set'
};

// DOM View for the Character Stats dialog window
export default class PageCharacterDetailsView  extends EventMapping {

	/**
	 * Construct and manage the HTML view elements for Character Details
	 * @param pageView the parent Page View so we can access parent view elements and behaviours
	 * @param characterDetails CharacterDetails model to display
	 */
	constructor (pageView, characterDetails) {
		super(EVENTS);

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

	setupEmitting () {
		try {
			// When trying to save stats, ensure we submit them
			let statsButtonJquery = this.getSaveStatsButtonJquery();
			statsButtonJquery.click(() => { this.submitStats() });
		} catch (err) {
			throw new Error("Could not bind to save-stats button: " + err);
		}
	}

	/**
	 * Emits the data for this view.
	 */
	submitStats() {
		let statsData = this.characterDetails.getCharacterDetailsJson();
		this.emit(EVENTS.SUBMIT_STATS, statsData);
	}

	/**
	 * Binds to any events this view needs to react to w/o emitting
	 */
	bindEvents () {
		// Ensure we update our view whenever the model is updated
		this.characterDetails.on(characterDetailsEvents.SET_DETAILS, () => {
			if (DEBUG) console.log('Updating character details view..')
			this.setStatsFromJsonResponse(this.characterDetails.getCharacterDetailsJson())
		});

		// Ensure we update our view whenever the model is updated
		this.characterDetails.on(characterDetailsEvents.SET_ATTRIBS, () => {
			if (DEBUG) console.log('Updating character details view stats..')
			this.setAttributes(this.characterDetails.getAttributes())
		});
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

	getStatsForm() {
		let elements = this.getStatsFormJquery();
		if (elements.length >= 1) {
			return elements.get(0);
		} else {
			throw new Error("Stats form not present.");
		}
	}

	getStatsFormJquery() {
		return jquery('#'+_STATS_FORM_ID, this.doc);
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

	getCharclassSelection() {
		let elements = this.getCharclassSelectionJquery();
		if (elements.length >= 1) {
			return elements.get(0);
		} else {
			throw new Error("Charclass selection field not present.");
		}
	}

	setCharclassSelection(value) {
		this.getCharclassSelectionJquery().val(value);
	}


	getCharclassSelectionJquery() {
		return jquery('#'+_CHAR_CLASS_SELECTION_ID, this.doc);
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
		let ATTRIB_NAMES = Object.keys(DEFAULT_ATTRIBUTES);

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

	/**
	 * Idempotently generates the stats window parent element for this view and add it to the document
	 */
	generateStatsWindow () {
		try {
			this.getStatsWindow();
		} catch (err) {
			let statsWindow = this.buildStatsWindow();
			this.pageView.appendToGameWindow(statsWindow);
		}
	}

	/**
	 * Idempotently generates the stats form for inside the stats window and adds it the statsWindow, creating the window
	 * if needed
	 */
	generateStatsForm () {
		// First try to grab the main window
		let statsWindow = this.getStatsWindow();

		// Check if this form exists already, otherwise build it.
		let statsForm = undefined;
		try {
			statsForm = this.getStatsForm();
		} catch (err) {
			statsForm = this.buildStatsForm();
			statsWindow.appendChild(statsForm);
		}

	}

	buildStatsWindow() {
		var statWindow = this.doc.createElement('div');
		statWindow.setAttribute('class', 'dialog');
		statWindow.setAttribute('id', _STATS_WINDOW_ID);
		return statWindow;
	}

	/**
	 * Simply builds a <form> element for character stats
	 * @returns HTMLElement for the <form>
	 */
	buildStatsForm() {
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
		classSelector.setAttribute('id', _CHAR_CLASS_SELECTION_ID);
		classSelector.setAttribute('disabled', false);

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
		// Check the field exists by grabbing it
		this.getCharclassSelection();

		var options = this.getCharclassSelectionJquery().find('option');
		if (options.length > 0) {
			if (selectionNo > 0 && selectionNo < options.length) {
				var optionChoice = options[selectionNo].value;
				this.setCharclassSelection(optionChoice);
			} else {
				throw new RangeError('Invalid character class selection option: ' + selectionNo);
			}
		} else {
			throw new Error('Charclass options not available: ' + options);
		}
	}
	
	clearAll() {
		this.setStatsCharacterName('');
		this.setStatsCharacterClass(0);
		this.setAttributes(this.characterDetails.getAttributes());
	}

	/**
	 * Gets the current stats being displayed
	 * @returns {{charclass: *, attributeScores: *, charname: *}}
	 */
	getViewStats () {
		return {
			'charname': this.getStatsCharacterNameVal(),
			'charclass': this.getStatsCharacterClass(),
			'attributes': this.getAttributes()
		};
	}

	//	Takes a JSON object of form: {'STR':1,'DEX':2,...} and sets the value fields to match

	/**
	 * Displays a series of stats for the character details
	 * @param attrValuesJSON JSON mapping of attribute names to integer values
	 */
	setAttributes (attrValuesJSON) {
		for (var i = 0; i < ATTRIB_INPUT_IDS.length; i++) {
			var statId = '#' + ATTRIB_INPUT_IDS[i];
			var inputVal = attrValuesJSON[ATTRIB_NAMES[i]];
			// Set the value of the first match for our field
			jquery(statId, this.doc).val(inputVal);
		}
	}

	/**
	 * Displays the values from a JSON Response, without adjusting the underlying data model
	 * @param statsValuesJson
	 */
	setStatsFromJsonResponse (statsValuesJson) {
		if (DEBUG) console.log('Displaying stats:'+JSON.stringify(statsValuesJson));

		let characterJson = statsValuesJson['character'];

		this.setStatsCharacterName(characterJson['charname']);
		let classOption = this.getClassOptionIndex(characterJson['charclass']);
		this.setStatsCharacterClass(classOption);
		this.setAttributes(characterJson['attributes']);


		// TODO Assign free points to something as we don't have a field yet
		// var freePoints = statsValuesJson['free_points']

		this.emit(EVENTS.VIEW_STATS_SET);
	}

	/**
	 * Constructs all HTML elements of this view and returns them
	 * @returns {HTMLElement | any | ActiveX.IXMLDOMElement}
	 */
	buildView () {
		// Build the window itself if needed
		this.generateStatsWindow();
		this.generateStatsForm();
	}

	destroyView () {
		this.destroyStatsWindow();
	}

	/**
	 * Removes the main window div
	 */
	destroyStatsWindow () {
		try {
			let statsWindow = this.getStatsWindow();
			//jquery(this.getStatsWindowJquery()).remove();
			jquery(statsWindow).remove();
		} catch (err) {
			// Stats window didn't exist anyway
		}
	}


}

export { PageCharacterDetailsView };

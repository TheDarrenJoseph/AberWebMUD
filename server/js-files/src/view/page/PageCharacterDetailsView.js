//import jquery from 'jquery';
import jquery from 'libs/jquery-3.4.1.dev.js';
//import EventMapping from 'src/helper/EventMapping.js';

//import $ from 'libs/jquery.js';
import { EVENTS as characterDetailsEvents, CLASS_OPTIONS } from 'src/model/page/CharacterDetails.js';
import { PageView } from 'src/view/page/PageView.js';
import { PageHtmlView } from 'src/view/page/PageHtmlView.js';
import { AttributeScores, FREEPOINTS_NAME, SCORES_NAME, MAX_VALUE_NAME, MIN_VALUE_NAME } from '../../model/page/AttributeScores'

// These should be in mostly hierarchical order
export const _STATS_WINDOW_ID = 'stat-window';

const _STATS_FORM_ID = 'stat-form';
const _STATS_TABLE_ID = 'stat-table';
const _FREE_POINTS_FIELD_ID = 'freePoints';
const _STATS_INFO_FIELD_ID = 'stats-info';
const _SAVE_STATS_BUTTON_ID = 'save-stats-button';

const _CHAR_NAME_INPUT_ID = 'char-name-input';
const _CHAR_CLASS_SELECTION_ID = 'class-selection';

const ATTRIBUTE_INPUT_CLASS = 'attributeInput';

export var SET_CHARDETAILS_PROMPT_MESSAGE = 'You need to set your character details.';

// To enable debug logging for quick event checking
const DEBUG = true;

export const EVENTS = {
	// For submitting some values for confirmation
	SUBMIT_STATS : 'submit-stats',
	// This means the view has been updated
	VIEW_STATS_SET : 'stats-set'
};

// DOM View for the Character Stats dialog window
export default class PageCharacterDetailsView  extends PageHtmlView {

	/**
	 * Construct and manage the HTML view elements for Character Details
	 * @param pageView the parent Page View so we can access parent view elements and behaviours
	 * @param characterDetails CharacterDetails model to display
	 */
	constructor (pageView, characterDetails) {
		super(pageView.pageModel.doc, EVENTS, { [_STATS_WINDOW_ID]: '#' + _STATS_WINDOW_ID });

		// We need to be able to make some calls to show/hide windows etc
		this.pageView = pageView;
		// Assign the stats window to the main page view windows
		//this.pageView.htmlWindows['statWindowId'] = this.getHtmlIdMapping(_STATS_WINDOW_ID);
		this.characterDetails = characterDetails;
		this.attribNameIdMappings = new Map();
	}

	getCharacterDetails(){
		return this.characterDetails;
	}

	setCharacterDetails(characterDetails) {
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
	submitStats () {
		let displayedCharname = this.getStatsCharacterNameVal();
		let displayedCharclass = this.getCharacterClassValue();
		let displayedAttribs = this.getAttributesJson();

		// Update the underlying data model before we submit it
		let currentDetails = this.characterDetails;
		currentDetails.setCharacterName(displayedCharname);
		currentDetails.setCharacterClass(displayedCharclass);
		currentDetails.setAttributesFromJson(displayedAttribs);

		// Extract the JSON representation and send that
		let statsData = this.characterDetails.getJson();
		this.emit(EVENTS.SUBMIT_STATS, statsData);
	}

	updateDisplayedAttributeScores(attribScores) {
		// Ensure we have the view elements to display the model
		this.updateCharacterAttributeScores(attribScores)
		// Actually display the scores
		this.setAttributes(attribScores)
	}

	/**
	 * Binds to any events this view needs to react to w/o emitting
	 */
	bindEvents () {
		// Ensure we update our view whenever the model is updated
		this.characterDetails.on(characterDetailsEvents.SET_DETAILS, () => {
			if (DEBUG) console.log('Updating character details view..')
			this.updateView();
		});

		// Ensure we update our view whenever the model is updated
		this.characterDetails.on(characterDetailsEvents.SET_ATTRIB_SCORES, (attribScores) => {
			this.updateDisplayedAttributeScores(attribScores)
		});

		// Wait until the underlying model has the data we need from the server
		// Then we can set the correct UI values
		this.characterDetails.on(characterDetailsEvents.SET_CLASS_OPTIONS, (charClassOptions) => {
			// Ensure we can display these character class options
			this.updateCharacterClassOptions(charClassOptions)
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
		return jquery(this.getHtmlIdMapping(_STATS_WINDOW_ID), this.doc);
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

	getCharclassSelectionJquery() {
		return jquery('#'+_CHAR_CLASS_SELECTION_ID, this.doc);
	}

	getCharclassSelection() {
		return this.extractElementFromJquery(this.getCharclassSelectionJquery())
	}

	setCharclassSelection(value) {
		this.getCharclassSelectionJquery().val(value);
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

	getStatsAttributeTableJquery () {
		return jquery('#' + _STATS_TABLE_ID,  this.doc);
	}

	getStatsAttributeTable() {
		return this.extractElementFromJquery(this.getStatsAttributeTableJquery());
	}

	getStatsInfoFieldValue () {
		return this.getStatsInfoFieldJquery().val();
	};

	createSelectorOption (id, text) {
		var classSelector = this.doc.createElement('option');
		classSelector.setAttribute('id', id);
		classSelector.setAttribute('class', 'characterClassOption');
		classSelector.setAttribute('value', text);
		classSelector.append(this.doc.createTextNode(text));
		return classSelector;
	}

	attributeNameToFieldId(attributeName) {
		return attributeName.toLowerCase()+'Number';
	}

	buildAttributeNumberInputElement(id, elementClass, value, minValue, maxValue) {
		var attributeValInput = this.doc.createElement('input');
		attributeValInput.setAttribute('class', elementClass);
		attributeValInput.setAttribute('type', 'number');
		attributeValInput.setAttribute('value', value);
		attributeValInput.setAttribute('id', id);
		attributeValInput.setAttribute('min', minValue);
		attributeValInput.setAttribute('max', maxValue);
		return attributeValInput;
	}

	buildAttributeScoreRows (statsTable, attributesJson) {
		let attributeNames = Object.keys(attributesJson);

		for (var i = 0; i < attributeNames.length; i++) {
			let attribName = attributeNames[i];
			let attribValue  = attributesJson[attribName];

			let attribId = this.attributeNameToFieldId(attribName);
			this.attribNameIdMappings.set(attribName, attribId);

			// Building left-hand value label
			var attributeRow = this.doc.createElement('tr');
			var attributeNameElem = this.doc.createElement('td');
			attributeNameElem.append(this.doc.createTextNode(attribName));
			attributeRow.append(attributeNameElem);

			// Building right-hand value input
			var attributeValElem = this.doc.createElement('td');
			let theseAttribs = this.getCharacterDetails().getAttributeScores();
			var attributeValInput = this.buildAttributeNumberInputElement(attribId, ATTRIBUTE_INPUT_CLASS, attribValue, theseAttribs.getMinimumAttributeValue(),
			theseAttribs.getMaximumAttributeValue());

			attributeValElem.append(attributeValInput);
			attributeRow.append(attributeValElem);

			statsTable.append(attributeRow);
			console.debug('Built attribute row, name: ' + attribName + ', id: ' + attribId)
		}
	}

	createStatsTable (attributeScores) {
		var statsTable = this.doc.createElement('table');
		statsTable.setAttribute('id', _STATS_TABLE_ID);

		var statsTableHeaderRow = this.doc.createElement('tr');
		var statsTableLeftHeader = this.doc.createElement('th');
		statsTableLeftHeader.append(this.doc.createTextNode('Attributes'));
		var statsTableRightHeader = this.doc.createElement('th');
		statsTableHeaderRow.append(statsTableLeftHeader);
		statsTableHeaderRow.append(statsTableRightHeader);

		statsTable.append(statsTableHeaderRow);

		let scores = attributeScores.getScoresJson();
		this.buildAttributeScoreRows(statsTable, scores);

		return statsTable;
	}

	rebuildStatsTable(attributeScores) {
		let statsForm = this.getStatsFormJquery();
		console.debug('Rebuilding character stats table using: ' + JSON.stringify(attributeScores))
		this.attribNameIdMappings.forEach((attribIdvalue, attribNameKey) => {
			this.getAttributeFieldJquery(attribIdvalue).remove();
		});
		let oldStatsTable = this.getStatsAttributeTableJquery();
		oldStatsTable.remove();
		let newStatsTable = this.createStatsTable(attributeScores);
		statsForm.append(newStatsTable);
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
	 * Ensures the latest character class options are displayed, unlikely to change but this lets them be dynamic
	 */
	updateCharacterClassOptions(charClassOptions) {
		console.trace('Updating character class options..')
		if (this.characterDetails.isCharacterClassOptionsDefined()) {
			let classSelector = this.getCharclassSelection();

			// Clear all child nodes first
			while(classSelector.hasChildNodes()) {
				classSelector.removeChild(classSelector.lastChild);
			}

			charClassOptions.forEach(classOption => {
				console.debug('New charclass option: ' + classOption.text);
				let selectorOption = this.createSelectorOption(classOption.id, classOption.text)
				classSelector.append(selectorOption);
			});
		} else {
			console.debug('No character class options to display..')
		}
	}

	updateCharacterAttributeScores(attributeScores) {
		if (attributeScores !== undefined && attributeScores !== null ) {
			this.rebuildStatsTable(attributeScores);
		} else {
			throw new RangeError('Character attribute scores were not set correctly!')
		}
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

		//	'Attributes' section
		let attribScores = this.characterDetails.getAttributeScores();
		var statsTable = this.createStatsTable(attribScores);

		let freePointsField = this.buildAttributeNumberInputElement(_FREE_POINTS_FIELD_ID, _FREE_POINTS_FIELD_ID, attribScores.getFreePoints(),
		attribScores.getMinimumAttributeValue(), attribScores.getMaximumAttributeValue());
		freePointsField.setAttribute('readonly', true);

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
		form.append(freePointsField);
		form.append(statsInfo);
		form.append(saveButton);

		return form;
	}

	showStatsWindow() {
		this.showElement(_STATS_WINDOW_ID);
	}

	hideStatsWindow() {
		this.hideElement(_STATS_WINDOW_ID);
	}

	requestCharacterDetails () {
		this.showStatsWindow();
	}

	getStatsCharacterNameJquery () {
		return jquery('#' + _CHAR_NAME_INPUT_ID, this.doc);
	}

	getStatsCharacterNameVal () {
		return this.getStatsCharacterNameJquery().val();
	}

	getFreePointsJquery () {
		return jquery('#' + _FREE_POINTS_FIELD_ID, this.doc);
	}

	getFreePointsValue () {
		return Number(this.getFreePointsJquery().val());
	}

	setFreePointsValue(val) {
		return this.getFreePointsJquery().val(val);
	}

	setStatsCharacterName (name) {
		this.getStatsCharacterNameJquery().val(name);
	}

	getCharacterClassValue () {
		return this.getCharacterClassSelectionJquery().val();
	}

	getCharacterClassText () {
		return this.getCharacterClassSelectionJquery().text();
	}

	getCharacterClassSelectionJquery() {
		return jquery('#' + _CHAR_CLASS_SELECTION_ID, this.doc);
	}

	getCharacterClassSelectorJquery () {
		return jquery('#' + _CHAR_NAME_INPUT_ID, this.doc);
	}

	getCharacterClassSelector() {
		return this.getCharacterClassSelectorJquery()[0];
	}

	setCharacterClassOption(optionId) {
		if (optionId !== undefined) {
			console.debug('Trying to set character class to: ' + optionId + ', available: ' + JSON.stringify(this.getCharacterDetails().getCharacterClassOptions()))

			let characterClassOptions = this.getCharacterDetails().getCharacterClassOptions();
			let classOption = characterClassOptions.indexOfId(optionId);

			if (classOption >= 0) {
				this.setStatsCharacterClass(classOption);
			} else {
				console.error('Could not set character class option, no existing option for ID: ' + optionId)
			}
		} else{
			console.error('Expected optionId undefined.');
		}
	}

	getCharacterClassOptionsElement() {
		return this.getCharclassSelectionJquery().find('option');
	}

	// Set the stats charClass choice to a given selection number
	// As this will be a procedurally generated option selection
	setStatsCharacterClass (selectionNo) {
		// Check the field exists by grabbing it
		this.getCharclassSelection();
		var options = this.getCharacterClassOptionsElement();
		if (options.length > 0) {
			if (selectionNo > 0 && selectionNo < options.length) {
				let options = this.getCharacterClassOptionsElement();
				var optionChoice = options[selectionNo].value;
				this.setCharclassSelection(optionChoice);
			} else {
				console.error('Invalid character class selection option: ' + selectionNo);
			}
		} else {
			console.error('Cannot set character classs selection to: '+selectionNo+'. No charclass options to choose from.')
		}
	}

	clearAll() {
		this.setStatsCharacterName('');
		this.setStatsCharacterClass(0);
		this.setAttributes(this.getCharacterDetails().getDefaultAttributeScores());
	}

	/**
	 * Gets the current stats being displayed
	 * @returns {{charclass: *, attributeScores: *, charname: *}}
	 */
	getJson () {
		return {
			'charname': this.getStatsCharacterNameVal(),
			'charclass': this.getCharacterClassValue(),
			'attributes': this.getAttributesJson()
		};
	}

	getAttributeFieldJquery(attributeId) {
		let fieldId = '#' + attributeId;
		// Get the value of the first match for our field
		return jquery(fieldId, this.doc);
	}

	/**
	 *
	 * @returns {{free_points: number, scores: {}}}
	 */
	getAttributesJson() {
		let freePoints = this.getFreePointsValue();
		let attribsJson = { [SCORES_NAME] : {},
												[FREEPOINTS_NAME] : freePoints
		};
		this.attribNameIdMappings.forEach((attribIdValue, attribNameKey, map) => {
				// Get the value of the first match for our field
				let attribValue = this.getAttributeFieldJquery(attribIdValue).val();
				if (attribValue !== undefined) {
					attribsJson[SCORES_NAME][attribNameKey] = Number(attribValue);
				} else {
					console.error('Could not find an attribute field for ID: ' + attribIdValue);
				}
			});


		let modelAttribs = this.getCharacterDetails().getAttributeScores();
		// The view currently does not define these, so we can just return whatever is in the model here
		attribsJson[MIN_VALUE_NAME] = modelAttribs.getMinimumAttributeValue();
		attribsJson[MAX_VALUE_NAME] = modelAttribs.getMaximumAttributeValue();
		return attribsJson;
	}

	setAttributeScoresFromJson(attributeScoresJson) {
		try {
			AttributeScores.validateAttributesJson(attributeScoresJson);
		} catch(validationError) {
			console.log('Cannot set displayed atftribute scores, Invalid AttributeScores: ' +  JSON.stringify(attributeScoresJson));
			return;
		}

		if (this.attribNameIdMappings.size > 0) {
			this.attribNameIdMappings.forEach((attributeName, attributeId, map) => {
				let inputVal = attributeScoresJson[attributeName];
				// Set the value of the first match for our field
				let statId = '#' + attributeId;
				jquery(statId, this.doc).val(inputVal);
			});
		} else {
			console.warn('Cannot set displayed atftribute scores. No attribute score field mappings to use.');
		}

		let freePoints = attributeScoresJson[FREEPOINTS_NAME];
		this.setFreePointsValue(freePoints);
	}

	/**
	 * Displays a series of attributes for the character details
	 * @param attrValuesJSON {{free_points: number, scores: {}}}
	 */
	setAttributesFromJson (attrValuesJSON) {
		let attribScores = attrValuesJSON[SCORES_NAME];
		let freePoints = attrValuesJSON[FREEPOINTS_NAME];
		this.setAttributeScoresFromJson(attribScores);
		this.setFreePointsValue(freePoints);
	}

	setAttributes(attributeScores) {
		this.setAttributeScoresFromJson(attributeScores.getJson());
	}

	/**
	 * Displays the values from a JSON Response, without adjusting the underlying data model
	 * @param statsValuesJson
	 */
	updateView () {
		if (DEBUG) console.debug('Displaying stats: '+JSON.stringify(this.characterDetails.getJson()));

		let charname = this.characterDetails.getCharacterName();
		console.debug('Displaying character name of: ' + charname);
		this.setStatsCharacterName(charname);

		let classOptions = this.characterDetails.getCharacterClassOptions();
		let charclass = this.characterDetails.getCharacterClass();
		this.updateCharacterClassOptions(classOptions);
		this.setCharacterClassOption(charclass);

		let attribScores = this.characterDetails.getAttributeScores();
		this.updateDisplayedAttributeScores(attribScores);

		this.emit(EVENTS.VIEW_STATS_SET);
	}

	toggleStatWinVisibility () {
		this.toggleWindow(_STATS_WINDOW_ID);
	}

	/**
	 * Constructs all HTML elements of this view and returns them
	 * @returns {HTMLElement | any | ActiveX.IXMLDOMElement}
	 */
	buildView () {
		// Build the window itself if needed
		let statsWindow = this.generateStatsWindow();
		this.generateStatsForm();

		// Ensure we're displaying whatever we can
		this.updateView();

		return statsWindow;
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

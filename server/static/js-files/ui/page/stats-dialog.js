
//2 arrays of the same length to allow looping for creating each line of the table
var attributeNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
var numberInputIds = ['strNumber', 'dexNumber', 'conNumber', 'intNumber', 'wisNumber', 'chaNumber'];
var minAttributeVal = 1;
var maxAttributeVal = 100;

function createSelectorOption(tagValue,text) {
  var classSelector = document.createElement('option');
  classSelector.setAttribute('value', tagValue);
  classSelector.append(document.createTextNode(text));

  return classSelector;
}

//Generates the attribute rows and appends them to the given table element
function createTableRows(statsTable){
  for (var i=0; i<attributeNames.length; i++) {
    var attributeRow = document.createElement('tr');
    var attributeNameElem = document.createElement('td');
    attributeNameElem.append(document.createTextNode(attributeNames[i]));

    var attributeValElem = document.createElement('td');

    var attributeValInput = document.createElement('input');
    attributeValInput.setAttribute('class','attrVal');
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

function createStatsTable(){
  var statsTable = document.createElement("table");
  statsTable.setAttribute('id', 'stat-table');

  var statsTableHeaderRow = document.createElement('tr');
  var statsTableLeftHeader = document.createElement('th');
  statsTableLeftHeader.append(document.createTextNode('Attributes'));
  var statsTableRightHeader = document.createElement('th');
  statsTableHeaderRow.append(statsTableLeftHeader);
  statsTableHeaderRow.append(statsTableRightHeader);

  statsTable.append(statsTableHeaderRow);

  createTableRows(statsTable);

  return statsTable;
}

function clearStatInfo(){
  $('#stats-info').val(''); //JQuery find the field and set it to blank
}

function addToStatInfo(message){
  var statsField = $('#stats-info');
  statsField.val(statsField.val()+message);
}

function generateStatWindow() {
  //Form div to append our elements to
  var form = document.createElement("form");

  //'Character Name' section
  var nameLabel = document.createElement("p");
  nameLabel.setAttribute('class', 'classLabel');
  nameLabel.append(document.createTextNode("Character Name"));

  var nameInput = document.createElement("input");
  nameInput.setAttribute('type', 'text');
  nameInput.setAttribute('id', 'char-name-input');
  nameInput.setAttribute('required', 'required');
  nameInput.setAttribute('pattern','[\\w]{1,12}');
  nameInput.setAttribute('Title','1-12 characters using: a-Z, 0-9, and _');

  //'Character Class' section
  var classLabel = document.createElement("p");
  classLabel.setAttribute('class', 'classLabel');
  classLabel.append(document.createTextNode("Character Class"));
  //Dropdown for class type
  var classSelector = document.createElement("select");
  classSelector.setAttribute('id', 'class-selection');
  classSelector.setAttribute('disabled', true);
  classSelector.append(createSelectorOption('fighter','Fighter'));
  classSelector.append(createSelectorOption('spellcaster','Spellcaster'));

  //'Attributes' section
  var statsTable = createStatsTable();

  //This allows displaying any needed info
  var statsInfo = document.createElement("textarea");
  statsInfo.setAttribute('id', 'stats-info');

  var saveButton = document.createElement("input");
  saveButton.setAttribute('type', 'submit');
  saveButton.setAttribute('id', 'save-stats-button');
  saveButton.setAttribute('value','Save');

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

//Brings up the stats window
function showStatWindow() {
  showWindow('statWindowId');
}

function getStatsCharacterName(){
  return $('#char-name-input').val();
}

function setStatsCharacterName(name){
  $('#char-name-input').val(name);
}

function getStatsCharacterClass(){
  return $('#class-selection').val();
}

function setStatsCharacterClass(selectionNo){
  var options = $('#class-selection').find('option');
  var optionsLen = options.length;

  if (selectionNo > 0 && selectionNo < optionsLen) {
    var optionChoice = options[selectionNo].value; //Choice id e.g 'spellcaster'
    $('#class-selection').val(optionChoice); //Set the value
  }

}

function getStatsAttributeValues(){
  var output = {};

  for (var i=0; i<numberInputIds.length; i++) {
    var statId = '#'+numberInputIds[i];
    var statValue = $(statId).val();
    output[attributeNames[i]] = statValue;
  }

  return output;
}

//Grabs Character Name, Class, and Attribute values
function getStats() {
  return { 'charname' : getStatsCharacterName(),
          'charclass' : getStatsCharacterClass(),
          'attributes' : getStatsAttributeValues()
        };
}

//Takes a JSON object of form: {'STR':1,'DEX':2,...} and sets the value fields to match
function setStatsAttributeValues(attrValuesJSON){
  for (var i=0; i<numberInputIds.length; i++) {
    var statId = '#'+numberInputIds[i];
    var inputVal = attrValuesJSON[attributeNames[i]];
    var statValue = $(statId).val(inputVal);
  }

}

function setStatsFromJsonResponse(statsValuesJson){
  console.log('Setting from: '+statsValuesJson);
  var charname = statsValuesJson['charname'];
  var charclass = statsValuesJson['charclass'];
  var pos_x = statsValuesJson['pos_x'];
  var pos_y = statsValuesJson['pos_x'];

  var attrValuesJSON = {'STR': statsValuesJson['STR'],
                        'DEX': statsValuesJson['DEX'],
                        'CON': statsValuesJson['CON'],
                        'INT': statsValuesJson['INT'],
                        'WIS': statsValuesJson['WIS'],
                        'CHA': statsValuesJson['CHA']};

  setStatsAttributeValues(attrValuesJSON);
}

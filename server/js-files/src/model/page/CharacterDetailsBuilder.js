import ValidationHandler from 'src/handler/ValidationHandler.js';

//import jquery from 'jquery'
import jquery from 'libs/jquery-3.4.1.dev.js';
import { CharacterClassOptions } from 'src/model/page/CharacterClassOptions.js'
import { ArraySet } from 'src/model/ArraySet.js'
import { AttributeScores, FREEPOINTS_NAME, SCORES_NAME } from 'src/model/page/AttributeScores.js';
import { CharacterDetails } from 'src/model/page/CharacterDetails.js';

export default class CharacterDetailsBuilder {
	constructor () {
	}

	/**
	 * For cases where we've yet to be able to define these values, we need some sane defaults
	 */
	withDefaults() {
		this.withCharacterClassOptions(new CharacterClassOptions())
		this.withAttributeScores({})
		this.withScoreBoundaries(0,0)
		this.withPosition(0,0)
		this.withHealthValue(0)
		this.withFreePoints(0)
		return this;
	}

	withCharacterName(charName) {
		this.characterName = charName;
		return this;
	}

	withCharacterClass(charClass) {
		this.charClass = charClass;
		return this;
	}

	withCharacterClassOptions(characterClassOptions) {
		this.characterClassOptions = characterClassOptions;
		return this;
	}

	withAttributeScores(attributeScores) {
		this.attributeScores = attributeScores;
		return this;
	}

	withScoreBoundaries(minScoreValue, maxScoreValue) {
		this.minScoreValue = minScoreValue;
		this.maxScoreValue = maxScoreValue;
		return this;
	}

	withPosition(posX, posY) {
		this.posX = posX;
		this.posY = posY;
		return this;
	}

	withHealthValue(health) {
		this.health = health;
		return this;
	}

	withFreePoints(freePoints) {
		this.freePoints = freePoints;
		return this;
	}

	validateAttribute(value, name) {
		if (value === undefined) {
			throw new RangeError( name + ' is required!');
		}
	}

	build() {
		this.validateAttribute(this.characterClassOptions, 'CharacterClassOptions');
		this.validateAttribute(this.attributeScores, 'Attribute Scores JSON');
		this.validateAttribute(this.minScoreValue, 'Minimum Score Value');
		this.validateAttribute(this.maxScoreValue, 'Maximum Score Value');

		this.validateAttribute(this.posX, 'Character Global Position X');
		this.validateAttribute(this.posY, 'Character Global Position Y');
		this.validateAttribute(this.health, 'Character Health');
		this.validateAttribute(this.freePoints, 'Attribute Score Free Points');


		let characterDetails = new CharacterDetails(this.characterClassOptions, this.attributeScores, this.minScoreValue, this.maxScoreValue, this.posX, this.posY, this.health, this.freePoints);

		if (this.characterName !== undefined) {
			characterDetails.setCharacterName(this.characterName);
		}

		if (this.charClass !== undefined) {
			characterDetails.setCharacterClass(this.charClass);
		}
		console.debug('Built new CharacterDetails: ' + JSON.stringify(characterDetails.getJson()))
		return characterDetails;
	}
}

export { CharacterDetailsBuilder };
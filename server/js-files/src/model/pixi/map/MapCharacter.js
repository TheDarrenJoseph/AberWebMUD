import CharacterDetails from 'src/model/page/CharacterDetails.js';

// Pixi Map Character model for Pixi Display (Pixi Representation)
export default class MapCharacter {
	constructor (characterDetails, sprite) {
		this.characterDetails = characterDetails;
		this.sprite = sprite;
	}

	getCharacterDetails() {
		return this.characterDetails;
	}

	setCharacterDetails(characterDetails) {
		this.characterDetails = characterDetails;
	}

	getSprite() {
		return this.sprite;
	}

	setSprite(sprite) {
		this.sprite = sprite;
	}

}

export { MapCharacter };

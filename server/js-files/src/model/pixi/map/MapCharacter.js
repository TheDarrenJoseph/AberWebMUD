import CharacterDetails from 'src/model/page/CharacterDetails.js';

// Pixi Map Character model for Pixi Display (Pixi Representation)
export default class MapCharacter extends CharacterDetails {
	constructor (charname, x, y, sprite) {
		super(charname, x, y);
		this.sprite = sprite;
	}

	getSprite() {
		return this.sprite;
	}

	setSprite(sprite) {
		this.sprite = sprite;
	}

}

export { MapCharacter };

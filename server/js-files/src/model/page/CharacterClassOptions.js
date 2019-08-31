import { ArraySet } from 'src/model/ArraySet.js'
import { Option } from 'src/model/page/Option.js';

export default class CharacterClassOptions extends ArraySet {
	constructor () {
		super();
	}

	indexOfId(optionId) {
		return this.findIndex(obj => { return obj.id == optionId.toLowerCase() } );
	}

	addOption(optionName) {
		let thisOption = new Option(optionName.toLowerCase(), optionName);
		this.add(thisOption);
	}

	addOptionNames(optionNames) {
		let classOptions = [];
		for (let i = 0; i < optionNames.length; i++) {
			let availOpt = optionNames[i];
			this.addOption(availOpt);
		}
		return classOptions;
	}

	static fromOptionsList(optionNames) {
		if (optionNames !== undefined && optionNames.length > 0) {
			let characterClassOptions = new CharacterClassOptions();
			characterClassOptions.addOptionNames(optionNames);
			return characterClassOptions;
		} else {
			throw new RangeError('Expected a list of option strings!');
		}
	}
}

// Allow named import also
export { CharacterClassOptions };

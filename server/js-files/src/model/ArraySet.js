import List from './List'

export default class ArraySet extends List {

	constructor() {
		super()
	}

	add(element) {
		if (!this.contains(element)) {
			this.push(element);
		} else {
			throw new RangeError('Element added! Duplicates are not permitted! : ' + element);
		}
	}

	addAll(elements) {
		for (let i=0; i<element.length; i++) {
			let element = elements[i];
			this.add(element);
		}
	}

}


export { ArraySet }
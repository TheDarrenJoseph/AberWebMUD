export default class List extends Array {
	constructor (...args) {
		super(...args);
	}

	add(element) {
		this.push(element);
	}

	get(index) {
		return this[index];
	}

	addAll(elements) {
		for (let i=0; i<element.length; i++) {
			let element = elements[i];
			this.add(element);
		}
	}

	remove(element) {
		if (this.contains(element)) {
			let index = this.indexOf(element);
			this.splice(index);
		}
	}

	contains(element) {
		return (this.indexOf(element) > -1);
	}
}

// Allow named import also
export { List };


// Wrappers a DOM Document Interface Object
// Stores any needed data for managing this
export default class Page {
	constructor (doc) {
		this.doc = doc;
	}
}

// Allow named import also
export { Page };

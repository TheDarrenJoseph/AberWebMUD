
// Wrappers a DOM Document Interface Object
// Stores any needed data for managing this
export default class Page {
	constructor (doc) {
		this.doc = doc;
		// Only perform setup once
		this.isSetup   = false;
		this.uiEnabled = false;
	}
}

// Allow named import also
export { Page };

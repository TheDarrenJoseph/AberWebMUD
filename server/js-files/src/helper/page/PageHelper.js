export default class PageHelper {

	static buildClassLabel(doc, id, text) {
		//	'Character Name' section
		let classLabel = doc.createElement('p');
		classLabel.setAttribute('class', 'classLabel');
		classLabel.setAttribute('id', id);
		let textNode = doc.createTextNode(text);
		classLabel.append(textNode);
		return classLabel;
	}

	static buildSubmitButton(doc, id, text) {
		let submitButton = doc.createElement('input');
		submitButton.setAttribute('type', 'submit');
		submitButton.setAttribute('id', id);
		submitButton.setAttribute('value', text);
		return submitButton;
	}
}

export { PageHelper };
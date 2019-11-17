//import jquery from 'jquery';
import jquery from 'libs/jquery-3.4.1.dev.js';

import { PageView } from 'src/view/page/PageView.js';
import { PageHtmlView } from 'src/view/page/PageHtmlView.js';
import { _INVENTORY_WINDOW_ID } from './PageInventoryView'

// These should be in mostly hierarchical order
export const _LOGIN_WINDOW_ID = 'login-window';
export const _LOGIN_FORM_ID = 'login-form';
export const _USERNAME_LABEL_ID = 'username-label';
export const _USERNAME_INPUT_ID = 'username-input';
export const _PWD_LABEL_ID = 'password-label';
export const _PWD_INPUT_ID = 'password-input';
export const _SUBMIT_LOGIN_ID = 'submit-login-input';

const _LOGIN_TITLE_CLASS = 'login-title';
const _LOGIN_LABEL_CLASS = 'login-label';
const _LOGIN_TEXTINPUT_CLASS = 'login-textinput';

// To enable debug logging for quick event checking
const DEBUG = false;

export const EVENTS = {
	SUBMIT_LOGIN : 'submit-login'
};

const HTML_ID_MAPPINGS = {
	[_LOGIN_WINDOW_ID] : '#' + _LOGIN_WINDOW_ID,
	[_LOGIN_FORM_ID] : '#' + _LOGIN_FORM_ID,
	[_USERNAME_LABEL_ID] : '#' + _USERNAME_LABEL_ID,
	[_USERNAME_INPUT_ID] : '#' + _USERNAME_INPUT_ID,
	[_PWD_LABEL_ID] : '#' + _PWD_LABEL_ID,
	[_PWD_INPUT_ID] : '#' + _PWD_INPUT_ID,
	[_SUBMIT_LOGIN_ID] : '#' + _SUBMIT_LOGIN_ID
};

export default class PageLoginView extends PageHtmlView {

	constructor (doc) {
		super(doc, EVENTS, HTML_ID_MAPPINGS);
	}

	getLoginWindowJquery() {
		return jquery(this.getHtmlIdMapping(_LOGIN_WINDOW_ID), this.doc);
	}

	getLoginFormJquery() {
		return jquery(this.getHtmlIdMapping(_LOGIN_FORM_ID), this.doc);
	}

	getUsernameInputJquery() {
		return jquery(this.getHtmlIdMapping(_USERNAME_INPUT_ID), this.doc);
	}

	getPasswordInputJquery() {
		return jquery(this.getHtmlIdMapping(_PWD_INPUT_ID), this.doc);
	}

	getSubmitLoginButtonJquery() {
		return jquery(this.getHtmlIdMapping(_SUBMIT_LOGIN_ID), this.doc);
	}

	/**
	 * Setup emitting of events for this view
	 */
	setupEmitting () {
		/**
		let loginElement = this.extractElementFromJquery(this.getSubmitLoginButtonJquery());
		loginElement.click(() => {
			this.emit(EVENTS.SUBMIT_LOGIN)
		});
		 **/
	}

	clearForm() {
		this.getUsernameInputJquery().val('');
		this.getPasswordInputJquery().val('');
	}

	formSubmitted() {
		this.emit(EVENTS.SUBMIT_LOGIN);
		this.clearForm();
	}

	generateSvgTitle() {
		let svgBlock = this.createElement('svg');
		let loginHeader = this.createElement('text');
		loginHeader.innerHTML = 'AberWebMUD';
		loginHeader.setAttribute('class', _LOGIN_TITLE_CLASS);

		svgBlock.appendChild(loginHeader);

		return svgBlock;
	}

	/**
	 * Simply constructs a window element
	 * @returns HTMLElement for messageWindow
	 */
	generateLoginWindow() {
		// Parent div
		let loginWindow = this.createElement('dialog', _LOGIN_WINDOW_ID);

		let loginForm = this.createElement('form', _LOGIN_FORM_ID);
		loginForm.onsubmit = () => {
			this.formSubmitted();
			// Prevent page reload with false returned
			return false;
		}

		let svgHeaderBlock = this.generateSvgTitle();

		let usernameDiv = this.createElement('div', 'username-input-group');
		let usernameLabel = this.createElement('label', _USERNAME_LABEL_ID);
		usernameLabel.setAttribute('class', _LOGIN_LABEL_CLASS)
		usernameLabel.innerHTML = 'Username';

		let usernameInput = this.createInputField(_USERNAME_INPUT_ID, 'text');
		usernameInput.setAttribute('class', _LOGIN_TEXTINPUT_CLASS)
		usernameDiv.appendChild(usernameLabel);
		usernameDiv.appendChild(usernameInput);

		let passwordDiv = this.createElement('div', 'password-input-group');
		let pwdLabel = this.createElement('label', _PWD_LABEL_ID);
		pwdLabel.setAttribute('class', _LOGIN_LABEL_CLASS)
		pwdLabel.innerHTML = 'Password'
		let pwdInput = this.createInputField(_PWD_INPUT_ID, 'password');
		pwdInput.setAttribute('class', _LOGIN_TEXTINPUT_CLASS)
		passwordDiv.appendChild(pwdLabel);
		passwordDiv.appendChild(pwdInput);

		let submitButton = this.createElement('button', _SUBMIT_LOGIN_ID);
		submitButton.setAttribute('type', 'submit');
		submitButton.innerHTML = 'Login';

		loginForm.append(usernameDiv);
		loginForm.append(passwordDiv);
		loginForm.append(submitButton);

		loginWindow.append(svgHeaderBlock)
		loginWindow.append(loginForm);

		return loginWindow;
	}

	buildView() {
		return this.generateLoginWindow();
	}

	showLoginWindow() {
		this.showElement(_LOGIN_WINDOW_ID);
	}

	hideLoginWindow() {
		this.hideElement(_LOGIN_WINDOW_ID);
	}

	getUsername() {
		return this.getUsernameInputJquery().val();
	}

	getPassword() {
		return this.getPasswordInputJquery().val();
	}
}

export { PageLoginView };
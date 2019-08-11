import jquery from 'jquery';
import { PageView } from 'src/view/page/PageView.js';
import { PageHtmlView } from 'src/view/page/PageHtmlView.js';
import { _INVENTORY_WINDOW_ID } from './PageInventoryView'

// These should be in mostly hierarchical order
export const _LOGIN_WINDOW_ID = 'login-window';
export const _LOGIN_FORM_ID = 'login-form';
export const _USERNAME_INPUT_ID = 'username-input';
export const _PWD_INPUT_ID = 'password-input';
export const _SUBMIT_LOGIN_ID = 'submit-login-input';

// To enable debug logging for quick event checking
const DEBUG = false;

export const EVENTS = {
	SUBMIT_LOGIN : 'submit-login'
};

export default class PageLoginView extends PageHtmlView {

	constructor (doc) {
		super(doc, EVENTS, { [_LOGIN_WINDOW_ID] : '#' + _LOGIN_WINDOW_ID} );
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
		let loginElement = this.extractElementFromJquery(this.getSubmitLoginButtonJquery());
		loginElement.click(() => {
			this.emit(EVENTS.SUBMIT_LOGIN)
		});
	}

	/**
	 * Simply constructs a window element
	 * @returns HTMLElement for messageWindow
	 */
	generateLoginWindow() {
		// Parent div
		let loginWindow = this.createElement('div', _LOGIN_WINDOW_ID);

		let loginForm = this.createElement('form', _LOGIN_FORM_ID);

		let usernameInput = this.createInputField(_USERNAME_INPUT_ID, 'text');
		let pwdInput = this.createInputField(_PWD_INPUT_ID, 'password');

		let submitButton = this.createElement('button', _SUBMIT_LOGIN_ID);
		submitButton.setAttribute('type', 'submit');
		submitButton.setAttribute('value', 'Login');

		loginForm.append(usernameInput);
		loginForm.append(pwdInput);
		loginForm.append(submitButton);

		loginWindow.append(loginForm);

		return loginWindow;
	}

	buildView() {
		this.generateLoginWindow();
	}

	showLoginWindow() {
		this.showElement(_LOGIN_WINDOW_ID);
	}

	hideLoginWindow() {
		this.hideElement(_LOGIN_WINDOW_ID);
	}

}
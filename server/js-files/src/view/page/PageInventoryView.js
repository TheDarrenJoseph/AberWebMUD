import jquery from 'jquery';
import { PageHtmlView } from 'src/view/page/PageHtmlView.js';
import { _STATS_WINDOW_ID } from './PageCharacterDetailsView'

export const _INVENTORY_WINDOW_ID = 'inventory-window';

export const EVENTS = {};

export default class PageInventoryView extends PageHtmlView {

	constructor (doc) {
		super(doc, EVENTS, { [_INVENTORY_WINDOW_ID] : '#' + _INVENTORY_WINDOW_ID})
	}

	showInventoryWindow() {
		this.showElement(_INVENTORY_WINDOW_ID);
	}

	hideInventoryWindow() {
		this.hideElement(_INVENTORY_WINDOW_ID);
	}


	toggleInventoryWinVisibility () {
		this.toggleWindow(_INVENTORY_WINDOW_ID);
	}
}
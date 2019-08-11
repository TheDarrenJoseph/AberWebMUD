import jquery from 'jquery';
import { PageHtmlView } from 'src/view/page/PageHtmlView.js';
import { _STATS_WINDOW_ID } from './PageCharacterDetailsView'

export const _INVENTORY_WINDOW_ID = 'inventory-window';

export const EVENTS = {};

export const DEFAULT_INVENTORY_ROWCOUNT = 5;

export default class PageInventoryView extends PageHtmlView {

	constructor (doc) {
		super(doc, EVENTS, { [_INVENTORY_WINDOW_ID] : '#' + _INVENTORY_WINDOW_ID})
	}

	generateTableHeaderRow() {
		let tableHeaderRow = this.createElement('tr');
		let nameHeader 		 = this.createElement('th');
		nameHeader.innerHTML = 'Name';
		let valueHeader 		 = this.createElement('th');
		valueHeader.innerHTML = 'Value';
		let infoHeader 		 = this.createElement('th');
		let useHeader 		 = this.createElement('th');
		let dropHeader 		 = this.createElement('th');

		tableHeaderRow.appendChild(nameHeader);
		tableHeaderRow.appendChild(valueHeader);
		tableHeaderRow.appendChild(infoHeader);
		tableHeaderRow.appendChild(useHeader);
		tableHeaderRow.appendChild(dropHeader);

		return tableHeaderRow;
	}

	createButton(buttonId, buttonText) {
		let button = this.createElement('button', buttonId);
		button.innerHTML = buttonText;
		return button;
	}

	generateInventoryWindow() {
		/** Example HTML
		 <div class='dialog' id='inventory-window'>
		 <table>
		 <thead class='tHeader'><tr>	<th>Name</th> 						<th>Value</th> 	<th></th> 		<th></th>		<th></th>  									</tr></thead>
		 <tr class="inventoryItem">	<td> Broken Sword </td>		<td> 0 </td> 		<td><button>Info</button></td> <td><button>Use/Equip</button></td> <td> <button>Drop</button> </td></tr>
		 <tr class="inventoryItem">	<td> Broken Sword </td>		<td> 0 </td> 		<td><button>Info</button></td> <td><button>Use/Equip</button></td> <td> <button>Drop</button> </td></tr>
		 </table>
		 </div>
		 **/

		let inventoryDialog = this.createElement('dialog', _INVENTORY_WINDOW_ID);
		let inventoryTable = this.createElement('table');
		let tableHeader = this.createElement('thead');
		tableHeader.setAttribute('class', 'tHeader')

		let tableHeaderRow = this.generateTableHeaderRow();
		tableHeader.appendChild(tableHeaderRow);

		for (let i=0; i<DEFAULT_INVENTORY_ROWCOUNT; i++) {
			let tableRow = this.createElement('tr');
			tableRow.setAttribute('class', 'inventoryItem');

			let nameData = this.createElement('td');
			nameData.innerHTML = 'Test Item ' + i;

			let valueData = this.createElement('td');
			nameData.innerHTML = i;

			let infoData = this.createElement('td');
			let infoButton = this.createButton('info-button-'+i, 'Info');
			infoData.appendChild(infoButton);

			let useData = this.createElement('td');
			let useButton = this.createButton('use-button-'+i, 'Use/Equip');
			useData.appendChild(useButton);

			let dropData = this.createElement('td');
			let dropButton = this.createButton('drop-button-'+i, 'Drop');
			dropData.appendChild(dropButton);

			tableRow.appendChild(nameData);
			tableRow.appendChild(valueData);
			tableRow.appendChild(infoData);
			tableRow.appendChild(useData);
			tableRow.appendChild(dropData);

			inventoryTable.appendChild(tableRow);
		}

		inventoryTable.appendChild(tableHeader);
		inventoryDialog.appendChild(inventoryTable);

		return inventoryDialog;
	}

	buildView() {
		let inventoryWindow = this.generateInventoryWindow();
		return inventoryWindow;
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
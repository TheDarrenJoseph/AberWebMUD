import { Session } from 'src/model/Session.js'

var DEBUG = true;

// Handler for Fetch API operations
export default class FetchHandler {
	constructor (baseUrl) {
		if (baseUrl !== undefined && typeof baseUrl === 'string') {
			this.baseUrl = baseUrl
		} else {
			this.baseUrl = '/'
		}
	}

	promiseResponseJson(response) {
		return new Promise( (resolve, reject) => {
			if (response.ok) {
				response.json().then(json => {
					resolve(json)
				}).catch(reason => {
					console.error(reason)
					reject(reason)
				})
			} else reject(response);
		});
	}

	getBasicAuthValue() {
		let sessionInfo = Session.ActiveSession.getSessionInfoJSON();
		let username = sessionInfo.username;
		let sessionId = sessionInfo.sessionId;
		//console.debug('Building authentication from: ' + username + ':' + sessionId);
		let appendedValue = username+':'+sessionId;
		let encodedValue = window.btoa(appendedValue);
		//console.debug('Base64 Encoded value: ' + encodedValue);
		return encodedValue;
	}

	getBasicAuthHeaderValue() {
		return 'Basic '+this.getBasicAuthValue();
	}

	promiseGetJson(url){
		return fetch(this.baseUrl + url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authentication' : this.getBasicAuthHeaderValue()
			}
		}).then(response => this.promiseResponseJson(response))
	}

	promisePostJson(url, dataObject) {
		return fetch(this.baseUrl + url, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
				'Authentication' : this.getBasicAuthHeaderValue()
			},
			body: JSON.stringify(dataObject)
		}).then(response => {
			this.promiseResponseJson(response)
		});
	}

	get(url){
		return this.promiseGetJson(url);
	}

	post(){
		return this.promisePostJson(url, dataObject)
	}

	static getInstance() {
		let docUrlParts = document.URL.split('/');
		let protocol = docUrlParts[0]+'//'
		let baseUrl = docUrlParts[2];
		console.info('new FetchHandler URL: ' + protocol + baseUrl)
		return new FetchHandler(protocol + baseUrl);
	}

}

export { FetchHandler };
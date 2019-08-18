
var DEBUG = true;

// Handler for Fetch API operations
export default class FetchHandler {
	constructor (baseUrl) {
		if (baseUrl !== undefined && typeof baseUrl === 'string') {
			console.log('New FetchHandler for: ' + baseUrl)
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

	promiseGetJson(url){
		if (DEBUG) console.debug('GET: ' + url)
		return fetch(this.baseUrl + url).then(response => this.promiseResponseJson(response))
	}

	promisePostJson(url, dataObject) {
		if (DEBUG) console.debug('POST: ' + url)

		return fetch(this.baseUrl + url, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json'
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

}

export { FetchHandler };
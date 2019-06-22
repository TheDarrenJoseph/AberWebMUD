
// Test resources are served up just like any other file
var RESOURCE_DIR = '/static/testresources/';

/**
 * Performs a Web.API.fetch
 * Validates that the server responds with a 200 and rejects the promise if anything goes wrong
 * @param relativePath the relative path (inside of the static/testresources dir, no prepending slash)
 * @returns {Promise<Web.API.Response> }
 */
export function fetchResourceFile(relativePath) {
	return new Promise( (resolve, reject) => {

		let resourcePath = RESOURCE_DIR + relativePath;

		// The Fetch API will expect us to handle error codes in our then block
		fetch(resourcePath)
		.then(serverResponse => {
			if (serverResponse.status !== 200) {
				reject('Server returned status code other than 200! : ' + serverResponse.status + ' while fetching: ' + resourcePath);
			} else {
				resolve(serverResponse);
			}

		}).catch(reason => reject('Unexpected problem during resource fetch (network, etc) : ' + reason + ' while fetching: ' + resourcePath))
	});

}

/**
 *
 * @param relativePath {Promise<JSON> }
 */
export function fetchResourceFileJSON(relativePath) {
	return new Promise( (resolve, reject) => {
		let responsePromise = fetchResourceFile(relativePath);
		responsePromise.then(serverResponse => {
			console.log('Extracting JSON..');
			serverResponse.json()
			.then(jsonData => resolve(jsonData))
			.catch(rejection => reject(rejection));
		})
		.catch(rejection => reject(rejection));
	});

}
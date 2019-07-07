import { MapModel, DEFAULT_MAP_SIZE_XY, DEFAULT_TILE_SIZE } from 'src/model/pixi/map/MapModel.js';

export default class MapModelBuilder {

	MapModelBuilder(){
		this.mapSizeXY = DEFAULT_MAP_SIZE_XY;
	}

	function build() {
		return new Promise((resolve, reject) => {
			let mapModel = new MapModel(mapSizeXY);
			let dataJsonPromise = ResourceUtils.fetchResourceFileJSON('map/map-data-response-blank.json');

			dataJsonPromise.then(data => {
				console.log('JSON data returned: ' + data);
				assert.ok(data !== undefined && data !== null, 'Check data is defined/non-null.');
				// When
				mapModel.updateFromJson(data);
				resolve(mapModel);

			}).catch(rejection => {reject(rejection)});
		});
	}
}

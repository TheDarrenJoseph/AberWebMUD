export default class ArrayHelper {
	// Creates a simple 2D array
	// initFunc - the initialisation function for each element
	static create2dArray (sizeX, sizeY, InitFunc) {
		var thisArray = Array(sizeX);
		for (var x = 0; x < sizeX; x++) {
			thisArray[x] = Array(sizeY); // 2nd array dimension per row
			if (InitFunc !== undefined) {
				for (var y = 0; y < sizeY; y++) {
					thisArray[x][y] = new InitFunc();
				}
			}
		}
		return thisArray;
	}
}

export { ArrayHelper };

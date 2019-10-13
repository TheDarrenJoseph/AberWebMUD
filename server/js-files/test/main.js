import 'test/controller/GameControllerTests.js'
import 'test/controller/MapControllerTests.js'
import 'test/controller/SessionTests.js'
import 'test/controller/ViewControllerTests.js'
import 'test/helper/ArrayHelperTests.js'
import 'test/helper/AtlasHelperTests.js'
import 'test/helper/EventMappingTests.js'
import 'test/helper/MapPositionHelperTests.js'
import 'test/helper/SpriteHelperTests.js'
import 'test/handler/ValidationHandlerTests.js'
import 'test/model/AttributeScoresTests.js'
import 'test/model/ListTests.js'
import 'test/model/MapModelTests.js'
import 'test/controller/page/PageControllerTests.js'
import 'test/controller/pixi/PixiControllerTests.js'
import 'test/model/page/CharacterClassOptionsTests.js'
import 'test/model/page/CharacterDetailsBuilderTests.js'
import 'test/model/page/CharacterDetailsTests.js'
import 'test/view/page/PageCharacterDetailsViewTests.js'
import 'test/view/page/PageChatViewTests.js'
import 'test/view/pixi/PixiMapViewTests.js'
import 'test/view/pixi/PixiViewTests.js'
QUnit.testStart( function(testDetails) {
	console.info('=== ' + testDetails.module + ' ' + testDetails.name + '===');
});
QUnit.testDone( function(testDetails) {
	console.info('==============================');
});
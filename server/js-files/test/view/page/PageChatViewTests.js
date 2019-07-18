import { jQueryUtils } from 'test/utils/jQueryUtils.js';
import { Page } from 'src/model/page/Page.js';
import { PageView } from 'src/view/page/PageView.js';
import PageChatView from 'src/view/page/PageChatView.js';

var TEST_TAG = '|PAGE CHAT VIEW|';
var TEST_DOCUMENT = document;

var pageModel = null;
var pageView = null;
var pageChatView = null;

// Setup / assertions before any test runs
function beforeAll (assert) {
}

// Setup / assertions before each test
function beforeEachTest (assert) {
	pageModel = new Page(TEST_DOCUMENT);
	pageView = new PageView(pageModel);


	pageChatView = new PageChatView(pageView);
}

function afterEachTest (assert) {
	// Kill everything to prevent DOM changes propagating
	pageView.destroyView();
	assert.equal(null, pageView.getMainWindow(), 'Ensure PageView Main Window is destroyed.');
}

// Hookup before each test setup / assertion
QUnit.module('PageChatViewTests', { before: beforeAll, beforeEach: beforeEachTest, afterEach: afterEachTest });

/**
 * GIVEN that I have already created an instance of the PageView class
 * WHEN I call the constructor for PageChatView
 * THEN I expect a new instance of the PageChatView to be constructed
 */
QUnit.test(TEST_TAG + 'new_PageChatView', function (assert) {
	assert.ok(pageChatView instanceof PageChatView, 'Ensure PageChatView is constructed');
	assert.equal(pageChatView.pageView, pageView, 'Check the PageView is stored on the PageChatView');
	assert.equal(pageChatView.doc, pageView.pageModel.doc, 'Check the PageView PageModel HTML document is stored on the PageChatView');
});

/**
 * GIVEN that I have already created an instance of the PageView class and built it's view elements
 * AND PageChatView has just been created
 * WHEN I call buildView on the PageChatView
 * THEN I expect the view components to be constructed
 */
QUnit.test(TEST_TAG + 'buildView', function (assert) {
	assert.ok(pageChatView instanceof PageChatView, 'Ensure PageChatView is constructed');
	assert.equal(pageChatView.pageView, pageView, 'Check the PageView is stored on the PageChatView');
	assert.equal(pageChatView.doc, pageView.pageModel.doc, 'Check the PageView PageModel HTML document is stored on the PageChatView');

	// GIVEN
	// assert view components are not setup
	pageView.buildView();

	// WHEN
	pageChatView.buildView();

	// THEN
	// assert view components are created
	// check message window is set for text input
});

/**
 * GIVEN that the PageChatView has been constructed
 * WHEN
 */
QUnit.test(TEST_TAG + 'login', function (assert) {
	assert.ok(pageChatView instanceof PageChatView, 'Ensure PageChatView is constructed');
	assert.equal(pageChatView.pageView, pageView, 'Check the PageView is stored on the PageChatView');
	assert.equal(pageChatView.doc, pageView.pageModel.doc, 'Check the PageView PageModel HTML document is stored on the PageChatView');

	// assert view components are not setup
	pageView.buildView();


	pageChatView.buildView();

	// THEN
	// assert view components are created
	// check message window is set for text input
});



/**
 * GIVEN I am creating a new instance of PageChatView
 * WHEN I call the constructor for PageChatView without arguments
 * THEN I expect a RangeError to be thrown
 */
QUnit.test(TEST_TAG + 'new_PageChatView_noPageView', function (assert) {
		assert.throws(() => { new PageChatView() },
		new RangeError('pageView expected'),
		'Check a RangeError for a missing pageView is thrown')
});


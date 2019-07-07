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


// Hookup before each test setup / assertion
QUnit.module('PageChatViewTests', { before: beforeAll, beforeEach: beforeEachTest });

/**
 * GIVEN that I have already created an instance of the PageView class
 * WHEN I call the constructor for PageChatView
 * THEN I expect a new instance of the PageChatView to be constructed
 */
QUnit.test(TEST_TAG + 'new  PageChatView', function (assert) {
	assert.ok(pageChatView instanceof PageChatView, 'Ensure PageChatView is constructed');
	assert.equal(pageChatView.pageView, pageView, 'Check the PageView is stored on the PageChatView');
	assert.equal(pageChatView.doc, pageView.pageModel.doc, 'Check the PageView PageModel HTML document is stored on the PageChatView');
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


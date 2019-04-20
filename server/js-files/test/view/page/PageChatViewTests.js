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

QUnit.test(TEST_TAG + 'bindMessageButton', function (assert) {
	var callbackDone = assert.async(1);

	function testCallback() {
		callbackDone();
	}

	pageChatView.bindMessageButton(testCallback);
	var messageInputEvents = jQueryUtils.getEventsForElement(pageChatView.getMessageInputField());
	assert.equal(messageInputEvents['keyup'][0].handler, testCallback, 'Check key-up on message button is bound.');
});


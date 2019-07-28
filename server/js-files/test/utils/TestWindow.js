export function buildTestWindow (testTagName) {
	let TEST_WINDOW = window.open('', testTagName, "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes")
	return TEST_WINDOW;
}
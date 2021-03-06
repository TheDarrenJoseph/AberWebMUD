//  Runs the position function passed with x and y params
//  context should the the context of func (it's owning instance or this)
//  catches any error and checks the error message starts with the expected error message
export async function testPositionRangeError (assert, func, context, x, y, messageStartsWith) {
	var passed = false;
	var message = 'Checking position ' + x + ',' + y + ' throws an error.';
	try {
		let ret = func.call(context, x, y);
		
		// If we're passed an async func, await it.
		if (ret instanceof Promise) await ret;

	} catch (err) {
		assert.ok(err instanceof RangeError, 'Checking error: (' + err + ') is a RangeError');
		passed = err instanceof RangeError && err.message.startsWith(messageStartsWith);
		message = 'Checking position ' + x + ',' + y + '\n throws error message starting with: \'' + messageStartsWith + '\'\n Original Error message: \'' + err.message + '\'';
	}
	
	// Ensure our catch assertion was performed, passing the message if a failed
	assert.ok(passed, message);
}

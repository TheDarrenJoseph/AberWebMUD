//Checks for the presence of data for each of the movement update fields
function isValidMovementUpdateData(updateJSON) {
  var username = updateJSON['username'];
  var oldX = updateJSON['old_x'];
  var oldY = updateJSON['old_y'];
  var pos_x = updateJSON['pos_x'];
  var pos_y = updateJSON['pos_y'];

  if (username != null &&
      username != undefined  &&
      oldX != null &&
      oldX != undefined  &&
      oldY != null &&
      oldY != undefined &&
      pos_x != null &&
      pos_x != undefined &&
      pos_y!= null &&
      pos_y != undefined) {
    return true;
  } else {
    return false;
  }
}

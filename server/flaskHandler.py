from flask import Flask, request, render_template, session, abort
from pyfiles import sessionHandler, playerController
from pyfiles.db import attributes
from pyfiles.model import characterClass
import logging
import base64

#Create the app with our module name
_APP = Flask(__name__)


@_APP.route("/test", methods=['GET'])
def test():
    """ Returns the main HTML page
    for the application at the flask root url
    """
    return render_template('test.html')


@_APP.route("/", methods=['GET'])
def main():
    """ Returns the main HTML page
    for the application at the flask root url
    """
    return render_template('play.html')

def extract_authentication_header(request):
    if 'Authentication' in request.headers:
        auth_header = request.headers.get('Authentication')
        logging.info('Received authentication header: ' + str(auth_header))
        value = str(base64.b64decode(auth_header))
        logging.info('Decoded auth: ' + str(value))
        splitvalues = value.split(':')
        username = splitvalues[0]
        sessionId = splitvalues[1]
        return [username, sessionId]
    return []


def check_authentication(request):
    if len(extract_authentication_header(request)) > 0
        return True
    return False

@_APP.route("/attributes-score-options", methods=['GET'])
def get_attributes_score_options():
    if check_authentication(request):
        return attributes.Attributes.get_json_attribute_score_options()
    else:
        abort(401)

@_APP.route("/attributes-class-options", methods=['GET'])
def get_attributes_class_options():
    if check_authentication(request):
        return characterClass.CharacterClass.get_json_options()
    else:
        abort(401)

@_APP.route("/player", methods=['GET'])
def get_attributes_class_options():
    if check_authentication(request):
        header_values = extract_authentication_header(request)
        sid = header_values[1]
        logging.info('Looking up  active username for SID: ' + sid)
        username = sessionHandler.get_active_username(sid)
        active_player = playerController.find_player(username)
        player_json = active_player.get_json()
        return player_json
    else:
        abort(401)
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

        if (auth_header.startswith('Basic ')):
            basic_auth_value = auth_header.split('Basic ')[1]
            value = str(base64.b64decode(basic_auth_value).decode('utf-8'))
            logging.info('Decoded auth: ' + str(value))
            splitvalues = value.split(':')
            username = splitvalues[0]
            sessionId = splitvalues[1]
        else:
            raise ValueError('Can only parse Basic Authentication headers! Received: ' + auth_header)
        return [username, sessionId]
    return []


def check_authentication(req):
    if len(extract_authentication_header(req)) > 0:
        return True
    return False


def get_active_username(req):
    header_values = extract_authentication_header(req)
    sid = header_values[1]
    logging.info('Looking up  active username for SID: ' + sid)
    username = sessionHandler.get_active_username(sid)
    return username


@_APP.route("/attributes", methods=['GET'])
def get_attributes():
    if check_authentication(request):
        username = get_active_username(request)
        attributes = playerController.get_character_attributes(username)
        if attributes is not None:
            attributes_json = attributes.get_json()
            logging.debug('GET /attributes - RESPONSE\n' + str(attributes_json))
            return attributes_json
        else:
            logging.error('Could not retrieve attributes for the username: ' + username)
            abort(500)
    else:
        abort(401)


@_APP.route("/character-class-options", methods=['GET'])
def get_attributes_class_options():
    if check_authentication(request):
        class_options = characterClass.CharacterClass.get_json_options()

        if class_options is not None:
            logging.debug('GET /character-class-options - RESPONSE\n' + str(class_options))
            return class_options
        else:
            logging.error('Could not acquire character class options!')
            abort(500)
    else:
        abort(401)


@_APP.route("/player", methods=['GET'])
def get_player_details():
    if check_authentication(request):
        username = get_active_username(request)
        player_json = playerController.get_json(username)
        if player_json is not None:
            logging.debug('GET /player - RESPONSE\n' + str(player_json))
            return player_json
        else:
            logging.error('Could not retrieve player with username: ' + username)
            abort(500)
    else:
        abort(401)
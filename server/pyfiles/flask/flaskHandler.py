from flask import Flask, request, render_template, session, abort, make_response
from pyfiles import sessionHandler, playerController
from pyfiles.db import attributes
from pyfiles.model import characterClass
import logging
import base64

TEMPLATE_FOLDER = '../../templates'
STATIC_FOLDER = '../../static'


class FlaskHandler:

    def __init__(self, game_controller):
        self._APP = Flask(__name__, static_folder=STATIC_FOLDER, template_folder=TEMPLATE_FOLDER)
        self.game_controller = game_controller

    def register_endpoints(self):
        self._APP.add_url_rule('/', '/', self.main, methods=['GET'])
        self._APP.add_url_rule('/test', 'test', self.test, methods=['GET'])
        self._APP.add_url_rule('/attributes', 'attributes', self.get_attributes, methods=['GET'])
        self._APP.add_url_rule('/character-class-options', 'character-class-options', self.get_attributes_class_options, methods=['GET'])
        self._APP.add_url_rule('/player', 'player', self.get_player_details, methods=['GET'])

    @staticmethod
    def extract_authentication_header(req):
        if 'Authentication' in req.headers:
            auth_header = req.headers.get('Authentication')
            logging.info('Received authentication header: ' + str(auth_header))

            if auth_header.startswith('Basic '):
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

    @staticmethod
    def check_authentication(req):
        if len(FlaskHandler.extract_authentication_header(req)) > 0:
            return True
        return False

    @staticmethod
    def get_active_username(req):
        header_values = FlaskHandler.extract_authentication_header(req)
        sid = header_values[1]
        logging.info('Looking up  active username for SID: ' + sid)
        username = sessionHandler.get_active_username(sid)
        return username

    @staticmethod
    def get_sid(req):
        header_values = FlaskHandler.extract_authentication_header(req)
        sid = header_values[1]
        if sid is None:
            raise ValueError('Header Values does not contain SID as arg 1 : ' + header_values)
        return sid

    def get_flask_app(self):
        return self._APP

    def test(self):
        """ Returns the main HTML page
        for the application at the flask root url
        """
        return render_template('test.html')

    def main(self):
        """ Returns the main HTML page
        for the application at the flask root url
        """
        return render_template('play.html')

    def get_attributes(self):
        if FlaskHandler.check_authentication(request):
            username = FlaskHandler.get_active_username(request)
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

    def get_attributes_class_options(self):
        if FlaskHandler.check_authentication(request):
            class_options = self.game_controller.get_attributes_class_options()
            if class_options is not None:
                logging.debug('GET /character-class-options - RESPONSE\n' + str(class_options))
                return class_options
            else:
                abort(500)
        else:
            abort(401)

    def get_player_details(self):
        if FlaskHandler.check_authentication(request):
            username = FlaskHandler.get_active_username(request)
            try:
                sid = self.get_sid(request)
                player_json = self.game_controller.validate_and_get_player_json(username)
                if player_json is not None:
                    logging.debug('GET /player - RESPONSE\n' + str(player_json))
                    return player_json
                else:
                    abort(500)
            except ValueError as validation_err:
                response = make_response(validation_err, 500)
                return response
        else:
            abort(401)
"""
    This is the central controller that ties our messaging layers (Flask, SocketIO) into the game layer (controllers)
"""
import logging

from pony.orm import db_session
from pyfiles.sockets import socketHandler
from pyfiles.flask import flaskHandler

from pyfiles import playerController
from pyfiles.playerController import NO_PLAYER_FOUND

from pyfiles.db.character import CHARACTER_VALIDATION_ERROR
from pyfiles.model import characterClass

class GameController:

    def __init__(self):
        self.flask_handler = flaskHandler.FlaskHandler(self)
        flask_app = self.flask_handler.get_flask_app()
        self.flask_socketio_server = socketHandler.SocketHandler(flask_app, self, logger=False, engineio_logger=False)

    """
        Registers all network based callback functions (HTTP Endpoints, SocketIO events)
    """
    def register_callbacks(self):
        logging.info('Registering SocketIO event callbacks..')
        self.flask_socketio_server.register_callbacks()
        logging.info('Registering Flask endpoints..')
        self.flask_handler.register_endpoints()

    def run_server(self):
        self.flask_socketio_server.run_server()

    @staticmethod
    def get_attributes_class_options():
        class_options = characterClass.CharacterClass.get_json_options()
        if class_options is None:
            logging.error('Could not acquire character class options!')
        return class_options

    """
    GIVEN A Player has logged in
    WHEN They request their Player details
    AND Character details are invalid (not set?)
    THEN a ValueError is thrown to indicate this
    OTHERWISE the data, or None is returned as normal
    """
    @db_session
    def validate_and_get_player_json(self, username: str) -> dict or None:
        try:
            json = playerController.validate_and_get_json(username)
            if json is None:
                logging.error('Could not retrieve player with username: ' + username)
            return json
        except ValueError as error:
            if error == CHARACTER_VALIDATION_ERROR:
                logging.info('Player data is invalid, not returning: ' + str(error))
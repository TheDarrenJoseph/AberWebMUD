""" Manages a socketIO connection to clients, and associated WebSocket events"""

import threading
import jsonpickle
import logging
import json
from flask import request
from flask_socketio import SocketIO, emit, join_room, leave_room
from pyfiles import playerController, characterController, userInput
from pyfiles.model import overworld
from pyfiles.sockets import sessionHandler
from pyfiles.db import database

class SocketHandler:

    """
    Socket 'connect' event handler
    emits a welcome message to the client
    also sets a 5min timeout to disconnect the session
    """
    def handle_connect(self) -> None:
        logging.info('IN| New connection with request SID: ' + request.sid)
        sessionHandler.add_connected_session(request.sid)

        logging.debug('OUT| connection-response to: '+request.sid)
        emit('connection-response', {'chat-data': 'Welcome to AberWebMUD! Please create a character or login by typing \'user [username]\' ', 'sessionId': request.sid}, room=request.sid)
        #emit('status-response',statusResponse)
        sessionHandler.list_sessions()
        client_rooms = self.socketHandler.server.rooms(sid=request.sid);
        logging.info('Client rooms for ' + request.sid + ': ' + json.dumps(client_rooms))

        for joined_room in client_rooms:
            self.handle_join({'room': joined_room})

        #5 minute (300 sec) session clearing timer
        connection_timeout = threading.Timer(300, lambda: sessionHandler.remove_connected_session(request.sid))

    def handle_disconnect(self) -> None:
        logging.info('Client disconnected, request SID: ' + request.sid)
        removed_connected_session = sessionHandler.remove_connected_session(request.sid)
        removed_active_session = sessionHandler.remove_active_session(request.sid)
        if removed_connected_session is True:
            print('Connected session removed: '+request.sid)
        if removed_active_session is True:
            print('Active session removed: '+request.sid)
        print('A session disconnected: '+request.sid)

    def handle_join(self, data):
        joined_room = data['room']
        logging.info('Client with request SID: ' + request.sid + ' joined room: ' + joined_room + ' joining..')
        join_room(joined_room)

    def handle_leave(self, data):
        left_room = data['room']
        logging.info('Client with request SID: ' + request.sid + ' left room: ' + left_room + ' joining..')
        leave_room(left_room)

    """
        Checks for a valid (active) session ID and proxies to the right event handler if true
        callback - the function to pass to if there's an active session
        data     - The data from SocketIO
    """
    def verify_active_and_call(self, callback, data):

        if data is not None:
            if sessionHandler.contains_session_json(data):
                session_json = data['sessionJson']
                sid = session_json['sessionId']
                if sessionHandler.active_session_exists(sid):
                    logging.info('Proxying event for request SID: '+sid)
                    callback(data)
                else:
                    logging.error('Checking for active session before proxying to: ' + callback.__name__ +
                                  '.. Could not find an active session for SID: ' + sid);
            else:
                logging.error('Checking for active session before proxying to: ' + callback.__name__ +
                              '.. sessionJson not provided!');
        else:
            logging.info('No data for proxy call to: ' + callback.__name__ + ' SocketIO Event: ' + json.dumps(request.event))

    def hookup_callbacks(self):
        self.socketHandler.on_event('connect', self.handle_connect)
        self.socketHandler.on_event('disconnect', self.handle_disconnect)
        self.socketHandler.on_event('join', self.handle_join)
        self.socketHandler.on_event('leave', self.handle_leave)

        # Messages can be received at any point, so no active session check
        self.socketHandler.on_event('new-chat-message', lambda data: self.handle_message(data))

        # pass authentication directly to our handler
        self.socketHandler.on_event('client-auth', lambda data: self.authenticate_user(data))

        self.socketHandler.on_event('map-data-request', lambda: self.verify_active_and_call(self.send_map_data, request.get_json()))
        self.socketHandler.on_event('movement-command', lambda json: self.verify_active_and_call(self.handle_movement, json))

        #socket_server.on_event('request-character-details', send_char_details)
        self.socketHandler.on_event('character-details', lambda json :self.verify_active_and_call(self.handle_char_details, json))

    def send_server_message(self, message : dict or str, toAll : bool) -> None:
        """ Builds an ad-hoc sessionJson for the server and passes on the message data """
        messageData = {'chat-data': message, 'sessionJson': {'username':'server'}}
        self.send_message(messageData, toAll)

    def send_message(self, messageData : dict, toAll : bool) -> None:
        #"""Broadcasts a chat-message-response to all connected users """
        logging.debug('OUT| chat message RESPONSE to all')
        emit('chat-message-response', messageData, broadcast=toAll)

    """ Sends a login failure event, specifying whether or not that player exists """
    def send_login_failure(self, session_id : str, found_player : bool) -> None:
        logging.debug('OUT| login failure: '+str(request.sid))
        emit('login-failure', {'playerExists' : found_player}, room=session_id)

    def send_login_success(self, session_id : str, status_response : bool) -> None:
        """ Emits a login-success event to the client
            sends the current sessionId and a player-status data object
        """
        logging.debug('OUT| login success: '+str(status_response))
        emit('login-success', {'sessionId':session_id, 'player-status':status_response}, room=session_id)
        sessionHandler.list_sessions() #List sessions for debug/info

    def send_help_message(self) -> None:
        message = "Currently supported chat commands are:\n"

        command_list = userInput.get_command_list()
        for command in command_list:
            message += command + '\n'

        self.send_server_message(message, False) #Send a response back to the one client
        logging.info(message)

    """ 
        Socket 'map-data-request' event handler
    """
    def send_map_data(self) -> None:
        session_id = request.sid

        theOverworld = overworld.getOverworld()

        if len(theOverworld.map_tiles) > 0:
            logging.debug('OUT| map-response')

            emit('map-data-response', {'map-size-x': theOverworld.map_size_x,
                                       'map-size-y': theOverworld.map_size_y,
                                       'data': jsonpickle.encode(theOverworld.map_tiles)
                                      },
                 room=session_id
                )

    def parse_login(self, session_id : str, username : str) -> None:
        #user inputted username from client message
        user_and_account = self.valid_player_session(username, session_id) # (userExists, logged_in)

        #Exists but not logged in
        if user_and_account[0] is True and user_and_account[1] is False:
            #Send the password request for existing user
            logging.debug('OUT| request-password for: '+username)
            emit('request-password', username)

        #Exists and logged in
        if all(user_and_account):
            logging.info('User '+username+' already logged in..')

        #User does not exist
        if not user_and_account[0]:
            #Send the password creation request for a new account
            logging.debug('OUT| request-new-password for: '+username)
            emit('request-new-password', username,  room=session_id)

    def handle_message(self, data: dict) -> None:
        logging.info('IN| player message: '+str(data))

        #Store locally and Remove the sessionId so we don't rebroadcast it to anyone
        if 'sessionJson' in data and 'sessionId' in data['sessionJson'] :
            sid = data['sessionJson']['sessionId']
            del data['sessionJson']['sessionId']
        else:
            logging.info('Message missing sessionJson / sessionId! : ' + str(data))
            return False

        #Check the message for commands and choice
        message_details = userInput.check_message_params(data)

        #True if the the message was properly formatted, #1st tuple in nested tuple
        if message_details[1][0] is True:
            input_params = message_details[1][1] #2nd tuple in nested tuple
            user_choice = message_details[0]

            #Login choice
            if user_choice == 1:
                username = input_params['chat-data']['username'] #Username is here for a login
                self.parse_login(sid, username)

            #Message choice
            elif user_choice == 2:
                #user inputted username from client message
                username = data['sessionJson']['username'] #Username from sessionJSON otherwise
                found_player = playerController.find_player(username)

                if found_player is not None:
                    logging.info('OUT| MESSAGE: '+str(data)+' Actual: '+str(input_params['chat-data']))
                    self.send_message(input_params, True) #Rebroadcast the message {data,sessionJson}
                else:
                    #Send an eror message back to the user
                    self.send_server_message('User must be logged in to message', False)
            #Help command choice
            elif user_choice == 3:
                #Send back a list of commands if this session is authenticated/active
                if sessionHandler.active_session_exists(sid):
                    self.send_help_message()
        else:
            logging.info('Failed to parse message: ' + str(data))
            return  False

    """ Checks that a player with username exists and has a valid active session (logged in)
    returns (bool, bool) meaning (found_player,valid_session_exists)
    or that the check otherwise failed (bad data)
    """
    def valid_player_session(self, username : str, session_id : str) -> (bool, bool):
        #import pdb; pdb.set_trace()

        # Empty String check
        if username and session_id:
                found_player = playerController.find_player(username)

                if found_player is not None:
                    if sessionHandler.check_active_session(session_id, username):
                        return (True, True)
                    return (True, False)
                return (False, False)
        else:
            return (False, False)

    def handle_movement(self, message: dict) -> None:
        """ Handles a player movement command message send over SocketsIO """
        #If the movment returns True, all is good and we can send back a movement response
        #move_player also checks if the username exists for us
        logging.debug('IN| MOVEMENT MESSAGE: '+str(message))

        move_x = message['moveX']
        move_y = message['moveY']
        session_json = message['sessionJson']
        username = session_json['username']
        session_id = session_json['sessionId']

        found_player = playerController.find_player(username)
        valid = self.valid_player_session(username, session_id)

        if all(valid):
            player_pos = playerController.get_player_pos(username)

            if player_pos is not None:
                old_x = player_pos[0]
                old_y = player_pos[1]
                movement_success = False
                logging.info('Character move made from location'+str(old_x)+' '+str(old_y))

                if playerController.move_player(username, move_x, move_y) is True:
                    movement_success = True
                    new_pos = playerController.get_player_pos(username)

                    #Update every client to the new movement
                    logging.debug('OUT| movement UPDATE')
                    emit('movement-update', {
                        'username':username,
                        'old_x':old_x,
                        'old_y':old_y,
                        'pos_x':new_pos[0],
                        'pos_y':new_pos[1]
                    }, broadcast=True)

                    logging.info('movement success for'+found_player.username)
                    logging.info(str(old_x)+str(old_y)+" "+str(new_pos[0])+str(new_pos[1]))
                logging.debug('OUT| movement RESPONSE, success: '+str(movement_success))
                emit('movement-response', {'success':movement_success}, broadcast=False)
        if valid[0] and not valid[1]:
            logging.info('Valid user not in activeSessions, requesting password')
            emit('request-password', username, room=session_id) #Client has a valid user, but not logged in

    def handle_char_details(self, message: dict) -> None:
        """ Receives character data from the client, validates it, and updates the DB """
        logging.info('CHAR DETAILS: '+str(message))

        if 'sessionJson' in message and 'username' in message['sessionJson']:
            sessionData = [message['sessionJson']['username'], request.sid]
            if all(self.valid_player_session(sessionData[0], sessionData[1])):
                UPDATE_SUCCESS = False
                character_data = {}

                #Check the details and emit a response based on that
                if userInput.validate_character_update(message):
                    logging.info('Updating char details: '+str(message))
                    UPDATE_SUCCESS = characterController.update_character_details(message)
                    logging.info('CHARACTER UPDATE SUCCESS: '+str(UPDATE_SUCCESS))

                    username = message['sessionJson']['username']

                    character_data = playerController.get_character_json(username)


                else:
                    logging.info('Invalid character update data')

                logging.info('OUT| character-details-update '+str(character_data))
                emit('character-details-update', {'success': UPDATE_SUCCESS, 'char-data': character_data}, room=request.sid)
            else:
                logging.info('IN| (CHAR-STATS) stats save attempted for invalid session. SID: ' + str(request.sid))
        else:
            logging.info('IN| Malformed protocol message for char details')

    def login_user(self, sid : str, username : str) -> None:
        logging.info('Logging in.. '+sid)
        sessionHandler.add_active_session(sid, username)

        #thisPlayer = jsonpickle.encode(playerController.find_player(username))
        status_response = playerController.get_player_status(username)
        if status_response is not None:
            logging.info('Player status response: '+str(status_response))
            self.send_login_success(sid, status_response)

    """ Authenticates/logs in a user through username and password 
        Uses decoration for @socketio.on so we can directly invoke this instead of checking session validity
    """
    def authenticate_user(self, jsonData) -> None:

        # validation
        if 'data' not in jsonData:
            logging.error('No data attribute in the provided authentication message!')
            return

        data = jsonData['data']

        if 'username' not in data or 'password' not in data:
            logging.error('Failed to find expected parameters, username or password in dta: ' + json.dumps(data))
            return

        requested_sid = request.sid
        logging.info('Authentication requested by request SID: ' + requested_sid)
        username = data['username']
        password = data['password']

        # Check for pre-existing session
        if sessionHandler.active_session_exists(requested_sid):
            logging.info('Session Exists!')
        else:
            #Calling the static method to check player details
            auth_result = database.DatabaseHandler.check_player_password(username, password)
            found_player = auth_result[0]
            password_correct = auth_result[1]

            #First tuple val is player found, 2nd is password
            if all(auth_result):
                self.login_user(requested_sid, username)

            if found_player and (not password_correct):
                logging.info('Password incorrect: ' + username)
                self.send_login_failure(requested_sid, found_player)

            #User does not exist, password invalid (no account, make one)
            if not all(auth_result):
                #Create a new Player
                logging.info('Creating a new player! ' + str(username) + str(password))
                if playerController.new_player(username, password) is not None:
                    self.login_user(requested_sid, username)

    def __init__(self, _APP, **kwargs) -> SocketIO:
        self.flaskApp = _APP
        logging.info('Creating new SocketIO handler.. ')
        self.socketHandler = SocketIO(_APP, **kwargs)
        logging.info('Setting up SocketIO event callbacks..')
        self.hookup_callbacks()
        logging.info('Running SocketIO/Flask Application..')
        self.socketHandler.run(_APP)
        return None

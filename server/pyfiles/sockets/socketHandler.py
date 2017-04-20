""" Manages a socketIO connection to clients, and associated WebSocket events"""

import threading
import jsonpickle
import logging
from flask import request
from flask_socketio import SocketIO, emit
from pyfiles import playerController, characterController, userInput
from pyfiles.model import overworld
from pyfiles.sockets import sessionHandler
from pyfiles.db import database

def hookup_callbacks(socket_server : SocketIO):
    socket_server.on_event('new-chat-message', handle_message)
    socket_server.on_event('map-data-request', send_map_data)
    socket_server.on_event('movement-command', handle_movement)
    socket_server.on_event('client-auth', authenticate_user)

    #socket_server.on_event('request-character-details', send_char_details)
    socket_server.on_event('character-details', handle_char_details)

    socket_server.on_event('connect', send_welcome)
    socket_server.on_event('disconnect', handle_disconnect)

def send_server_message(message : dict or str, toAll : bool) -> None:
    """ Builds an ad-hoc sessionJson for the server and passes on the message data """
    messageData = {'data': message, 'sessionJson': {'username':'server'}}
    send_message(messageData, toAll)

def send_message(messageData : dict, toAll : bool) -> None:
    #"""Broadcasts a chat-message-response to all connected users """
    logging.debug('OUT| chat message RESPONSE to all')
    emit('chat-message-response', messageData, broadcast=toAll)

def send_login_failure(found_player : bool) -> None:
    """ Sends a login failure event, specifying whether or not that player exists """
    logging.debug('OUT| login failure: '+str(request.sid))
    login_status = {'playerExists' : found_player}
    emit('login-failure', login_status)

def send_login_success(session_id : str, status_response : bool) -> None:
    """ Emits a login-success event to the client
        sends the current sessionId and a player-status data object
    """
    logging.debug('OUT| login success: '+str(status_response))
    emit('login-success', {'sessionId':session_id, 'player-status':status_response})
    sessionHandler.list_sessions() #List sessions for debug/info

def send_welcome() -> None:
    """ emits a welcome message to the client
        also sets a 5min timeout to disconnect the session
    """
    logging.debug('OUT| Welcome message to: '+request.sid)
    sessionHandler.add_connected_session(request.sid)

    emit('connection-response', {'data': 'Welcome! Please create a character or login by typing \'user [username] [charactername]\' ', 'sessionId':request.sid})
    #emit('status-response',statusResponse)
    sessionHandler.list_sessions()

    #5 minute (300 sec) session clearing timer
    connection_timeout = threading.Timer(300, sessionHandler.remove_connected_session(request.sid))


def send_map_data() -> None:
    if len(overworld.map_tiles) > 0:
        logging.debug('OUT| map-response')

        emit('map-data-response', {'map-size-x': overworld.map_size_x,
                                   'map-size-y': overworld.map_size_y,
                                   'data': jsonpickle.encode(overworld.map_tiles)
                                  }
            )

def parse_login(sid : str, username : str) -> None:
    #user inputted username from client message
    user_and_account = valid_player_session(username, sid) # (userExists, logged_in)

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
        emit('request-new-password', username)

def handle_message(message: dict) -> None:
    logging.info('IN| player message: '+str(message))

    sid = request.sid

    #Remove the sessionId so we don't rebroadcast it to anyone
    if 'sessionJson' in message and 'sessionId' in message['sessionJson'] :
        del message['sessionJson']['sessionId']

    #Check the message for commands and choice
    message_details = userInput.check_message_params(message)

    #True if the the message was properly formatted, #1st tuple in nested tuple
    if message_details[1][0] is True:
        input_params = message_details[1][1] #2nd tuple in nested tuple
        user_choice = message_details[0]
        user_data = input_params['chat-data']
        logging.info(user_data)

        #Login choice
        if user_choice == 1:
            username = input_params['chat-data']['username'] #Username is here for a login
            parse_login(sid, username)

        #Message choice
        elif user_choice == 2:
            #user inputted username from client message
            username = message['sessionJson']['username'] #Username from sessionJSON otherwise
            found_player = playerController.find_player(username)

            if found_player is not None:
                logging.info('OUT| MESSAGE: '+str(message)+' Actual: '+str(user_data))
                send_message(input_params, True) #Rebroadcast the message {data,sessionJson}
            else:
                #Send an eror message back to the user
                send_server_message('User must be logged in to message', False)

def valid_player_session(username : str, session_id : str) -> (bool, bool):
    found_player = playerController.find_player(username)

    if found_player is not None:
        if sessionHandler.check_active_session(session_id, username):
            return (True, True)
        return (True, False)
    return (False, False)

def handle_movement(message: dict) -> None:
    """ Handles a player movement command message send over SocketsIO """

    #If the movment returns True, all is good and we can send back a movement response
    #move_player also checks if the username exists for us
    logging.debug('IN| MOVEMENT MESSAGE: '+str(message))

    username = message['username']
    session_id = message['sessionId']

    found_player = playerController.find_player(username)

    valid = valid_player_session(username, session_id)

    if valid[0]:
        if valid[1]:
            player_pos = playerController.get_player_pos(username)

            if player_pos is not None:
                old_x = player_pos[0]
                old_y = player_pos[1]
                movement_success = False
                logging.info('Character move made from location'+str(old_x)+' '+str(old_y))

                if playerController.move_player(message) is True:
                    movement_success = True
                    new_pos = playerController.get_player_pos(username)

                    #Update every client to the new movement
                    logging.debug('OUT| movement UPDATE')
                    emit('movement-update', {
                        'username':message['username'],
                        'old_x':old_x,
                        'old_y':old_y,
                        'pos_x':new_pos[0],
                        'pos_y':new_pos[1]
                    }, broadcast=True)

                    logging.info('movement success for'+found_player.username)
                    logging.info(str(old_x)+str(old_y)+" "+str(new_pos[0])+str(new_pos[1]))
                else:
                    #Send a failed response back to that one user
                    logging.debug('OUT| movement RESPONSE, success: '+str(movement_success))
                    emit('movement-response', {'success':movement_success}, broadcast=False)
        else:
            logging.info('Valid user not in activeSessions, requesting password')
            emit('request-password', username) #Client has a valid user, but not logged in

def handle_char_details(message: dict) -> None:
    """ Receives character data from the client, validates it, and updates the DB """
    logging.info('CHAR DETAILS: '+str(message))

    if 'sessionJson' in message and 'username' in message['sessionJson']:
        if all(valid_player_session(message['sessionJson']['username'], request.sid)):
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
            emit('character-details-update', {'success': UPDATE_SUCCESS, 'char-data': character_data})
        else:
            logging.info('IN| (CHAR-STATS) stats save attempted for invalid session. ' + str(request.sid))
    else:
        logging.info('IN| Malformed protocol message for char details')

def handle_disconnect() -> None:
    """ Automatically removes an active session from our list on disconnect """
    removed_session = sessionHandler.remove_active_session(request.sid)

    if removed_session is True:
        print('Active session removed: '+request.sid+' '+removed_session[1])
    print('A session disconnected: '+request.sid)

def login_user(sid : str, username : str) -> None:
    logging.info('Logging in.. '+sid)
    sessionHandler.add_active_session(sid, username)

    #thisPlayer = jsonpickle.encode(playerController.find_player(username))
    status_response = playerController.get_player_status(username)
    if status_response is not None:
        logging.info('Player status response: '+str(status_response))
        send_login_success(sid, status_response)

def authenticate_user(data) -> None:
    """ Authenticates/logs in a user through username and password """

    sid = request.sid
    username = data['username']
    password = data['password']

    #Calling the static method to check player details
    auth_result = database.DatabaseHandler.check_player_password(username, password)
    found_player = auth_result[0]
    password_correct = auth_result[1]

    #First tuple val is player found, 2nd is password
    if all(auth_result):
        login_user(sid, username)

    if found_player and (not password_correct):
        logging.info('Password incorrect: '+username)
        send_login_failure(found_player)

    #User does not exist, password invalid (no account, make one)
    if not all(auth_result):
        #Create a new Player
        logging.info('Creating a new player! '+str(username)+str(password))
        if playerController.new_player(username, password) is not None:
            login_user(sid, username)

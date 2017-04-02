""" Manages a socketIO connection to clients, and associated WebSocket events"""

import threading
import jsonpickle
import logging
from flask import request
from flask_socketio import emit
from pyfiles import playerController, sessionHandler, userInput, overworld
from pyfiles.db import database

def hookup_callbacks(socket_server):
    socket_server.on_event('new-chat-message', handle_message)
    socket_server.on_event('map-data-request', send_map_data)
    socket_server.on_event('movement-command', handle_movement)
    socket_server.on_event('client-auth', authenticate_user)

    socket_server.on_event('character-details', handle_char_details)

    socket_server.on_event('connect', send_welcome)
    socket_server.on_event('disconnect', handle_disconnect)

def send_server_message(message, toAll):
    """ Builds an ad-hoc sessionJson for the server and passes on the message data """
    messageData = {'data': message, 'sessionJson': {'username':'server'}}
    send_message(messageData, toAll)

def send_message(messageData, toAll) -> None:
    #"""Broadcasts a chat-message-response to all connected users """
    logging.debug('OUT| chat message RESPONSE to all')
    emit('chat-message-response', messageData, broadcast=toAll)

def send_login_success(session_id, status_response):
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

def parse_login(sid, username):
    #user inputted username from client message

    #Does this player already exist?
    if all(valid_player_session(username, sid)):
        #Exists but not logged in
        if not sessionHandler.check_active_session(sid, found_player.username):
            logging.info('Requesting authentication for existing user..')
            #Send the password request for existing user
            logging.debug('OUT| request-password for: '+username)
            emit('request-password', username)
        else:
            logging.info('User'+username+'already logged in..')
    else:
        logging.info('User does not exist'+username)
        logging.debug('OUT| request-new-password for: '+username)

        #Send the password creation request for a new account
        emit('request-new-password', username)

def handle_message(message: dict) -> None:
    logging.info('IN| player message: '+str(message))

    sid = request.sid
    message_details = userInput.check_message_params(message)

    #True if the the message was properly formatted
    if message_details[0] is True:
        input_params = message_details[1]
        user_choice = input_params['choice']
        user_data = input_params['data']
        logging.info(user_data)

        if user_choice == 1:
            username = input_params['data']['username'] #Username is here for a login
            parse_login(sid, username)

        elif user_choice == 2:
            #user inputted username from client message
            username = message['sessionJson']['username'] #Username from sessionJSON otherwise
            found_player = playerController.find_player(username)

            if found_player is not None:
                logging.info('OUT| MESSAGE: '+str(message)+' Actual: '+str(user_data))
                send_message(message, True) #Rebroadcast the message {data,sessionJson}
            else:
                #Send an eror message back to the user
                send_server_message('User must be logged in to message', False)

def valid_player_session(username, session_id):
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
            logging.info('IN| (CHAR-STATS) stats save attempted. '+str(request.sid))
            update_success = False
            #Check the details and emit a response based on that
            if userInput.validate_character_update(message):
                update_success = True
                playerController.update_character_details(message)
            emit('character-details-update-status', {'success':update_success})

        else:
            logging.info('IN| (CHAR-STATS) stats save attempted for invalid session.'+str(request.sid))
    else:
        logging.info('IN| Malformed protocol message for char details')

def handle_disconnect() -> None:
    """ Automatically removes an active session from our list on disconnect """
    removed_session = sessionHandler.remove_active_session(request.sid)

    if removed_session is True:
        print('Active session removed: '+request.sid+' '+removed_session[1])
    print('A session disconnected: '+request.sid)

def authenticate_user(data) -> None:
    """ Authenticates/logs in a user through username and password """

    sid = request.sid
    username = data['username']
    password = data['password']

    #Calling the static method to check player details
    if database.DatabaseHandler.check_player_password(username, password):
        logging.info('Logging in.. '+sid)
        sessionHandler.add_active_session(sid, username)

        #thisPlayer = jsonpickle.encode(playerController.find_player(username))
        status_response = playerController.get_player_status(username)
        if status_response is not None:
            logging.info('Player status response: '+str(status_response))
            send_login_success(sid, status_response)

    else:
        logging.info('Password incorrect: '+username)

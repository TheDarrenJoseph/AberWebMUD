""" Manages a socketIO connection to clients, and associated WebSocket events"""

import threading
import jsonpickle
import logging
from flask import request
from flask_socketio import emit
from pyfiles import playerController, sessionHandler, userInput, overworld, database

def send_message(message: dict) -> None:
    #"""Broadcasts a chat-message-response to all connected users """
    logging.debug('OUT| chat message RESPONSE')
    emit('chat-message-response', message, broadcast=True)

def send_login_success(session_id, status_response):
    """ Emits a login-success event to the client
        sends the current sessionId and a player-status data object
    """
    logging.debug('OUT| login success: '+str(status_response))
    emit('login-success', {'sessionId':session_id, 'player-status':status_response})
    sessionHandler.list_sessions() #List sessions for debug/info

def send_welcome():
    """ emits a welcome message to the client
        also sets a 5min timeout to disconnect the session
    """
    logging.debug('OUT| Welcome message to: '+request.sid)
    sessionHandler.add_connected_session(request.sid)

    emit('connection-response', {'messageData': 'Welcome! Please create a character or login by typing \'user [username] [charactername]\' ', 'sessionId':request.sid})
    #emit('status-response',statusResponse)
    sessionHandler.list_sessions()

    #5 minute (300 sec) session clearing timer
    connection_timeout = threading.Timer(300, sessionHandler.remove_connected_session(request.sid))


def send_map_data():
    if len(overworld.map_tiles) > 0:
        logging.debug('OUT| map-response')

        emit('map-data-response', {'map-size-x': overworld.map_size_x,
                                   'map-size-y': overworld.map_size_y,
                                   'data': jsonpickle.encode(overworld.map_tiles)
                                  }
            )

def handle_message(message: dict) -> None:
    logging.info('IN| player message: '+str(message))

    sid = request.sid
    message_details = userInput.check_message_params(message)

    #True if the the message was properly formatted
    if message_details[0] is True:
        input_params = message_details[1]
        user_choice = input_params['choice']
        user_data = input_params['data']

        if user_choice == 0:
            return
        elif user_choice == 1:
            #user inputted username from client message
            username = input_params['data']['username']

            #Does this player already exist?
            found_player = playerController.find_player(username)
            if found_player is not None:
                #Exists but not logged in
                if not sessionHandler.check_active_session(sid, found_player.username):
                    logging.info('Requesting authentication for existing user..')
                    logging.info(user_data)
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

        elif user_choice == 2:
            #user inputted username from client message
            username = message['sessionJson']['username']
            found_player = playerController.find_player(username)

            if found_player is not None:
                logging.info(str(input_params['data']['messageData']))
                send_message(user_data)
            else:
                logging.info('User must be logged in to message')

def handle_movement(message: dict):
    """ Handles a player movement command message send over SocketsIO """

    #If the movment returns True, all is good and we can send back a movement response
    #move_player also checks if the username exists for us
    logging.debug('IN| MOVEMENT MESSAGE: ')
    logging.info('Movement command: '+str(message))

    username = message['username']
    session_id = message['sessionId']

    moved_player = playerController.find_player(username)

    if moved_player is not None:
        if sessionHandler.check_active_session(session_id, username):

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
                        'posX':new_pos[0],
                        'posY':new_pos[1]
                    }, broadcast=True)

                    logging.info('movement success for'+moved_player.username)
                    logging.info(str(old_x)+str(old_y)+" "+str(new_pos[0])+str(new_pos[1]))
                else:
                    #Send a failed response back to that one user
                    logging.debug('OUT| movement RESPONSE, success: '+str(movement_success))
                    emit('movement-response', {'success':movement_success}, broadcast=False)
        else:
            logging.info('Valid user not in activeSessions, requesting password')
            emit('request-password', username) #Client has a valid user, but not logged in

def handle_disconnect() -> None:
    """ Automatically removes an active session from our list on disconnect """
    removed_session = sessionHandler.remove_active_session(request.sid)

    if removed_session is True:
        print('Active session removed: '+request.sid+' '+removed_session[1])
    print('A session disconnected: '+request.sid)

def authenticate_user(data):
    """ Authenticates/logs in a user through username and password """

    sid = request.sid

    #hashedPassword = crypto.hash_password(data['password'])
    username = data['username']
    password = data['password']
    #print(hashedPass.salt)

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

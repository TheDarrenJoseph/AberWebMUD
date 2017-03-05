from flask import Flask, request, render_template, session
from flask_socketio import SocketIO, send, emit

import userInput, playerController, player, overworld, database
import jsonpickle, threading, passlib, ssl
from passlib.context import CryptContext
from os import urandom

#from argon2 import PasswordHasher

#Setup our argon2 hasher
#hasher = PasswordHasher()
hasher = CryptContext(schemes=["argon2"],deprecated="auto")
#Using TLS for HTTPS Support
#context = ssl.SSLContext(ssl.PROTOCOL_TLS)

#Create the app with our module name
app = Flask(__name__)

#Create our socketIO server
socketServer = SocketIO(app)

#Current connected  but unauthenticated sessions
connectedSessions = []

#Dict mapping of session IDs to usernames once authenticated
activeSessions = {}

@app.route("/", methods=['GET'])
def main():
    return render_template('play.html')

#@app.route("/play")
#def play() -> str:
    #print (__name__)
    #return "Game route"

#@socketServer.on('new-message', namespace='/')
def check_message(message: dict) -> None:
    inputParams = userInput.check__chat_input(message['data'])
    userChoice = inputParams['choice']
    userData = inputParams['data']
    if userChoice == 0:
        return
    elif userChoice == 1:
        #User exists
        if not playerController.create_player( userData['username'], userData['charname'] ):
            if not playerController.find_player(userData['username']).logged_in:
                print ('Requesting authentication.. ')
                print(userData)
                emit('request-password',userData['username'])
                #if playerController.log_in(userData['username']):
                    #print('login success')
                    #
            else:
                print('user already logged in..')
        else :
            print('USER '+userData['username']+' created')

    elif userChoice == 2:
        print (inputParams['data']['messageData'])
        send_message(userData)

def send_message(message: dict) -> None:
    #print("new message with keys: %s" % message.keys())
    #print('message data:'+message['data'])
    #Rebroadcast the message dict
    emit('chat-message-response', message, broadcast=True)
    #emit('chat-message-response', message, broadcast=True)

def list_sessions():
    print('Currently connected sessions: ')
    for s in connectedSessions:
        print(s)

    print('Currently active (authenticated) sessions: ')
    for s in activeSessions:
        print(s+' | '+activeSessions[s])

def clear_session(sid):
    connectedSessions.remove(sid)

def hash_password(password):
    hashedPass = hasher.hash(password)
    print('argon2 salted hash is: '+hashedPass)

    hashVals = hashedPass.split('$') #Break apart our hashstring
    print(hashVals)
    print('salt '+hashVals[4])
    print('hash '+hashVals[5])
    #print('SALT: '+salt.decode(encoding='UTF-8'))
    return hashedPass

def authenticate_user(data):
    sid = request.sid

    hash_password(data['password'])
    username = data['username']

    #print(hashedPass.salt)
    print('logging in.. '+sid)
    activeSessions[sid] = username
    playerController.log_in(username) #set this user to logged in

    thisPlayer = jsonpickle.encode(playerController.find_player(username))
    print('sending player data.. '+thisPlayer)
    emit('login-success', {'username':username,'sessionId':sid, 'character':thisPlayer})
    list_sessions()

@socketServer.on('connect')
def send_welcome():
    print('NEW SESSION '+request.sid)
    connectedSessions.append(request.sid)
    emit('connection-response', {'messageData': 'Welcome! Please create a character or login by typing \'user [username] [charactername]\' ', 'sessionId':request.sid})
    #emit('status-response',statusResponse)
    list_sessions()
    connectionTimeout = threading.Timer(300, clear_session(request.sid))

def send_map_data():
    if (len(overworld.mapTiles) > 0):
        emit('map-data-response',{  'map-size-x': overworld.mapSizeX,
                                    'map-size-y': overworld.mapSizeY,
                                    'data': jsonpickle.encode(overworld.mapTiles)
                                }
            )

@socketServer.on('disconnect')
def handle_disconnect() -> None:
    if request.sid in activeSessions.keys():
        username = activeSessions[request.sid]
        playerController.log_out(username)
        print('Logged out '+username)
    print('Session disconnected'+request.sid)


#Delivers string payload
#@socketServer.on('message')
#def handle_message(message: dict):
    #send(message)

#Delivers JSON as a Python Dict
#@socketServer.on('json')
#def handle_json(message: dict) -> None:
    #send(message)

#def command_response(player: player.Player):
#    message = {'success':True, 'posX':player.pos_x, 'posY':player.pos_y}
#    send_message(message)

def handle_movement(message: dict):
    #If the movment returns True, all is good and we can send back a movement response
    #move_player also checks if the username exists for us
    print(message)
    username = message['username']
    sessionId = message['sessionId']

    if (sessionId in activeSessions and activeSessions[sessionId] == username):
        if playerController.move_player(message):
            movedPlayer = playerController.find_player(username) #Grab the username to check their updated details
            #Update every client to the new movement
            emit('movement-response', {'success':True,'posX':movedPlayer.posX,'posY':movedPlayer.posY}, broadcast=False)
            emit('movement-update', {'charname':message['username'],'posX':movedPlayer.posX,'posY':movedPlayer.posY}, broadcast=True)
            print('movement success for'+movedPlayer.username)
        else :
            #Send a failed response back to that one user
            emit('movement-response', {'success':False}, broadcast=False)
    else:
        print(username+' not logged in')

#Sets up players, maps, etc
def setup_instance():
    overworld.create_map() #instanciate mapTiles
    print('MAP LOADED')

#Checks that this is the first instance/main instance of the module
if (__name__ == "__main__"):
    setup_instance()
    engineio_logger=True
    socketServer.on_event('new-chat-message',check_message)
    #socketServer.on_event('connect',send_welcome)
    socketServer.on_event('map-data-request',send_map_data)
    socketServer.on_event('movement-command',handle_movement)
    socketServer.on_event('client-auth', authenticate_user)
	#app.run()
    socketServer.run(app)

import player, re

from flask import Flask, request, render_template
from flask_socketio import SocketIO, send, emit

#Create the app with our module name
app = Flask(__name__)

players = []
users = {}

#Create our socketIO server
socketServer = SocketIO(app)

def parse_command(text) -> list:
    commandText = text.strip()
    commands = commandText.split(' ')
    return commands

def check_input(text: str) -> None:
    #print("Input check for: "+text)
    print ( re.match(r"say\s[\w\s,.!()]{1,140}", text) )

    userMatch = re.match(r"user\s[\w]{1,12},\s[\w]{1,12}", text)
    chatMatch = re.match(r"say\s[\w\s,.!()?]{1,140}", text)

    #Check for user creation
    if (userMatch != None):
        print("New user command: "+text)
        commands = parse_command(text)
        print(commands)

        users[commands[1]] = commands[2] # username: charctername mapping
        #create_player(commands[1].key, commands[1])
        print (users)

    elif (chatMatch != None):
        print('emitting message')
        message = chatMatch.group(0).split("say ")
        print (message)
        emit('chat-message-response', {'data':message[1]}, broadcast=True)

    else:
        pass

def create_player(username, charname) -> None:
    print ('creating user with uname '+username+' and charname '+charname)
    new_player = player.Player(username, charname)
    players.append(new_player)

@app.route("/", methods=['GET'])
def main():
    return render_template('play.html')

#@app.route("/play")
#def play() -> str:
    #print (__name__)
    #return "Game route"

#@socketServer.on('new-message', namespace='/')

def send_message(message: dict) -> None:
    print("new message with keys: %s" % message.keys())
    print('message data:'+message['data'])
    #Rebroadcast the message dict
    check_input(message['data'])
    #emit('chat-message-response', message, broadcast=True)

#@socketServer.on('connect')
def send_welcome():
    emit('chat-message-response', {'data': 'Welcome! Please create a character by typing \'user [username], [charactername]\' '})

@socketServer.on('disconnect')
def handle_disconnect() -> None:
    print('Someone Disconnected')

#Delivers string payload
@socketServer.on('message')
def handle_message(message: dict):
    send(message)

#Delivers JSON as a Python Dict
@socketServer.on('json')
def handle_json(message: str) -> None:
    send(message)

#Checks that this is the first instance/main instance of the module
if (__name__ == "__main__"):
    socketServer.on_event('new-chat-message',send_message)
    socketServer.on_event('connect',send_welcome)
	#app.run()
    socketServer.run(app)

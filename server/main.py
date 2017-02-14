from flask import Flask, request, render_template
from flask_socketio import SocketIO, emit

#Create the app with our module name
app = Flask(__name__) 

#Create our socketIO server
socketServer = SocketIO(app)

#send() -- send string or JSON message to client
#emit() -- sends a message using a custom event type to the client

@app.route("/", methods=['GET'])
def main():
	return render_template('play.html')

@app.route("/play")
def play():
	#print (__name__)
	return "Game route"

#@socketServer.on('new-message', namespace='/')	

@socketServer.on('new-chat-message')	
def send_message(text, namespace='/') :
	print('new message!')
	emit('chat-message-response', {'data': text})

@socketServer.on('connect')	
def handle_connect() :
	emit('chat-message-response', {'data': 'Welcome!'})
	
@socketServer.on('disconnect')	
def handle_disconnect() :
	print('Someone Disconnected')

#Delivers string payload
@socketServer.on('message')	
def handle_message(message) :
	send(message)
	
#Delivers JSON as a Python Dict
@socketServer.on('json')
def handle_json(message) :
	send(message)
	
#Checks that this is the first instance/main instance of the module
if (__name__ == "__main__"):
	#app.run()
	socketServer.run(app)

import passlib, ssl, logging

import flaskHandler
from pyfiles import userInput, playerController, player, overworld, database, crypto, socketHandler, sessionHandler
from flask_socketio import SocketIO

#Using TLS for HTTPS Support
#context = ssl.SSLContext(ssl.PROTOCOL_TLS)

#Sets up players, maps, etc
def setup_instance(_dbHandler):
    overworld.create_map() #instanciate mapTiles
    print('MAP LOADED')

    this_player = _dbHandler.make_test_player()

    print('TEST PLAYER:')
    print(this_player)

def hookup_callbacks(socket_server):
    #SocketsIO setup
    engineio_logger = True

    socket_server.on_event('new-chat-message', socketHandler.handle_message)
    #socketServer.on_event('connect',send_welcome)
    socket_server.on_event('map-data-request', socketHandler.send_map_data)
    socket_server.on_event('movement-command', socketHandler.handle_movement)
    socket_server.on_event('client-auth', socketHandler.authenticate_user)


    socket_server.on_event('connect', socketHandler.send_welcome)
    socket_server.on_event('disconnect', socketHandler.handle_disconnect)

#Checks that this is the first instance/main instance of the module
if __name__ == "__main__":
    #PonyORM Setup
    #Instanciate our database handler to allow lookups and creation
    DB_HANDLER = database.DatabaseHandler()
    DB_HANDLER.open_db()
    #_dbHandler.clear_db(True) #DANGEROUS, resets all DB data for development

    setup_instance(DB_HANDLER) #Run DB and data setup

    SOCKET_HANDLER = SocketIO(flaskHandler._APP)
    hookup_callbacks(SOCKET_HANDLER)

    #Set our default logging level to DEBUG
    LOGGER = logging.getLogger()
    LOGGER.setLevel(logging.DEBUG)

    #MAIN LOOP
    #app.run()
    SOCKET_HANDLER.run(flaskHandler._APP)

    #Cleanup
    DB_HANDLER.close_db()

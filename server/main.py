import passlib, ssl, logging

import flaskHandler
from pyfiles import userInput, playerController, crypto
from pyfiles.db import database
from pyfiles.model import overworld
from pyfiles.sockets import socketHandler, sessionHandler
#from pyfiles.db import player
from flask_socketio import SocketIO

#Using TLS for HTTPS Support
#context = ssl.SSLContext(ssl.PROTOCOL_TLS)

#Sets up players, maps, etc
def setup_instance(_dbHandler):
    overworld.create_map() #instanciate mapTiles
    logging.info('MAP LOADED')

    player1 = playerController.new_player('foo','test')
    #player1 = _dbHandler.make_player(None, 'foo','test')
    player2 = playerController.new_player('who','test')

    logging.info('TEST PLAYER 1:'+str(player1))
    logging.info('TEST PLAYER 2:'+str(player2))

#Checks that this is the first instance/main instance of the module
if __name__ == "__main__":
    #Set our default logging level to DEBUG
    LOGGER = logging.getLogger()
    LOGGER.setLevel(logging.DEBUG)

    #PonyORM Setup
    #Instanciate our database handler to allow lookups and creation
    DB_HANDLER = database.DatabaseHandler()
    DB_HANDLER.open_db()

    #DB_HANDLER.clear_db(True) #DANGEROUS, resets all DB data for development

    setup_instance(DB_HANDLER) #Run DB and data setup

    #Enable engineIO Logging
    engineio_logger = True

    SOCKET_HANDLER = SocketIO(flaskHandler._APP)
    socketHandler.hookup_callbacks(SOCKET_HANDLER)

    #MAIN LOOP
    #app.run()
    DB_HANDLER.show_tables()
    SOCKET_HANDLER.run(flaskHandler._APP)

    #Cleanup
    DB_HANDLER.close_db()

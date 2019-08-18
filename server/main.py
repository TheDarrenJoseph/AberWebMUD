import logging, pdb

import flaskHandler
from pyfiles import playerController
from pyfiles.db import database
#from pyfiles.db import player

#Using TLS for HTTPS Support
#context = ssl.SSLContext(ssl.PROTOCOL_TLS)

#Sets up players, maps, etc
from pyfiles.sockets.socketHandler import SocketHandler


def setup_instance(_dbHandler):
    player1 = playerController.new_player('foo', 'test')
    player2 = playerController.new_player('who', 'test')

    logging.info('TEST PLAYER 1:'+str(player1))
    logging.info('TEST PLAYER 2:'+str(player2))

#Checks that this is the first instance/main instance of the module
if __name__ == "__main__":
    #Set our default logging level to DEBUG
    LOGGER = logging.getLogger()
    LOGGER.setLevel(logging.DEBUG)
    # Restrict socketio logging
    #logging.getLogger('engineio').setLevel(logging.ERROR)
    #logging.getLogger('socketio').setLevel(logging.ERROR)

    #PonyORM Setup
    #Instanciate our database handler to allow lookups and creation
    DB_HANDLER = database.DatabaseHandler()
    DB_HANDLER.open_db()

    setup_instance(DB_HANDLER) #Run DB and data setup

    # SOCKET_HANDLER = SocketIO(flaskHandler._APP, engineio_logger=True)
    logging.info('Initialising SocketHandler..')
    SOCKET_HANDLER = pdb.runcall(SocketHandler(flaskHandler._APP, logger=False, engineio_logger=False))
    SOCKET_IO = SOCKET_HANDLER.socketHandler

    #DB_HANDLER.show_tables()

    #Cleanup
    logging.info('Closing down server..')
    DB_HANDLER.close_db()

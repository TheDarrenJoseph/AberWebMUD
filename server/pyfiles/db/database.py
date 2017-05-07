import logging
import psycopg2
from pyfiles import playerController, crypto
from pyfiles.db import db_instance, player, character
from pony.orm import *

class DatabaseHandler():
    #Shared class variable to prevent multiple instanciations
    _db_instance = db_instance.DatabaseInstance()

    def db_exists(self) -> bool:
        return self._db_instance._database is not None

    #Checks an unhashed password against the salt/hash in the DB using passlib
    @staticmethod
    def check_player_password(username, password) -> bool:
        found_player = playerController.find_player(username)

        if found_player is not None:
            return (True, crypto.verify_password(password, found_player.password))
        return (False, False)


    @pony.orm.db_session
    def print_version(self) -> None:
        """ Logs DB build info to logging """
        if self.db_exists():
            logging.info('DB INFO: '+str(self._db_instance._database.select("select sqlite_version();")))
            #logging.info(self._db_instance._database.select("select version();")) POSTGRES

    @pony.orm.db_session
    def show_tables(self) -> None:
        """ Logs the current state of the player and character tables for development debug """
        if self.db_exists():
            logging.info('Players in DB: '+str(self._db_instance._database.select("select * from Player")))
            logging.info('Characters in DB: '+str(self._db_instance._database.select("select * from Character")))

    def clear_db(self, allData:bool) -> None:
        self._db_instance._database.drop_all_tables(with_all_data=allData)

    #This should be done after defining every database entity (such as a Player)
    def map_db(self) -> None:
        self._db_instance._database.generate_mapping(create_tables=True)

    #Binds and maps PonyORM to the Postgresql DB
    def open_db(self) -> None:
        if self.db_exists():
            try:
                #SQLite in memory for 'session only' storage (does not persist)
                self._db_instance._database.bind('sqlite', ':memory:')
                #Postgres option (for deployment if needed)
                #self._db_instance._database.bind('postgres', database='aber-web-mud', user='webmud')

                logging.info('--DB-OPEN--')
                self.map_db()
                logging.info('--DB--MAPPED--')
                self.print_version()
                self.show_tables()

            except psycopg2.DatabaseError:
                logging.critical('--DB-ERROR--| while opening DB.')


    def close_db(self) -> None:
        if self.db_exists():
            self._db_instance._database.disconnect()
            logging.info('--DB-CLOSED--: ')

import logging
import psycopg2
from pyfiles import player, character, playerController, crypto
from pony.orm import *

class DatabaseHandler:
    #Shared class variable to prevent multiple instanciations
    _database = Database()

    @pony.orm.db_session
    def make_player(self, charname, username, passwd):
        return playerController.new_player(charname, username, passwd)

    #Checks an unhashed password against the salt/hash in the DB using passlib
    @staticmethod
    def check_player_password(username, password) -> bool:
        found_player = playerController.find_player(username)

        if found_player is not None:
            return crypto.verify_password(password, found_player.password)
        return False

    #Prints DB build info
    @pony.orm.db_session
    def print_version(self):
        if self._database is not None:
            logging.info('DB INFO: '+str(self._database.select("select sqlite_version();")))
            #logging.info(self._database.select("select version();")) POSTGRES

    #Prints the current state of the tables for development debug
    @pony.orm.db_session
    def show_tables(self):
        if self._database is not None:
            logging.info(str(self._database.select("select * from Player")))
            logging.info(str(self._database.select("select * from Character")))

    def clear_db(self, allData:bool):
        self._database.drop_all_tables(with_all_data=allData)

    #This should be done after defining every database entity (such as a Player)
    def map_db(self):
        self._database.generate_mapping(create_tables=True)

    #Binds and maps PonyORM to the Postgresql DB
    def open_db(self):
        if self._database is not None:
            try:
                #SQLite in memory for 'session only' storage (does not persist)
                self._database.bind('sqlite', ':memory:')
                #Postgres option (for deployment if needed)
                #self._database.bind('postgres', database='aber-web-mud', user='webmud')

                logging.info('--DB-OPEN--')
                self.map_db()
                logging.info('--DB--MAPPED--')
                self.print_version()
                self.show_tables()

            except psycopg2.DatabaseError:
                logging.critical('--DB-ERROR--| while opening DB.')


    def close_db(self):
        if self._database is not None:
            self._database.disconnect()
            logging.info('--DB-CLOSED--: ')

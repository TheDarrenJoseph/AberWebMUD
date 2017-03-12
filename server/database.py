import psycopg2, player, character, playerController, crypto
from pony.orm import *

class DatabaseHandler:
    #_databaseConnection = None #Shared class variable to prevent multiple instanciations
    _database = Database()

    #Creates a test record for a Player
    @pony.orm.db_session
    def make_test_player(self):
        return playerController.new_player('bar','foo', 'test')

    #Checks an unhashed password against the salt/hash in the DB using passlib
    @pony.orm.db_session
    def check_player_password(self, username, password) -> bool:
        foundPlayer = playerController.find_player(username)

        if foundPlayer is not None:
            return crypto.verify_password(password, foundPlayer.password)
        return False

    #Prints DB build info
    @pony.orm.db_session
    def print_version(self):
        if self._database is not None:
            print(self._database.select("select version()"))

    #Prints the current state of the tables for development debug
    @pony.orm.db_session
    def show_tables(self):
        if self._database is not None:
            print(self._database.select("select * from Player"))
            print(self._database.select("select * from Character"))

    def clear_db(self, allData:bool):
        self._database.drop_all_tables(with_all_data=allData)

    #This should be done after defining every database entity (such as a Player)
    def map_db(self):
        self._database.generate_mapping(create_tables=True)

    #Binds and maps PonyORM to the Postgresql DB
    def open_db(self):
        if self._database is not None:
            try:
                #self._databaseConnection = psycopg2.connect(database='aber-web-mud-db', user='webmud')
                self._database.bind('postgres',database='aber-web-mud-db', user='webmud')
                print('--DB-OPEN--')
                self.map_db()
                print('--DB--MAPPED--')
                self.print_version()
                self.show_tables()


            except psycopg2.DatabaseError:
                print('--DB-ERROR--| while opening DB.')


    def close_db(self):
        if self._database is not None:
            self._database.disconnect()
            print('--DB-CLOSED--: ')

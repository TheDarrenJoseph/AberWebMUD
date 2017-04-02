from pony.orm import *

class DatabaseInstance():
    #Shared class variable to prevent multiple instanciations
    _database = Database()

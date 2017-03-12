import character, database
from pony.orm import *

class Player(database.DatabaseHandler._database.Entity):
    character = Required(character.Character)
    username = PrimaryKey(str)
    #passwordSalt = Required(str, unique=True)
    password = Required(str)

    @db_session
    def create_player_status_response(self):
    #    return None
        print('RESPONSE: '+self.username)
        thisPlayer = Player[self.username] #find the database entity for this (allows db_session)

        return {'player':thisPlayer.username, 'charname':thisPlayer.character.charname, 'pos_x':thisPlayer.character.posX, 'pos_y':thisPlayer.character.posY }
        #print ({'player':self.username, 'charname':self.character.charname})
        #return {'player':self.username, 'charname':self.character.charname, 'pos_x':self.character.posX, 'pos_y':self.character.posY }

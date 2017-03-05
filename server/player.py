import character

class Player(character.Character):

    def __init__ (self, username: str, charname: str):
        self.character = super().__init__(charname)
        self.username = username
        self.logged_in = False
        self.session = None
        self.pos_x = 0
        self.pos_y = 0

    def create_player_status_response(self):
        return {'player':self.username ,'logged-in':self.logged_in,'active-session':False}

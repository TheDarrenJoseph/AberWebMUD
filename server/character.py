#Please don't instanciate this supertype
class Character:

    def __init__(self, charname: str):
        self.charname = charname
        #Positions are stored relative to the map
        self.pos_x = None
        self.pos_y = None

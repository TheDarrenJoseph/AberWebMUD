import character

class Player(character.Character):

    def __init__ (self, username: str, charname: str):
        Character.__init__(self)
        self.username = username

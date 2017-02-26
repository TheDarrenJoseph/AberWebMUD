#Please don't instanciate this supertype
class Character:

    def __init__(self, name: str):
        self.name = name
        self.pos_x = None
        self.pos_y = None

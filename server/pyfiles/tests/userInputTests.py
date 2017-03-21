import unittest

class CheckMessageGoodValues(unittest.TestCase):
    #check_message_params(message: dict) -> (bool, dict):
    def goodInput():
        pass

class CheckMessageBadValues(unittest.TestCase):
    #check_message_params(message: dict) -> (bool, dict):
    def badInput():
        pass

class CheckChatInputGoodValues(unittest.TestCase):
    #check_chat_input(text: str) -> dict
    def goodInput():
        pass

class CheckChatInputBadValues(unittest.TestCase):
    #check_chat_input(text: str) -> dict
    def badInput():
        pass

class CheckParseCommandValid(unittest.TestCase):
    #parse_command(text) -> list
    def normalLogin():
        pass

    def normalMessage():
        pass

class CheckParseCommandInvalid(unittest.TestCase):
    #parse_command(text) -> list
    def badLogin():
        pass

    def badMessage():
        pass

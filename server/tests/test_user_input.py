import unittest
from pyfiles import userInput

data_tag = 'data'
param_tag = 'sessionJson'

class CheckChatInputGoodValues(unittest.TestCase):
    #check_chat_input(text: str) -> dict
    # returns either:
        # LOGIN {'choice':1, 'data':{'username':commands[1], 'charname':commands[2]}}
        # MESSAGE {'choice':2, 'data':{'messageData':message}}
        # {'choice':0, 'data':None}
    #    user_match = re.match(r"user\s[\w]{1,12}\s[\w]{1,12}", text) #('user [uname] [charactername]'
    def goodLoginInputMax():
        largestUsername = "aReally_Big1" #[lowercase, uppercase, underscore, and numbers]
        largestCharname = "Areally_Big1"
        testInput = "user "+largestUsername+' '+largestCharname
        expectedOutput = {'choice':1, 'data':{'username':largestUsername, 'charname':largestCharname}}
        output = userInput.check_message_params(testInput)
        assertEqual(output, expectedOutput)

    def goodLoginInputMin():
        smallestString = "z" #1 char of either a-Z, _, or 0-9
        testInput = "user "+smallestString+' '+smallestString
        expectedOutput = {'choice':1, 'data':{'username':smallestString, 'charname':smallestString}}
        output = userInput.check_message_params(testInput)
        assertEqual(output, expectedOutput)

    #   chat_match = re.match(r"say\s([\w\s,.!()?]{1,140})", text) #('say [message]')
    def goodChatInputMax():
        testString = "One_Hundred and forty magical characters" #[lowercase, uppercase, underscore, and numbers]
        testInput = "say "+testString
        expectedOutput = {'choice':1, 'data':{'username':largestUsername, 'charname':largestCharname}}
        output = userInput.check_message_params(testInput)
        assertEqual(output, expectedOutput)
        pass

    def goodChatInputMin():
        pass

class CheckChatInputBadValues(unittest.TestCase):
    #check_chat_input(text: str) -> dict
    def badInput():
        pass

class CheckMessageGoodValues(unittest.TestCase):
    #check_message_params(message: dict) -> (bool, dict):

    def goodLoginInputMax():
        pass

    def goodLoginInputMin():
        pass

    #   chat_match = re.match(r"say\s([\w\s,.!()?]{1,140})", text) #('say [message]')
    def goodChatInputMax():
        pass

    def goodChatInputMin():
        pass

class CheckMessageBadValues(unittest.TestCase):
    #check_message_params(message: dict) -> (bool, dict):
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

if __name__ == "__main__":
    unittest.main()

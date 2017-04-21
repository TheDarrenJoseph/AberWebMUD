import re, logging
from pyfiles import jsonChecker, playerController, characterController

def split_words(text : str) -> list:
    """ Breaks up a command input such as 'hello foo bar' into individual words"""
    command_text = text.strip()
    commands = command_text.split(' ')
    return commands

def parse_chat_input(text: str) -> dict:
    """ Checks chat input formats against command regex matchers """
    user_match = re.match(r"user\s[\w]{1,12}", text) #('user [uname]')
    chat_match = re.match(r"say\s([\w\s,.!()?]{1,140})", text) #('say [message]')

    #Check for user creation
    if user_match is not None:
        commands = split_words(text)
        #2nd word should be the username i.e "user foo"
        return {'choice':1, 'chat-data':{'username':commands[1]}}

    #Check for chat message
    elif chat_match != None:
        #grab and return all matching text
        message = chat_match.group(1)
        return {'choice':2, 'chat-data':message}

    return {'choice':0, 'char-data':None}

def check_login_message(input_params : dict) -> (bool, dict or None):
    data_tag = 'chat-data'

    #Checking our parsed data exists
    if input_params[data_tag] is None or \
        'username' not in input_params[data_tag] or \
        input_params[data_tag]['username'] is None:
        logging.info('Missing (username) in protocol message (Probably not logged in)')
        return (False, None)
    else:
        logging.info('User creation message checked (input good)')
        return (True, input_params)

def check_chat_message(input_params: dict) -> (bool, dict or None):
    data_exists = 'chat-data' in input_params and input_params['chat-data'] is not None
    username_exists = 'username' in input_params and \
                    input_params['username'] is not None

    if data_exists and username_exists:
        logging.info('User chat message checked (input good)')
        return (True, input_params)
    logging.info('Invalid protocol for chat message')
    return (False, None)

def check_message_params(message : dict) -> (bool, dict):
    """ Sanity checks the JSON protocol messages sent from the client
        JSON message format is {'data': message/login, 'sessionJson': { username, sid, etc} }
    """
    logging.info('CHECKING message: '+str(message))

    data_tag = 'data'
    chat_data_tag = 'chat-data'
    param_tag = 'sessionJson'

    if data_tag in message:
        #Send the 'data' from the input to be checked
        extracted_params = parse_chat_input(message[data_tag]) #returns {choice, chat-data or None}
        logging.info('INPUT PARAMS:'+str(extracted_params))

        if extracted_params is None:
            logging.info('Missing (input param data) from protocol message')
        else:
            if 'choice' not in extracted_params or chat_data_tag not in extracted_params:
                logging.info('Missing (choice AND/OR data) in protocol message')
            else:
                choice = extracted_params.pop('choice')
                if choice == 1:
                    return (choice, check_login_message(extracted_params))
                if choice == 2:
                    extracted_params.update(message[param_tag]) #Add the session data back onto the result
                    return (choice, check_chat_message(extracted_params))
    return (False, None)

def validate_character_update(characterJson : dict) -> bool:
    """ Checks we've been given valid data, and that any changes are within limits """
    return jsonChecker.character_details_exist(characterJson)
    #Check for a prexisting character
    #if characterController.get_character(characterJson['data']['charname']) is None:

import re, logging
from pyfiles import jsonChecker, playerController, characterController

def parse_command(text) -> list:
    """ Breaks up a command input such as 'user foo bar' into individual words"""

    command_text = text.strip()
    commands = command_text.split(' ')
    return commands

def parse_chat_input(text: str) -> dict:
    """ Checks chat input formats against command regex matchers """

    #print("Input check for: "+text)
    print(re.match(r"say\s[\w\s,.!()]{1,140}", text))

    user_match = re.match(r"user\s[\w]{1,12}", text) #('user [uname]')
    chat_match = re.match(r"say\s([\w\s,.!()?]{1,140})", text) #('say [message]')

    #Check for user creation
    if user_match is not None:
        commands = parse_command(text)
        return {'choice':1, 'data':{'username':commands[1]}}

    #Check messaging match
    elif chat_match != None:
        message = chat_match.group(1)
        return {'choice':2, 'data':message}

    return {'choice':0, 'data':None}

def check_login_message(input_params):
    #Checking our parsed data exists
    if input_params['data'] is None or \
        'username' not in input_params['data'] or \
        input_params['data']['username'] is None:
        logging.info('Missing (username) in protocol message (Probably not logged in)')
        return (False, None)
    else:
        logging.info('User creation message checked (input good)')
        return (True, input_params)

def check_chat_message(input_params):
    data_exists = 'data' in input_params and input_params['data'] is not None
    username_exists = 'sessionJson' in input_params and \
                    'username' in input_params['sessionJson'] and \
                    input_params['username'] is not None

    if data_exists and username_exists:
        logging.info('User chat message checked (input good)')
        return (True, input_params)
    logging.info('Invalid protocol for chat message')
    return (False, None)

def check_message_params(message: dict) -> (bool, dict):
    """Sanity checks the JSON protocol messages sent from the client   """
    logging.info('CHECKING message: '+str(message))

    #JSON message format is {'data': message/login, 'sessionJson': username, sid, etc}
    data_tag = 'data'
    param_tag = 'sessionJson'

    username = message[param_tag]['username']
    logging.info('Socket MESSAGE param username: '+str(username))

    if data_tag in message:
        #Send the 'data' from the input to be checked
        extracted_params = parse_chat_input(message[data_tag]) #{choice, data}
        logging.info('INPUT PARAMS:'+str(extracted_params))

        if extracted_params is None:
            logging.info('Missing (input param data) from protocol message')
        else:
            if 'choice' not in extracted_params or data_tag not in extracted_params:
                logging.info('Missing (choice AND/OR data) in protocol message')
            elif extracted_params['choice'] == 1:
                return check_login_message(extracted_params)
            elif extracted_params['choice'] == 2:
                return check_chat_message(extracted_params)
    return (False, None)

def validate_character_update(characterJson) -> bool:
    """ Checks we've been given valid data, and that any changes are within limits """
    return jsonChecker.character_details_exist(characterJson)
    #Check for a prexisting character
    #if characterController.get_character(characterJson['data']['charname']) is None:

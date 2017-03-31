import re, logging

def parse_command(text) -> list:
    """ Breaks up a command input such as 'user foo bar' into individual words"""

    command_text = text.strip()
    commands = command_text.split(' ')
    return commands

def check_chat_input(text: str) -> dict:
    """ Checks chat input formats against command regex matchers """

    #print("Input check for: "+text)
    print(re.match(r"say\s[\w\s,.!()]{1,140}", text))

    user_match = re.match(r"user\s[\w]{1,12}\s[\w]{1,12}", text) #('user [uname] [charactername]')
    chat_match = re.match(r"say\s([\w\s,.!()?]{1,140})", text) #('say [message]')

    #Check for user creation
    if user_match is not None:
        commands = parse_command(text)
        return {'choice':1, 'data':{'username':commands[1], 'charname':commands[2]}}

    #Check messaging match
    elif chat_match != None:
        message = chat_match.group(1)
        return {'choice':2, 'data':{'messageData':message}}

    return {'choice':0, 'data':None}

def check_message_params(message: dict) -> (bool, dict):
    """Sanity checks the JSON protocol messages sent from the client

    """

    logging.info('CHECKING message: '+str(message))

    data_tag = 'data'
    param_tag = 'sessionJson'

    if data_tag in message:
        #Send the 'data' from the input to be checked
        input_params = check_chat_input(message[data_tag])

        if input_params is None:
            logging.info('Missing (input param data) from protocol message')
        else:
            if 'choice' not in input_params or data_tag not in input_params:
                logging.info('Missing (choice AND/OR data) in protocol message')
            elif input_params['choice'] == 1:
                #Checking our parsed data exists
                if input_params['data'] is None or \
                    'username' not in input_params['data'] or \
                    input_params['data']['username'] is None:

                    logging.info('Missing (username) in protocol message (Probably not logged in)')
                else:
                    logging.info('User creation message checked (input good)')
                    return (True, input_params)
            elif input_params['choice'] == 2:
                print('User has sent a message')
                if 'data' in input_params and \
                    'messageData' in input_params['data'] and \
                    input_params['data']['messageData'] is not None:
                    logging.info('User chat message checked (input good)')
                    return (True, input_params)
                else:
                    logging.info('No (data) in protocol message')

    return (False, None)

def validate_character_update() -> bool:
    """ Checks we've been given valid data, and that any changes are within limits """
    pass

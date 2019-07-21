import logging
""" Where any complex validation of JSON data (structure etc) will be performed"""

def key_and_data_exists(jsonMessage: dict, key: str) -> bool:
    if key in jsonMessage.keys():
        logging.debug('CHECKING: '+str(key))

        #Check against none and blank -- jsonMessage == '' is Falsy
        if jsonMessage[key] is not None and bool(jsonMessage[key]) is True:
            if isinstance(jsonMessage[key], str):
                key_value = jsonMessage[key].strip() #Removes any whitespace just incase
                #Empty strings '' are Falsy, anything else should be Truthy
                return bool(key_value)
            return True #True for all other types

    return False

def character_attribues_exist(attributes : dict) -> bool:
    ATTRIBUTES_PRESENT = key_and_data_exists(attributes, 'STR') \
    and key_and_data_exists(attributes, 'DEX') \
    and key_and_data_exists(attributes, 'CON') \
    and key_and_data_exists(attributes, 'INT') \
    and key_and_data_exists(attributes, 'WIS') \
    and key_and_data_exists(attributes, 'CHA')
    return ATTRIBUTES_PRESENT

def check_for_attribute(data : dict, attrib_name : str) :
    if not key_and_data_exists( data, attrib_name ) :
        logging.error('Missing expected attribute \'' + attrib_name + '\'')
        return False
    return True

def character_details_exist(characterJson : dict) -> bool:
    """ Checks that the character update JSON data exists in the correct format
        EXAMPLE DATA:
        {'data': {'charname': 'Ragnar', 'charclass': 'fighter', 'attributes': {'STR': '1', 'DEX': '1', 'CON': '1', 'INT': '1', 'WIS': '1', 'CHA': '1'}},
        'sessionJson': {'sessionId': 'saa2231sad2121', 'username': 'test'}}
    """
    if check_for_attribute(characterJson, 'data'):
        if check_for_attribute(characterJson, 'sessionJson'):

            user_data = characterJson['data']
            chardata_present = check_for_attribute(user_data, 'character')

            if (chardata_present):
                char_data = user_data['character']
                session_json = characterJson['sessionJson']

                USERNAME_PRESENT = check_for_attribute(session_json, 'username')
                ALL_DATA_PRESENT = check_for_attribute(char_data, 'charname') \
                and check_for_attribute(char_data, 'charclass') \
                and check_for_attribute(char_data, 'position') \
                and check_for_attribute(char_data, 'health') \
                and check_for_attribute(char_data, 'attributes')

                #If both are valid, check for attributes
                if USERNAME_PRESENT and ALL_DATA_PRESENT:
                    FREEPOINTS_PRESENT = check_for_attribute(char_data['attributes'], 'free_points')
                    ATTRIBUTES_PRESENT = character_attribues_exist(char_data['attributes']['scores'])
                    return FREEPOINTS_PRESENT and ATTRIBUTES_PRESENT
    return False

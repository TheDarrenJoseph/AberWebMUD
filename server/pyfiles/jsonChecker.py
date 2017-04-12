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

def character_details_exist(characterJson):
    """ Checks that the character update JSON data exists in the correct format
        EXAMPLE DATA:
        {'data': {'charname': 'Ragnar', 'charclass': 'fighter', 'attributes': {'STR': '1', 'DEX': '1', 'CON': '1', 'INT': '1', 'WIS': '1', 'CHA': '1'}},
        'sessionJson': {'sessionId': 'saa2231sad2121', 'username': 'test'}}

    """
    if key_and_data_exists(characterJson, 'data'):
        if key_and_data_exists(characterJson, 'sessionJson'):
            charData = characterJson['data']
            charDetails = characterJson['sessionJson']

            USERNAME_PRESENT = key_and_data_exists(charDetails, 'username')
            logging.info('USERNAME PRESENT - '+str(USERNAME_PRESENT))

            ALL_DATA_PRESENT = key_and_data_exists(charData, 'charname') \
            and key_and_data_exists(charData, 'charclass') \
            and key_and_data_exists(charData, 'attributes')
            logging.info('ALL DATA PRESENT - '+str(ALL_DATA_PRESENT))

            #If both are valid, check for attributes
            if USERNAME_PRESENT and ALL_DATA_PRESENT:
                attributes = charData['attributes']
                ATTRIBUTES_PRESENT = key_and_data_exists(attributes, 'STR') \
                and key_and_data_exists(attributes, 'DEX') \
                and key_and_data_exists(attributes, 'CON') \
                and key_and_data_exists(attributes, 'INT') \
                and key_and_data_exists(attributes, 'WIS') \
                and key_and_data_exists(attributes, 'CHA')

                logging.info('ATTRIBUTES PRESENT - '+str(ATTRIBUTES_PRESENT))
                if ATTRIBUTES_PRESENT:
                    return True
    return False

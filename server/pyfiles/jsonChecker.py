import logging
""" Where any complex validation of JSON data (structure etc) will be performed"""

def key_and_data_exists(jsonMessage: dict, key: str) -> bool:
    logging.debug('CHECKING: '+str(jsonMessage))
    if key in jsonMessage.keys():
        if jsonMessage[key] is not None:
            logging.debug(jsonMessage[key])
            return True
    return False

def character_details_exist(characterJson):
    """ Checks that the character update JSON data exists in the correct format
        EXAMPLE DATA:
        {'data': {'charname': 'Ragnar', 'charclass': 'fighter', 'attributes': {'STR': '1', 'DEX': '1', 'CON': '1', 'INT': '1', 'WIS': '1', 'CHA': '1'}},
        'sessionJson': {'sessionId': 'saa2231sad2121', 'username': 'foo'}}

    """
    if key_and_data_exists(characterJson, 'data'):
        if key_and_data_exists(characterJson, 'sessionJson'):
            charData = characterJson['data']
            charDetails = characterJson['sessionJson']

            USERNAME_PRESENT = key_and_data_exists(charDetails, 'username')

            ALL_DATA_PRESENT = key_and_data_exists(charData, 'charname') \
            and key_and_data_exists(charData, 'charclass') \
            and key_and_data_exists(charData, 'attributes')

            #If both are valid, check for attributes
            if USERNAME_PRESENT and ALL_DATA_PRESENT:
                attributes = charData['attributes']
                ATTRIBUTES_PRESENT = key_and_data_exists(attributes, 'STR') \
                and key_and_data_exists(attributes, 'DEX') \
                and key_and_data_exists(attributes, 'CON') \
                and key_and_data_exists(attributes, 'INT') \
                and key_and_data_exists(attributes, 'WIS') \
                and key_and_data_exists(attributes, 'CHA')

                if ATTRIBUTES_PRESENT:
                    return True
    return False

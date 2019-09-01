import logging
from pyfiles.db import player
from pyfiles.model import session

# Current connected but unauthenticated sessions
_connected_sessions = []

# Dict mapping of session IDs to usernames once authenticated/logged_in
_active_sessions = {}


def add_connected_session(session_id: str) -> None:
    logging.info('NEW CONNECTED SESSION ' + session_id)
    _connected_sessions.append(session_id)


def add_active_session(session_id: str, username: str) -> None:
    logging.info('NEW ACTIVE SESSION ' + session_id)
    _active_sessions[session_id] = username

def get_active_username(session_id: str) :
    username = _active_sessions[session_id]
    return username

def list_sessions() -> None:
    """Prints the connected sessionIds and activeSessions to show auth handling"""
    logging.info('---SESSION-LOG to follow---')
    logging.info('Currently connected sessions: ')
    if _active_sessions != {}:
        logging.info('NONE')
    else:
        for session in _connected_sessions:
            logging.info(session)

    logging.info('Currently active (authenticated) sessions: ')
    if not _active_sessions:
        logging.info('NONE')
    else:
        for session in _active_sessions:
            logging.info(session + ' | ' + _active_sessions[session])


# Clears all connected session yet to be authenticated
def remove_connected_sessions() -> None:
    """ clears all connected sessions """
    del _connected_sessions


def remove_connected_session(session_id: str) -> bool:
    try:
        logging.debug('Removing connected session: ' + session_id)
        _connected_sessions.remove(session_id)
        return True

    except ValueError:
        return False


def active_session_exists(session_id: str) -> bool:
    """ Checks to see if there's a username assigned to a specific sessionId """
    return session_id in _active_sessions and _active_sessions[session_id] is not None


def connected_session_exists(session_id: str) -> bool:
    return session_id in _connected_sessions


def check_active_session(session_id: str, username: str) -> bool:
    """ Checks to see if an active session exists matching session_id to uername"""
    if session_id in _active_sessions:
        if _active_sessions[session_id] == username:
            print(_active_sessions[session_id])
            return True
        else:
            logging.info('SessionID / Username mismatch! (' + session_id + ',' + username + ')')
    else:
        logging.info(username + ' not logged in or session not active')

    return False


def remove_active_session(session_id: str) -> bool:
    if session_id in _active_sessions.keys():
        username = _active_sessions[session_id]
        del _active_sessions[session_id]  # Remove the sessionId from our activeSessions dict
        return True, username
    return False

""" Checks that a player with username exists and has a valid active session (logged in)
returns (bool, bool) meaning (found_player, valid_session_exists)
or that the check otherwise failed (bad data)
"""
def valid_player_session(self, username : str, session_id : str, found_player : player.Player) -> (bool, bool):
    if username and session_id and found_player is not None:
        if check_active_session(session_id, username):
            return True, True
        else:
            return True, False
    else:
        return False, False

def contains_session_json(data: dict) -> bool:
    # The client should pass this param in
    return 'sessionJson' in data and 'sessionId' in data['sessionJson'] and 'username' in data['sessionJson']

def extract_session_json(self, json_data):
    return json_data[session.SESSION_JSON_NAME]

# Returns True if there's a connected or active session
def is_sessionid_connected_or_active(self, sid):
    logging.info('Validating SID: ')
    logging.info(sid)
    if not connected_session_exists(sid) and not active_session_exists(sid):
        return False
    else:
        return True

"""
    Checks for a valid (active) session ID and proxies to the right event handler if true
    callback - the function to pass to if there's an active session
    data     - The data from SocketIO
"""
def verify_active_and_call(callback, data):

    if data is not None:
        if contains_session_json(data):
            session_json = extract_session_json(data)
            sid = session_json[session.SESSION_ID_JSON_NAME]

            if is_sessionid_connected_or_active(sid) and active_session_exists(sid):
                logging.info('Proxying event for request SID: '+sid)
                callback(data)
            else:
                logging.error('Checking for active session before proxying to: ' + callback.__name__ +
                              '.. Could not find an active session for SID: ' + sid);
        else:
            logging.error('Checking for active session before proxying to: ' + callback.__name__ +
                          '.. sessionJson not provided!');
    else:
        # + ' SocketIO Event: ' + json.dumps(request.event)
        logging.info('No data for proxy call to: ' + callback.__name__)

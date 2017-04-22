import logging

#Current connected  but unauthenticated sessions
_connected_sessions = []

#Dict mapping of session IDs to usernames once authenticated/logged_in
_active_sessions = {}

def add_connected_session(session_id : str) -> None:
    logging.info('NEW CONNECTED SESSION '+session_id)
    _connected_sessions.append(session_id)

def add_active_session(session_id : str, username : str) -> None:
    logging.info('NEW ACTIVE SESSION '+session_id)
    _active_sessions[session_id] = username

def list_sessions() -> None:
    """Prints the connected sessionIds and activeSessions to show auth handling"""
    logging.info('---SESSION-LOG to follow---')
    logging.info('Currently connected sessions: ')
    for session in _connected_sessions:
        logging.info(session)

    logging.info('Currently active (authenticated) sessions: ')
    for session in _active_sessions:
        logging.info(session+' | '+_active_sessions[session])

#Clears all connected session yet to be authenticated
def remove_connected_sessions() -> None:
    """ clears all connected sessions """
    del _connected_sessions

def remove_connected_session(session_id : str) -> bool:
    try:
        _connected_sessions.remove(session_id)
        return True

    except ValueError:
        return False

def active_session_exists(session_id : str) -> bool:
    """ Checks to see if there's a username assigned to a specific sessionId """
    return session_id in _active_sessions and _active_sessions[session_id] is not None

def check_active_session(session_id : str, username : str) -> bool:
    """ Checks to see if an active session exists matching session_id to uername"""
    if session_id in _active_sessions:
        if _active_sessions[session_id] == username:
            print(_active_sessions[session_id])
            return True
        else:
            logging.info('SessionID / Username mismatch! ('+session_id+','+username+')')
    else:
        logging.info(username+' not logged in or session not active')

    return False

def remove_active_session(session_id : str) -> bool:
    if session_id in _active_sessions.keys():
        username = _active_sessions[session_id]
        del _active_sessions[session_id] #Remove the sessionId from our activeSessions dict
        return True, username
    return False

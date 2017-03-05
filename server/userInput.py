import re

def parse_command(text) -> list:
    commandText = text.strip()
    commands = commandText.split(' ')
    return commands


def check__chat_input(text: str) -> None:
    #print("Input check for: "+text)
    print ( re.match(r"say\s[\w\s,.!()]{1,140}", text) )

    userMatch = re.match(r"user\s[\w]{1,12}\s[\w]{1,12}", text)
    chatMatch = re.match(r"say\s([\w\s,.!()?]{1,140})", text)

    #Check for user creation
    if userMatch != None:
        commands = parse_command(text)
        return {'choice':1,'data':{'username':commands[1],'charname':commands[2]} }

    elif chatMatch != None:
        message = chatMatch.group(1)
        return {'choice':2,'data':{'messageData':message} }
    else:
        return {'choice':0,'data':None}

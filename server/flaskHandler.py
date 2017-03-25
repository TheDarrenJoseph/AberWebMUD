from flask import Flask, request, render_template, session

#Create the app with our module name
_APP = Flask(__name__)

@_APP.route("/test", methods=['GET'])
def test():
    """ Returns the main HTML page
    for the application at the flask root url
    """
    return render_template('test.html')

@_APP.route("/", methods=['GET'])
def main():
    """ Returns the main HTML page
    for the application at the flask root url
    """
    return render_template('play.html')

from flask import Flask, request, render_template, session
from pyfiles.db import attributes
from pyfiles.model import characterClass

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

@_APP.route("/attributes-score-options", methods=['GET'])
def get_attributes_score_options():
    return attributes.Attributes.get_json_attribute_score_options()

@_APP.route("/attributes-class-options", methods=['GET'])
def get_attributes_class_options():
    return characterClass.CharacterClass.get_json_options()

# AberWebMUD
AberWebMUD is a university (Aberystwyth) final year Major Project.
Designed to be a MUD (themes and gameplay to be decided) thats main
focus is to be easy to play and available online without the need for
special clients.

## Build info, references, and licenses
Created with Python 3.6.0 and packaged with:
* [Pixi.js (MIT License)] (http://www.pixijs.com/)
* [Flask-SocketIO (MIT License)] (https://github.com/miguelgrinberg/Flask-SocketIO)
* [QUnit (JS Foundation License)] (http://qunitjs.com/)
* ["Zelda-like tilesets and sprites" by ArMM1998 (CC0 1.0)] (http://opengameart.org/content/zelda-like-tilesets-and-sprites)

Other technologies used:
* [Flask (BSD License)] (http://flask.pocoo.org/)
* [SocketsIO (MIT License)] (http://socket.io/)
* [PostgreSQL] (https://www.postgresql.org/)
* Texture atlas creation using ["Leshy SpriteSheet Tool - Online Sprite Sheet, Texture Atlas Packer"]
 (https://www.leshylabs.com/apps/sstool/)

Check the requirements.txt for dependancy version details
Check the LICENSE file for the project's license

## Running the project
1. Change your terminal directory to the server folder
2. You may have to ensure the JavaScript files have been concatted into the client.js file, run build.sh in the scripts folder (there's a good chance this has already been done before a Git 
commit) 
3. Run main.py in Python
4. visit 'localhost:5000' in a browser

## Postgres vs SQLite
The project currently uses an SQLite DB in-memory in order to run locally for development and demonstration.
The project can also be run with a PostgreSQL database for a scalable DB platform if deployed (adjusted in database.py), if so you must ensure the PostgreSQL database service 
is running (database.py should detail what is expected).

## Running client tests (QUnit)
Client tests are available once the server is running (main.py) at 'localhost:5000/test'

## Running server tests (unittest)
1. change directory to 'server'
2. Run: 'python -m unittest discover tests "*.py"'

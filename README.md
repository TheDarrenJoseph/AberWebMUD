# AberWebMUD
AberWebMUD is a university (Aberystwyth) final year Major Project.
Designed to be a MUD (themes and gameplay to be decided) thats main
focus is to be easy to play and available online without the need for
special clients.

## Build info, references, and licenses
Created with Python 3.6.0 and JavaScript ES6 and packaged with:
* [Pixi.js v4.3.5 and  4.3.4 (MIT License)](http://www.pixijs.com/)
* [SocketIO 1.4.5 (MIT License)](http://socket.io/)
* [jQuery 3.1.1 (MIT License)](https://jquery.com/)
* [QUnit 2.2.1 (JS Foundation License)](http://qunitjs.com/)
* ["Zelda-like tilesets and sprites" by ArMM1998 (CC0 1.0)](http://opengameart.org/content/zelda-like-tilesets-and-sprites)

Other technologies used:
* [Flask 0.12 (BSD License)](http://flask.pocoo.org/)
* [Flask-SocketIO 2.8.3 (MIT License)](https://github.com/miguelgrinberg/Flask-SocketIO)
* [PostgreSQL](https://www.postgresql.org/)
* [SQLite](https://sqlite.org/)
* [PonyORM 0.7.1 (Apache License V2.0)](https://docs.ponyorm.com/)
* ["Leshy SpriteSheet Tool - Online Sprite Sheet, Texture Atlas Packer"](https://www.leshylabs.com/apps/sstool/)

Check the requirements.txt for dependancy version details
Check the LICENSE file for the project's license

[![js-happiness-style](https://img.shields.io/badge/JS%20code%20style-happiness-brightgreen.svg)](https://github.com/JedWatson/happiness)
[![python-pylint-style](https://img.shields.io/badge/Python%20code%20style-pylint%20(PEP%208)-brightgreen.svg)](https://www.pylint.org/)

![Main Example Screenshot](example.png)

## Building the project

### Frontend
The frontend code is built using ES6 Classes, with npm for dependancies and task execution.
**gulp.js** is the main build tool in combination will **rollup.js** for source bundling.

To build the frontent client without testing:
1. Change terminal directory to `server/js-files`
2. Run `npm install` to resolve project dependancies
3. Run `npm run build` or just `gulp` to bundle the source code.

Building will create the following:
* static/main.js -- Main Client code bundle (served up as part of the main application webpage from Flask)
* static/tests.js -- Test Code, QUnit tests used by Karma or can be ran manually using the /test route
* *.js.map files  -- Source Maps for the client/test code to facilitate debugging in-browser.

Once this is built it will be served by the Python server (Flask) through the HTML pages in `server/templates/*.html`

#### Running JavaScript client tests (QUnit/Karma Runner)
1. Test code entrypoint is `server/js-files/test/main.js` this is bundled into `server/static/tests.js` with npm/gulp/rollup.
2. (Main) Run 'npm run test' to build the src/test code and execute Karma Runner testing
3. (Optional) Client tests are also available once the server is running at 'localhost:5000/test'

## Backend / Running the server
1. You first need to satisfy python's dependencies
2. Change your terminal directory to the `server` folder
3. Create a fresh Python local venv called locenv with `python -m venv locenv`, then activate it using: `source locenv/bin/activate`
4. In this venv shell run 'sudo pip install -r requirements.txt' in the `AberWebMUD` project root folder
5. Run main.py in Python with `python main.py`
6. visit 'localhost:5000' in a browser

### Running Python server tests (unittest)
1. change directory to 'server'
2. Run: 'python -m unittest discover' OR 'python -m unittest discover tests "*.py"'

## Postgres vs SQLite
The project currently uses an SQLite DB in-memory in order to run locally for development and demonstration.
The project can also be run with a PostgreSQL database for a scalable DB platform if deployed (adjusted in database.py), if so you must ensure the PostgreSQL database service
is running (database.py should detail what is expected).



export const SESSION_ID_COOKIE_NAME = 'sessionId';

class SessionModel {
	constructor () {
		// Initialise char attributes as an empty object
		this.charAtrributes = {
			str: null, dex: null, con: null, int: null, wis: null
		};

		this.charData = {
			charname: null, pos_x: null, pos_y: null, attributes: this.charAttributes, class: null, health: null, free_points: null
		};

		// Stores client session data
		// Things we'll need to communicate with the server
		this.clientSession = {
			username: null,
			sessionId: null,
			character: this.charData
		};
	};

	setCharAttributes (str, dex, con, int, wis, cha) {
		this.charAtrributes.str = str;
		this.charAtrributes.dex = dex;
		this.charAtrributes.con = con;
		this.charAtrributes.int = int;
		this.charAtrributes.wis = wis;
	}
}

var Session = new SessionModel();
export { Session };

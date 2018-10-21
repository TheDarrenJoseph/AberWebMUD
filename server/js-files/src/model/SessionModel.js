export const SESSION_ID_COOKIE_NAME = 'sessionId';

class SessionModel {
	constructor () {
		//  Local data stored for your current character
		this.charAttributes = {
			str: null,
			dex: null,
			con: null,
			int: null,
			wis: null,
			cha: null
		};

		this.charData = {
			charname: null, pos_x: null, pos_y: null, attributes: this.charAttributes, class: null, health: null, free_points: null
		};

		this.clientSession = {
			username: null,
			sessionId: null,
			character: this.charData
		};
	};

	setCharAttributes (str, dex, con, int, wis, cha) {
		this.charAtrributes.str = str;
		this.charAtrributes.str = dex;
		this.charAtrributes.str = con;
		this.charAtrributes.wis = int;
		this.charAtrributes.wis = wis;
	}
}

var session = new SessionModel();
export {session as Session};

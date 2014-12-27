/**
 * This is the file where commands get parsed
 *
 * Some parts of this code are taken from the Pokémon Showdown server code, so
 * credits also go to Guangcong Luo and other Pokémon Showdown contributors.
 * https://github.com/Zarel/Pokemon-Showdown
 *
 * @license MIT license
 */

var sys = require('sys');
var https = require('https');
var url = require('url');

const ACTION_COOLDOWN = 3*1000;
const FLOOD_MESSAGE_NUM = 5;
const FLOOD_PER_MSG_MIN = 500; // this is the minimum time between messages for legitimate spam. It's used to determine what "flooding" is caused by lag
const FLOOD_MESSAGE_TIME = 6*1000;
const MIN_CAPS_LENGTH = 18;
const MIN_CAPS_PROPORTION = 0.8;

settings = {};
try {
	settings = JSON.parse(fs.readFileSync('settings.json'));
	if (!Object.keys(settings).length && settings !== {}) settings = {};
} catch (e) {} // file doesn't exist [yet]

exports.parse = {
	actionUrl: url.parse('https://play.pokemonshowdown.com/~~' + config.serverid + '/action.php'),
	room: 'lobby',
	'settings': settings,
	chatData: {},
	formats: {},
	ranks: {},
	roomRanks: {},
	challenges: {},
	battleDatas: {},
	battleTurns: {},
	chatLog: 0,
	chatLogDay: 0,
	busyInBattle: 0,

	data: function(data, connection) {
		if (data.substr(0, 1) === 'a') {
			data = JSON.parse(data.substr(1));
			if (data instanceof Array) {
				for (var i = 0; i < data.length; i++) {
					this.message(data[i], connection);
				}
			} else {
				this.message(data, connection);
			}
		}
	},
	message: function(message, connection, lastMessage) {
		if (!message) return;
		//console.log("DATA ( ".blue + this.room.blue + "): ".blue + message);
		if (message.indexOf('\n') > -1) {
			var spl = message.split('\n');
			for (var i = 0, len = spl.length; i < len; i++) {
				if (spl[i].split('|')[1] && (spl[i].split('|')[1] === 'init' || spl[i].split('|')[1] === 'tournament')) {
					this.room = '';
					break;
				}
				this.message(spl[i], connection, i === len - 1);
			}
			return;
		}

		var spl = message.split('|');
		if (!spl[1]) {
			spl = message.split('>');
			if (spl[1]) this.room = spl[1];
			return;
		}
		if (config.logChat && this.room === config.logChat && spl[1] !== "pm") {
			//log chat
			var f = new Date();
			var fstr = toDoubleDigit(f.getDate()) + '_' + toDoubleDigit(f.getMonth() + 1) + '_' + f.getFullYear();
			if (!this.chatLog || this.chatLogDay !== fstr) {
				this.chatLog = fs.createWriteStream('logs/chatlog_' + fstr + '.log', {flags:'a+'});
				this.chatLogDay = fstr;
			}
			this.chatLog.write('[' + toDoubleDigit(f.getHours()) + ':' + toDoubleDigit(f.getMinutes()) + ':' + toDoubleDigit(f.getSeconds()) + '] ' + message + '\n');
		}
		
		switch (spl[1]) {
			case 'challstr':
				info('received challstr, logging in...');
				var id = spl[2];
				var str = spl[3];

				var requestOptions = {
					hostname: this.actionUrl.hostname,
					port: this.actionUrl.port,
					path: this.actionUrl.pathname,
					agent: false
				};

				if (!config.pass) {
					requestOptions.method = 'GET';
					requestOptions.path += '?act=getassertion&userid=' + toId(config.nick) + '&challengekeyid=' + id + '&challenge=' + str;
				} else {
					requestOptions.method = 'POST';
					var data = 'act=login&name=' + config.nick + '&pass=' + config.pass + '&challengekeyid=' + id + '&challenge=' + str;
					requestOptions.headers = {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': data.length
					};
				}

				var req = https.request(requestOptions, function(res) {
					res.setEncoding('utf8');
					var data = '';
					res.on('data', function(chunk) {
						data += chunk;
					});
					res.on('end', function() {
						if (data === ';') {
							error('failed to log in; nick is registered - invalid or no password given');
							process.exit(-1);
						}
						if (data.length < 50) {
							error('failed to log in: ' + data);
							process.exit(-1);
						}

						if (data.indexOf('heavy load') !== -1) {
							error('the login server is under heavy load; trying again in one minute');
							setTimeout(function() {
								this.message(message);
							}.bind(this), 60000);
							return;
						}

						try {
							data = JSON.parse(data.substr(1));
							if (data.actionsuccess) {
								data = data.assertion;
							} else {
								error('could not log in; action was not successful: ' + JSON.stringify(data));
								process.exit(-1);
							}
						} catch (e) {}
						send(connection, '|/trn ' + config.nick + ',0,' + data);
					}.bind(this));
				}.bind(this));

				req.on('error', function(err) {
					error('login error: ' + sys.inspect(err));
				});

				if (data) {
					req.write(data);
				}
				req.end();
				break;
			case 'updateuser':
				if (spl[2] !== config.nick) {
					return;
				}

				if (spl[3] !== '1') {
					error('failed to log in, still guest');
					process.exit(-1);
				}

				ok('logged in as ' + spl[2]);

				// Now join the rooms
				var cmds = ['|/idle'];
				for (var i in config.rooms) {
					var room = toId(config.rooms[i]);
					if (room === 'lobby' && config.serverid === 'showdown') {
						continue;
					}
					cmds.push('|/join ' + room);
				}
				for (var i in config.privaterooms) {
					var room = toId(config.privaterooms[i]);
					if (room === 'lobby' && config.serverid === 'showdown') {
						continue;
					}
					cmds.push('|/join ' + room);
				}

				var self = this;
				if (cmds.length > 4) {
					self.nextJoin = 0;
					self.joinSpacer = setInterval(function(con, cmds) {
						if (cmds.length > self.nextJoin + 3) {
							send(con, cmds.slice(self.nextJoin, self.nextJoin + 3));
							self.nextJoin += 3;
						} else {
							send(con, cmds.slice(self.nextJoin));
							delete self.nextJoin;
							clearInterval(self.joinSpacer);
						}
					}, 4*1000, connection, cmds);
				} else {
					send(connection, cmds);
				}

				this.chatDataTimer = setInterval(self.cleanChatData,
					30*60*1000
				);
				if (lastMessage) this.room = '';
				break;
			case 'updatechallenges':
				this.challenges = JSON.parse(message.substr(18));
				if (this.challenges.challengesFrom) {
					for (var i in this.challenges.challengesFrom) {
						if (!this.busyInBattle || config.acceptAll || this.roomRanks[i] || config.excepts.indexOf(i) !== -1) {
							if (!(this.challenges.challengesFrom[i] in this.formats)) {
								this.say(connection, this.room, '/reject ' + i);
								continue;
							}
							this.say(connection, this.room, '/accept ' + i);
							this.busyInBattle++;
							console.log("Random Battle: ".green + "Se ha iniciado una batalla automatica contra " + i);
						} else {
							this.say(connection, this.room, '/reject ' + i);
							continue;
						}
					}
				}
				if (lastMessage) this.room = '';
				break;
			case 'title':
				ok('joined ' + spl[2]);
				if (lastMessage) this.room = '';
				break;
			case 'start':
				this.processBattle(this.room, connection);
				if (lastMessage) this.room = '';
				break;
			case 'teampreview':
				if (this.battleDatas[this.room]) this.battleDatas[this.room].nTPV = spl[2];
				this.processBattle(this.room, connection);
				this.moveBattle(this.room, connection);
				break;
			case 'win':
				if (this.battleDatas[this.room]) delete this.battleDatas[this.room];
				if (this.battleTurns[this.room]) delete this.battleTurns[this.room];
				this.busyInBattle--;
				this.say(connection, this.room, '/leave');
				if (lastMessage) this.room = '';
				break;
			case 'request':
				if (!this.battleTurns[this.room]) this.battleTurns[this.room] = 0;
				try {
					this.battleDatas[this.room] = JSON.parse(message.substr(9));
				} catch (e){}
				this.battleTurns[this.room]++;
				this.moveBattle(this.room, connection);
				if (lastMessage) this.room = '';
				break;
			case 'inactive':
				this.moveBattle(this.room, connection);
				if (lastMessage) this.room = '';
				break;
			case 'c':
				var by = spl[2];
				spl.splice(0, 3);
				this.processChatData(by, this.room || 'lobby', connection, spl.join('|'));
				if (this.room && this.isBlacklisted(toId(by), this.room)) this.say(connection, this.room, '/roomban ' + by + ', Usuario baneado permanentemente');
				this.chatMessage(spl.join('|'), by, this.room || 'lobby', connection);
				if (lastMessage) this.room = '';
				break;
			case 'c:':
				var by = spl[3];
				spl.splice(0, 4);
				this.processChatData(by, this.room || 'lobby', connection, spl.join('|'));
				if (this.room && this.isBlacklisted(toId(by), this.room)) this.say(connection, this.room, '/roomban ' + by + ', Usuario baneado permanentemente');
				this.chatMessage(spl.join('|'), by, this.room || 'lobby', connection);
				if (lastMessage) this.room = '';
				break;
			case 'popup':
				if (toId(message.substr(7,4)) === 'room') {
					var _message = message.replace("Moderators", ":");
					_message = _message.replace("Drivers", ":");
					_message = _message.replace("Voices", ":");
					var parts = _message.split(':');
					var rank = " ";
					var usersList;
					for (var i = 0; i < parts.length; i+=2) {
						usersList = parts[i+1].split(',');
						if (parts[i].indexOf("(") > -1) rank = parts[i].substr(parts[i].indexOf("(") + 1, 1);
						for (var f = 0; f < usersList.length;f++) this.roomRanks[toId(usersList[f])] = rank;
					}
					console.log("DATA: ".cyan + " Lista de auth leida con exito");
					console.log("AUTH: ".cyan + JSON.stringify(this.roomRanks));
				}
				if (lastMessage) this.room = '';
				break;
			case 'formats':
				var dataFormat;
				this.formats = {};
				for (var i = 1; i < spl.length; i++) {
					if (!spl[i]) continue;
					dataFormat = spl[i].split(',');
					if (spl[i].indexOf("#") > -1) {
						this.formats[toId(dataFormat[0])] = 1;
					}
				}
				break;
			case 'pm':
				var by = spl[2];
				if (by.substr(1) === config.nick) {
					if (lastMessage) this.room = '';
					return;
				}
				spl.splice(0, 4);
				this.chatMessage(spl.join('|'), by, ',' + by, connection);
				if (lastMessage) this.room = '';
				break;
			case 'N':
				var by = spl[2];
				this.updateSeen(spl[3], spl[1], by);
				if (toId(by) !== toId(config.nick) || ' +%@&#~'.indexOf(by.charAt(0)) === -1) {
					if (lastMessage) this.room = '';
					return;
				}
				this.ranks[this.room || 'lobby'] = by.charAt(0);
				if (lastMessage) this.room = '';
				break;
			case 'J': case 'j':
				var by = spl[2];
				if (this.room && this.isBlacklisted(toId(by), this.room)) this.say(connection, this.room, '/roomban ' + by + ', Usuario baneado permanentemente');
				this.updateSeen(by, spl[1], this.room || 'lobby');
				if (toId(by) !== toId(config.nick) || ' +%@&#~'.indexOf(by.charAt(0)) === -1) {
					if (lastMessage) this.room = '';
					return;
				}
				this.ranks[this.room || 'lobby'] = by.charAt(0);
				if (lastMessage) this.room = '';
				break;
			case 'l': case 'L':
				var by = spl[2];
				this.updateSeen(by, spl[1], this.room || 'lobby');
				if (lastMessage) this.room = '';
				break;
			default:
				//console.log("DATA ( ".blue + this.room.blue + "): ".blue + message);
				if (lastMessage) this.room = '';
		}
	},
	chatMessage: function(message, by, room, connection) {
		var cmdrMessage = '["' + room + '|' + by + '|' + message + '"]';
		message = message.trim();
		// auto accept invitations to rooms
		if (room.charAt(0) === ',' && message.substr(0,8) === '/invite ' && this.hasRank(by, '~') && !(config.serverid === 'showdown' && toId(message.substr(8)) === 'lobby')) {
			this.say(connection, '', '/join ' + message.substr(8));
		}
		if (message.substr(0, config.commandcharacter.length) !== config.commandcharacter || toId(by) === toId(config.nick)) {
			return;
		}

		message = message.substr(config.commandcharacter.length);
		var index = message.indexOf(' ');
		var arg = '';
		if (index > -1) {
			var cmd = message.substr(0, index);
			arg = message.substr(index + 1).trim();
		} else {
			var cmd = message;
		}

		if (Commands[cmd]) {
			var failsafe = 0;
			while (typeof Commands[cmd] !== "function" && failsafe++ < 10) {
				cmd = Commands[cmd];
			}
			if (typeof Commands[cmd] === "function") {
				cmdr(cmdrMessage);
				Commands[cmd].call(this, arg, by, room, connection);
			} else {
				error("invalid command type for " + cmd + ": " + (typeof Commands[cmd]));
			}
		}
	},
	say: function(connection, room, text) {
		if (room.substr(0, 1) !== ',') {
			var str = (room !== 'lobby' ? room : '') + '|' + text;
			send(connection, str);
		} else {
			room = room.substr(1);
			var str = '|/pm ' + room + ', ' + text;
			send(connection, str);
		}
	},
	hasRank: function(user, rank) {
		if (this.roomRanks[toId(user)]) {
			if (rank.indexOf(this.roomRanks[toId(user)]) > -1) return true;
		}
		var hasRank = (rank.split('').indexOf(user.charAt(0)) !== -1) || (config.excepts.indexOf(toId(user.substr(1))) !== -1);
		return hasRank;
	},
	canUse: function(cmd, room, user) {
		var canUse = false;
		var ranks = ' +%@&#~';
		if (!this.settings[cmd] || !(room in this.settings[cmd])) {
			canUse = this.hasRank(user, ranks.substr(ranks.indexOf((cmd === 'autoban' || cmd === 'banword') ? '#' : config.defaultrank)));
		} else if (this.settings[cmd][room] === true) {
			canUse = true;
		} else if (ranks.indexOf(this.settings[cmd][room]) > -1) {
			canUse = this.hasRank(user, ranks.substr(ranks.indexOf(this.settings[cmd][room])));
		}
		return canUse;
	},
	isBlacklisted: function(user, room) {
		return (this.settings.blacklist && this.settings.blacklist[room] && this.settings.blacklist[room][user]);
	},
	blacklistUser: function(user, room) {
		if (!this.settings['blacklist']) this.settings['blacklist'] = {};
		if (!this.settings.blacklist[room]) this.settings.blacklist[room] = {};

		if (this.settings.blacklist[room][user]) return false;
		this.settings.blacklist[room][user] = 1;
		return true;
	},
	unblacklistUser: function(user, room) {
		if (!this.isBlacklisted(user, room)) return false;
		delete this.settings.blacklist[room][user];
		return true;
	},
		isBlacklisted: function(user, room) {
		return (this.settings.blacklist && this.settings.blacklist[room] && this.settings.blacklist[room][user]);
	},
	isZeroTol: function(user, room) {
		return (this.settings.zerotol && this.settings.zerotol[room] && this.settings.zerotol[room][user]);
	},
	zeroTolUser: function(user, room) {
		if (!this.settings['zerotol']) this.settings['zerotol'] = {};
		if (!this.settings.zerotol[room]) this.settings.zerotol[room] = {};

		if (this.settings.zerotol[room][user]) return false;
		this.settings.zerotol[room][user] = 1;
		return true;
	},
	unzeroTolUser: function(user, room) {
		if (!this.isZeroTol(user, room)) return false;
		delete this.settings.zerotol[room][user];
		return true;
	},
	uploadToHastebin: function(con, room, by, toUpload) {
		var self = this;

		var reqOpts = {
			hostname: "hastebin.com",
			method: "POST",
			path: '/documents'
		};

		var req = require('http').request(reqOpts, function(res) {
			res.on('data', function(chunk) {
				self.say(con, room, (room.charAt(0) === ',' ? "" : "/pm " + by + ", ") + "hastebin.com/raw/" + JSON.parse(chunk.toString())['key']);
			});
		});

		req.write(toUpload);
		req.end();
	},
	processChatData: function(user, room, connection, msg) {
		// NOTE: this is still in early stages
		var is_staff = false;
		if (room.indexOf("battle") > -1) return;
		if (toId(user.substr(1)) === toId(config.nick)) {
			this.ranks[room] = user.charAt(0);
			return;
		}
		if (this.hasRank(user, "%@&#~")) is_staff = true;
		user = toId(user);
		if (!user || room.charAt(0) === ',') return;
		room = toId(room);
		msg = msg.trim().replace(/[ \u0000\u200B-\u200F]+/g, " "); // removes extra spaces and null characters so messages that should trigger stretching do so
		this.updateSeen(user, 'c', room);
		var time = Date.now();
		if (!this.chatData[user]) this.chatData[user] = {
			zeroTol: 0,
			lastSeen: '',
			seenAt: time
		};
		var chatData = this.chatData[user];
		if (!chatData[room]) chatData[room] = {times:[], points:0, lastAction:0};
		chatData = chatData[room];

		chatData.times.push(time);

		// this deals with punishing rulebreakers, but note that the bot can't think, so it might make mistakes
		if (config.allowmute && this.hasRank(this.ranks[room] || ' ', '%@&#~') && config.whitelist.indexOf(user) === -1 && !is_staff) {
			var useDefault = !(this.settings['modding'] && this.settings['modding'][room]);
			var pointVal = 0;
			var muteMessage = '';
			var modSettings = useDefault ? null : this.settings['modding'][room];

			// moderation for spamming "snen" multiple times on a line (a la the snen spammer)
			var snenMatch = msg.toLowerCase().match(/snen/g);
			if ((useDefault || modSettings['snen'] !== 0) && snenMatch && snenMatch.length > 6) {
				if (pointVal < 4) {
					muteMessage = ', Moderación automática: Detectado spammer tipo "snen" Reglas: http://bit.ly/1abNG5E';
					pointVal = (room === 'lobby') ? 5 : 4;
				}
			}
			// moderation for spoiler
			if (useDefault || modSettings['spoiler'] !== 0 && pointVal < 2) {
				if (msg.toLowerCase().indexOf("spoiler:") > -1 || msg.toLowerCase().indexOf("spoilers:") > -1) {
					pointVal = 2;
					muteMessage = ', Moderación automática: Los spoilers no están permitidos Reglas: http://bit.ly/1abNG5E';
				}
			}
			// moderation for banned words
			if (useDefault || modSettings['bannedwords'] !== 0 && pointVal < 2) {
				var banphraseSettings = this.settings.bannedphrases;
				var bannedPhrases = !!banphraseSettings ? (Object.keys(banphraseSettings[room] || {})).concat(Object.keys(banphraseSettings['global'] || {})) : [];
				for (var i = 0; i < bannedPhrases.length; i++) {
					if (msg.toLowerCase().indexOf(bannedPhrases[i]) > -1) {
						pointVal = 2;
						muteMessage = ', Moderación automática: Su mensaje contiene una frase prohibida Reglas: http://bit.ly/1abNG5E';
						break;
					}
				}
			}
			// moderation for flooding (more than x lines in y seconds)
			var times = chatData.times;
			var isFlooding = (times.length >= FLOOD_MESSAGE_NUM && (time - times[times.length - FLOOD_MESSAGE_NUM]) < FLOOD_MESSAGE_TIME
				&& (time - times[times.length - FLOOD_MESSAGE_NUM]) > (FLOOD_PER_MSG_MIN * FLOOD_MESSAGE_NUM));
			if ((useDefault || modSettings['flooding'] !== 0) && isFlooding) {
				if (pointVal < 2) {
					pointVal = 2;
					muteMessage = ', Moderación automática: Flood Reglas: http://bit.ly/1abNG5E';
				}
			}
			// moderation for caps (over x% of the letters in a line of y characters are capital)
			var capsMatch = msg.replace(/[^A-Za-z]/g, '').match(/[A-Z]/g);
			if ((useDefault || modSettings['caps'] !== 0) && capsMatch && toId(msg).length > MIN_CAPS_LENGTH && (capsMatch.length >= Math.floor(toId(msg).length * MIN_CAPS_PROPORTION))) {
				if (pointVal < 1) {
					pointVal = 1;
					muteMessage = ', Moderación automática: Uso excesivo de las mayúsculas Reglas: http://bit.ly/1abNG5E';
				}
			}
			// moderation for stretching (over x consecutive characters in the message are the same)
			var stretchMatch = msg.toLowerCase().match(/(.)\1{7,}/g) || msg.toLowerCase().match(/(..+)\1{4,}/g); // matches the same character (or group of characters) 8 (or 5) or more times in a row
			if ((useDefault || modSettings['stretching'] !== 0) && stretchMatch) {
				if (pointVal < 1) {
					pointVal = 1;
					muteMessage = ', Moderación automática: Alargar demasiado las palabras Reglas: http://bit.ly/1abNG5E';
				}
			}

			if (pointVal > 0 && !(time - chatData.lastAction < ACTION_COOLDOWN)) {
				var cmd = 'mute';
				// defaults to the next punishment in config.punishVals instead of repeating the same action (so a second warn-worthy
				// offence would result in a mute instead of a warn, and the third an hourmute, etc)
				if (chatData.points >= pointVal && pointVal < 4) {
					chatData.points++;
					cmd = config.punishvals[chatData.points] || cmd;
				} else { // if the action hasn't been done before (is worth more points) it will be the one picked
					cmd = config.punishvals[pointVal] || cmd;
					chatData.points = pointVal; // next action will be one level higher than this one (in most cases)
				}
				if (config.privaterooms.indexOf(room) >= 0 && cmd === 'warn') cmd = 'mute'; // can't warn in private rooms
				// if the bot has % and not @, it will default to hourmuting as its highest level of punishment instead of roombanning
				if (chatData.points >= 4 && !this.hasRank(this.ranks[room] || ' ', '@&#~')) cmd = 'hourmute';
				if (this.isZeroTol(toId(user), room)) { // if zero tolerance users break a rule they get an instant roomban or hourmute
					muteMessage = ', Tolerancia cero. Reglas: http://bit.ly/1abNG5E';
					cmd = this.hasRank(this.ranks[room] || ' ', '@&#~') ? 'roomban' : 'hourmute';
				}
				if (chatData.points >= 2) this.chatData[user].zeroTol++; // getting muted or higher increases your zero tolerance level (warns do not)
				chatData.lastAction = time;
				this.say(connection, room, '/' + cmd + ' ' + user + muteMessage);
			}
		}
	},
	processBattle: function(room, connection) {
		this.say(connection, room, '/timer on');
	},
	moveBattle: function(room, connection) {
		//make battle decisions
		var turn = this.battleTurns[room];
		var self = this;
		var dataType = this.battleDatas[room];
		if (!dataType) return;
		if (dataType.active) {
			//decision
			var dt = Math.floor(4 * Math.random()) + 1;
			if (dataType.side.pokemon[0].canMegaEvo) {
				dt = dt + " mega";	//megaEvo
			}
			if (Math.floor(10 * Math.random()) + 1 > 2) {
				setTimeout(function () {
					if (self.battleTurns[room] && turn === self.battleTurns[room]) self.say(connection, room, '/move ' + dt);
				}, 1000 * 3); 
			} else {
				var pokeL = 0;
				var posibbles = [];
				for (var j = 0; j < dataType.side.pokemon.length; j++ ) {
					if (dataType.side.pokemon[j].condition !== '0 fnt') {
						posibbles.push(j + 1);
						pokeL++;
					}
				}
				posibbles.randomize();
				if (pokeL) {
					setTimeout(function () {
					if (self.battleTurns[room] && turn === self.battleTurns[room]) self.say(connection, room, '/sw ' + posibbles[Math.floor(pokeL * Math.random())]);
					}, 1000 * 3); 
				} else {
					setTimeout(function () {
					self.say(connection, room, '/move ' + dt);
					}, 1000 * 3); 
				}
			}
		} else if (dataType.forceSwitch) {
				var pokeL = 0;
				var posibbles = [];
				for (var j = 0; j < dataType.side.pokemon.length; j++ ) {
					if (dataType.side.pokemon[j].condition !== '0 fnt') {
						posibbles.push(j + 1);
						pokeL++;
					}
				}
				posibbles.randomize();
				if (pokeL) {
					setTimeout(function () {
					if (self.battleTurns[room] && turn === self.battleTurns[room]) self.say(connection, room, '/sw ' + posibbles[Math.floor(pokeL * Math.random())]);
					}, 1000 * 3); 
				}
		} else if (dataType.nTPV || dataType.teamPreview) {
			var teamPreData = [];
			var dt3 = "";
			for (var i = 1; i < 7; i++) teamPreData.push(i);
			self.say(connection, room, '/team ' + teamPreData.randomize().join("") + "|1");
		}
	},
	cleanChatData: function () {
		var chatData = this.chatData;
		for (var user in chatData) {
			for (var room in chatData[user]) {
				var user = chatData[user][room];
				if (!user || !user.times || !user.times.length) {
					delete chatData[user][room];
					continue;
				}
				var newTimes = [];
				var now = Date.now();
				var times = user.times;
				for (var i = 0, len = times.length; i < len; i++) {
					if (now - times[i] < 24 * 60 * 60 * 1000) newTimes.push(times[i]);
				}
				newTimes.sort(function (a, b) { return a - b; });
				chatData.times = newTimes;
				if (chatData.points > 0 && chatData.points < 4) chatData.points--;
			}
		}
	},

	updateSeen: function(user, type, detail) {
		user = toId(user);
		type = toId(type);
		if (type !== 'n' && config.rooms.indexOf(detail) === -1 || config.privaterooms.indexOf(toId(detail)) > -1) return;
		var time = Date.now();
		if (!this.chatData[user]) this.chatData[user] = {
			zeroTol: 0,
			lastSeen: '',
			seenAt: time
		};
		if (!detail) return;
		var msg = '';
		switch (type) {
		case 'j':
			msg += 'entrando en ';
			break;
		case 'l':
			msg += 'abandonando ';
			break;
		case 'c':
			msg += 'chateando en ';
			break;
		case 'n':
			msg += 'cambiándose el nick a ';
			if (detail.charAt(0) !== ' ') detail = detail.substr(1);
			break;
		}
		msg += detail.trim() + '.';
		this.chatData[user].lastSeen = msg;
		this.chatData[user].seenAt = time;
	},
	getTimeAgo: function(time) {
		time = Date.now() - time;
		time = Math.round(time/1000); // rounds to nearest second
		var seconds = time%60;
		var times = [];
		if (seconds) times.push(String(seconds) + (seconds === 1?' segundo':' segundos'));
		var minutes, hours, days;
		if (time >= 60) {
			time = (time - seconds)/60; // converts to minutes
			minutes = time%60;
			if (minutes) times = [String(minutes) + (minutes === 1?' minuto':' minutos')].concat(times);
			if (time >= 60) {
				time = (time - minutes)/60; // converts to hours
				hours = time%24;
				if (hours) times = [String(hours) + (hours === 1?' hora':' horas')].concat(times);
				if (time >= 24) {
					days = (time - hours)/24; // you can probably guess this one
					if (days) times = [String(days) + (days === 1?' día':' días')].concat(times);
				}
			}
		}
		if (!times.length) times.push('0 segundos');
		return times.join(', ');
	},
	writeSettings: (function() {
		var writing = false;
		var writePending = false; // whether or not a new write is pending
		var finishWriting = function() {
			writing = false;
			if (writePending) {
				writePending = false;
				this.writeSettings();
			}
		};
		return function() {
			if (writing) {
				writePending = true;
				return;
			}
			writing = true;
			var data = JSON.stringify(this.settings);
			fs.writeFile('settings.json.0', data, function() {
				// rename is atomic on POSIX, but will throw an error on Windows
				fs.rename('settings.json.0', 'settings.json', function(err) {
					if (err) {
						// This should only happen on Windows.
						fs.writeFile('settings.json', data, finishWriting);
						return;
					}
					finishWriting();
				});
			});
		};
	})(),
	uncacheTree: function(root) {
		var uncache = [require.resolve(root)];
		do {
			var newuncache = [];
			for (var i = 0; i < uncache.length; ++i) {
				if (require.cache[uncache[i]]) {
					newuncache.push.apply(newuncache,
						require.cache[uncache[i]].children.map(function(module) {
							return module.filename;
						})
					);
					delete require.cache[uncache[i]];
				}
			}
			uncache = newuncache;
		} while (uncache.length > 0);
	}
};

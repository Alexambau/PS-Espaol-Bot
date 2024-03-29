﻿/**
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
	tours: {},
	teams: {},
	roomRanks: {},
	staffRanks: {},
	challenges: {},
	RP: {},
	roomLogs: {},
	tourData: {},
	ratedRoom: 0,
	chatLog: {},
	chatLogDay: {},
	busyInBattle: 0,
	recentPMInfo: {},
	sicCache: '',
	users: {},
	game: {},

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
				if (spl[i].split('|')[1] && (spl[i].split('|')[1] === 'init')) {
					this.message(spl[i], connection, i === len - 1);
					if (spl[i + 1]) this.message(spl[i + 1], connection, i === len - 1);
					if (spl[i + 2]) this.message(spl[i + 2], connection, i === len - 1);
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
			if (spl[1]) {
				this.room = spl[1];
				return;
			} else {
				spl = ['', 'raw', message];
			}
		}
		if (this.tours && this.tours[this.room] && !this.tours[this.room].started) {
			var fTime = Date.now();
			if ((fTime - this.tours[this.room].now) > this.tours[this.room].timeout) {
				this.tours[this.room].started = true;
				this.tours[this.room].maxPlayers = 1;
				this.say(connection, this.room, '/tour start');
				this.say(connection, this.room, '/tour autodq ' + this.tours[this.room].autodq);
				if (spl[1] === "tournament" && spl[2] && spl[2] === "join") {
					if (this.tours && this.tours[this.room]) {
						this.tours[this.room].players++;
					}
					return;
				}
			}
		}
		
		/* Battle Bot */
		try {
			if (this.room && this.room.indexOf("battle-") > -1) BattleBot.receive(connection, this.room, message);
		} catch (e) {
			error(e.stack);
		}
		
		/* Rest of Majors */
		switch (spl[1]) {
			case 'challstr':
				info('received challstr, logging in...');
				global.loggedin = false;
				
				setTimeout(function() {
					if (!global.loggedin) {
						error('log in timeout, trying again...');
						this.message(message, connection, lastMessage);
					}
				}.bind(this), 30000);
				
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
								this.message(message, connection, lastMessage);
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
						info('Sending log in data...');
						send(connection, '|/trn ' + config.nick + ',0,' + data);
					}.bind(this));
				}.bind(this));

				req.on('error', function(err) {
					error('login error: ' + sys.inspect(err));
					process.exit(-1);
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
				global.loggedin = true;
				this.tourData = {}; //delete possible residual tour data
				this.tours = {};
				
				BattleBot.clearData(); //delete possible residual battle data
				
				var datenow = Date.now();
				
				if (!config.disableDownload) {
					var formats = fs.createWriteStream("formats.js");
					https.get("https://play.pokemonshowdown.com/data/formats.js?" + datenow, function(res) {
						res.pipe(formats);
					});
					var formatsdata = fs.createWriteStream("formats-data.js");
					https.get("https://play.pokemonshowdown.com/data/formats-data.js?" + datenow, function(res) {
						res.pipe(formatsdata);
					});
					var pokedex = fs.createWriteStream("pokedex.js");
					https.get("https://play.pokemonshowdown.com/data/pokedex.js?" + datenow, function(res) {
						res.pipe(pokedex);
					});
					var moves = fs.createWriteStream("moves.js");
					https.get("https://play.pokemonshowdown.com/data/moves.js?" + datenow, function(res) {
						res.pipe(moves);
					});
					var abilities = fs.createWriteStream("abilities.js");
					https.get("https://play.pokemonshowdown.com/data/abilities.js?" + datenow, function(res) {
						res.pipe(abilities);
					});
					var items = fs.createWriteStream("items.js");
					https.get("https://play.pokemonshowdown.com/data/items.js?" + datenow, function(res) {
						res.pipe(items);
					});
					var learnsets = fs.createWriteStream("learnsets-g6.js");
					https.get("https://play.pokemonshowdown.com/data/learnsets-g6.js?" + datenow, function(res) {
						res.pipe(learnsets);
					});
					var aliases = fs.createWriteStream("aliases.js");
					https.get("https://play.pokemonshowdown.com/data/aliases.js?" + datenow, function(res) {
						res.pipe(aliases);
					});
				}
				
				BattleBot.teamBuilder.loadTeamList();

				// Now join the rooms
				var cmds = []; 
				//cmds.push('|/idle');

				for (var i in config.rooms) {
					var room = toId(config.rooms[i]);
					if (room === 'lobby' && config.serverid === 'showdown') {
						continue;
					}
					cmds.push('|/join ' + room);
				}
				
				if (config.rprooms) {
					for (var i = 0; i < config.rprooms.length; i++) {
						this.RP[toId(config.rprooms[i])] = {};
					}
				}

				for (var i in config.privaterooms) {
					var room = toId(config.privaterooms[i]);
					if (room === 'lobby' && config.serverid === 'showdown') {
						continue;
					}
					cmds.push('|/join ' + room);
				}
				
				global.staffpopup = true;
				this.staffRanks = {};
				cmds.push('salastaff|/roomauth'); //get staff
				cmds.push('|/avatar 120'); //set avatar
	
				var self = this;
				if (cmds.length > 3) {
					self.nextJoin = 0;
					self.joinSpacer = setInterval(function(con, cmds) {
						if (cmds.length > self.nextJoin + 2) {
							send(con, cmds.slice(self.nextJoin, self.nextJoin + 2));
							self.nextJoin += 2;
						} else {
							send(con, cmds.slice(self.nextJoin));
							delete self.nextJoin;
							clearInterval(self.joinSpacer);
						}
					}, 2*1000, connection, cmds);
				} else {
					send(connection, cmds);
				}

				if (this.chatDataTimer) {
					try {
						clearInterval(this.chatDataTimer);
						console.log("Borrado Time-Interval");
					}catch (e) {
						error('failed: ' + sys.inspect(e));
					};
				}
				
				this.chatDataTimer = setInterval(self.cleanChatData,
					30*60*1000
				);
				
				if (this.checkToursTimeout) {
					try {
						clearTimeout(this.checkToursTimeout);
						console.log("Borrado Timeout");
					}catch (e) {
						error('failed: ' + sys.inspect(e));
					};
				}
				ResourceMonitor.connection = connection;
				this.checkTours(connection);
				if (lastMessage) this.room = '';
				break;
			case 'updatechallenges':
				this.challenges = JSON.parse(message.substr(18));
				if (this.challenges.challengesFrom) {
					for (var i in this.challenges.challengesFrom) {
						if (BattleBot.canAccept(i, this.roomRanks)) {
							if (!(this.challenges.challengesFrom[i] in this.formats) && !BattleBot.teamBuilder.hasTeam(this.challenges.challengesFrom[i])) {
								this.say(connection, this.room, '/reject ' + i);
								continue;
							}
							var team = BattleBot.teamBuilder.getTeam(this.challenges.challengesFrom[i]);
							if (team) {
								this.say(connection, this.room, '/useteam ' + team);
							}
							this.say(connection, this.room, '/accept ' + i);
							this.busyInBattle++;
							debug("acepted battle: " + i + " | " + this.challenges.challengesFrom[i]);
						} else {
							this.say(connection, this.room, '/reject ' + i);
							debug("rejected battle: " + i + " | " + this.challenges.challengesFrom[i]);
							continue;
						}
					}
				}
				if (lastMessage) this.room = '';
				break;
			case 'title':
				if (this.room && this.room.indexOf("battle-") > -1) debug('joined battle: ' + spl[2]);
				else ok('joined ' + spl[2]);
				if (lastMessage) this.room = '';
				break;
			case 'users':
				if (this.room !== 'salastaff') {
					if (lastMessage) this.room = '';
					break;
				}
				var userArray = message.substr(7).split(",");
				this.users[this.room] = {};
				for (var i = 1; i < userArray.length; i++) {
					this.users[this.room][toId(userArray[i])] = userArray[i].trim().charAt(0);
				}
				//console.log("Usuarios [" + this.room + "] => " + JSON.stringify(this.users[this.room]));
				if (lastMessage) this.room = '';
				break;
			case 'rated':
				if (this.ratedRoom) this.say(connection, this.ratedRoom, 'http://play.pokemonshowdown.com/' + this.room);
				if (lastMessage) this.room = '';
				break;
			case 'deinit':
				if (this.room && this.room.indexOf("battle-") > -1) this.busyInBattle--;
				if (this.busyInBattle < 0) this.busyInBattle = 0;
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
				var timeOffSet = parseInt(spl[2]) * 1000;
				spl.splice(0, 4);
				this.processChatData(by, this.room || 'lobby', connection, spl.join('|'), timeOffSet);
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
						for (var f = 0; f < usersList.length;f++) {
							if (!global.staffpopup) this.roomRanks[toId(usersList[f])] = rank;
							else this.staffRanks[toId(usersList[f])] = rank;
						}
					}
					global.staffpopup = false;
				}
				if (lastMessage) this.room = '';
				break;
			case 'formats':
				var dataFormat;
				this.formats = {};
				this.tourFormats = {};
				for (var i = 1; i < spl.length; i++) {
					if (!spl[i]) continue;
					dataFormat = spl[i].split(',');
					if (spl[i].indexOf("#") > -1) {
						this.formats[toId(dataFormat[0])] = 1;
					}
					this.tourFormats[toId(dataFormat[0])] = 1;
				}
				break;
			case 'tournament':
				if (!this.tourData[this.room]) this.tourData[this.room] = {};
				switch (spl[2]) {
					case 'join':
						if (this.tours && this.tours[this.room]) {
							this.tours[this.room].players++;
							if (!this.tours[this.room].started && this.tours[this.room].maxPlayers && (this.tours[this.room].players >= this.tours[this.room].maxPlayers)) {
								this.say(connection, this.room, '/tour start');
								this.say(connection, this.room, '/tour autodq ' + this.tours[this.room].autodq);
							}
						}
						break;
					case 'leave':
						if (this.tours && this.tours[this.room]) this.tours[this.room].players--;
						break;
					case 'update':
						try {
							var tourData = JSON.parse(spl[3]);
							for (var i in tourData)
								this.tourData[this.room][i] = tourData[i];
						} catch (e){}
						break;
					case 'updateEnd':
						if (this.settings && this.settings.jointours && this.settings.jointours[this.room] && this.tourData[this.room].format && !this.tourData[this.room].isJoined && !this.tourData[this.room].isStarted) {
							if (toId(this.tourData[this.room].format) in this.formats) {
								this.say(connection, this.room, '/tour join');
							} else {
								if (BattleBot.teamBuilder.hasTeam(this.tourData[this.room].format)) this.say(connection, this.room, '/tour join');
							}
						}
						if (this.tourData[this.room].challenges && this.tourData[this.room].challenges.length) {
							var team = BattleBot.teamBuilder.getTeam(this.tourData[this.room].format);
							if (team) this.say(connection, this.room, '/useteam ' + team);
							for (var i = 0; i < this.tourData[this.room].challenges.length; i++) this.say(connection, this.room, '/tour challenge ' + this.tourData[this.room].challenges[i]);
						} else if (this.tourData[this.room].challenged) {
							var team = BattleBot.teamBuilder.getTeam(this.tourData[this.room].format);
							if (team) this.say(connection, this.room, '/useteam ' + team);
							this.say(connection, this.room, '/tour acceptchallenge');
						}
						break;
					case 'end':
						try {
							if (this.tours && this.tours[this.room] && this.tours[this.room].isRated) {
								var tourData = JSON.parse(spl[3]);
								var winner = tourData.results[0][0];
								var results = parseTourTree(tourData.bracketData.rootNode);
								for (var k in results) {
									//if (results[k] === eTourConfig.pointsWinner && toId(k) !== toId(winner)) results[k]--;
									this.addTourPoints(k, results[k] * eTourConfig.onroundwin);
								}
								this.addTourPoints(winner, eTourConfig.onwin);
								this.writeSettings();
								this.say(connection, this.room, '/wall Felicidades a ' + winner + " por ganar el torneo: " + eTourStatus.actualTour.name + "!");
								this.updateTourTable(connection, this.room);
							}
						} catch (e){error('failed to load tour data: ' + sys.inspect(e));}
					case 'forceend':
						if (this.tours && this.tours[this.room] && this.tours[this.room].isRated) {
							eTourStatus.actualTour = 0;
						}
						if (this.tourData[this.room]) delete this.tourData[this.room];
						if (this.tours && this.tours[this.room]) delete this.tours[this.room];
						break;
				}
				if (lastMessage) this.room = '';
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
				if (this.room && this.isBlacklisted(toId(by), this.room)) {
					this.say(connection, this.room, '/roomban ' + by + ', Usuario baneado permanentemente');
					setTimeout(function() {
						ResourceMonitor.log("**" + toId(by) + "** fue baneado (Permaban) al entrar cambiadose el nick desde el atl **" + spl[3] + "**", "ab");
					}, 1000);
					
				}
				if (!this.settings.blockinvite) {
					if (toId(this.room) === 'espaol' && this.staffRanks[toId(by)] && (!this.users['salastaff'] || (!this.users['salastaff'][toId(by)] && !this.users['salastaff'][toId(spl[3])]))) {
						if (toId(by) !== toId(spl[3])) this.say(connection, '', '/invite ' + by + ', salastaff');
					}
				}
				if (this.users[this.room] && this.users[this.room][toId(spl[3])]) {
					delete this.users[this.room][toId(spl[3])];
					this.users[this.room][toId(by)] = by.charAt(0);
				}
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
				if (!this.settings.blockinvite) {
					if (toId(this.room) === 'espaol' && this.staffRanks[toId(by)] && (!this.users['salastaff'] || !this.users['salastaff'][toId(by)])) {
						this.say(connection, this.room, '/invite ' + by + ', salastaff');
					}
				}
				if (this.users[this.room]) {
					this.users[this.room][toId(by)] = by.charAt(0);
				}
				if ((!this.settings.disjoinphrases || !this.settings.disjoinphrases[this.room]) && this.room && this.settings.joinphrases && this.settings.joinphrases[this.room] && this.settings.joinphrases[this.room][toId(by)]) {
					this.say(connection, this.room, this.settings.joinphrases[this.room][toId(by)]);
				} else if ((!this.settings.disjoinphrases || !this.settings.disjoinphrases[this.room]) && this.room && this.settings.joinphrases && this.settings.joinphrases['global'] && this.settings.joinphrases['global'][toId(by)]) {
					this.say(connection, this.room, this.settings.joinphrases['global'][toId(by)]);
				}
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
				if (this.users[this.room] && this.users[this.room][toId(by)]) {
					delete this.users[this.room][toId(by)];
				}
				this.updateSeen(by, spl[1], this.room || 'lobby');
				if (lastMessage) this.room = '';
				break;
			case 'raw':
				if (this.room === 'salastaff') {
					if (spl[2].indexOf(" was promoted ") > -1 || spl[2].indexOf(" was demoted ") > -1) global.STAFF_CHANGES_FLAG = true;
					break;
				}
				var indexwarn = spl[2].indexOf(" was warned by ");
				var indexmute = spl[2].indexOf(" was muted by ");
				if (indexmute !== -1) {
					var mutemsg = spl[2].split(" was muted by ");
					if (mutemsg.length > 1 && mutemsg[1].indexOf(config.nick) === -1) {
						var zt = this.isZeroTol(toId(mutemsg[0]), this.room);
						if (zt && zt !== 'low') {
							if (zt === 'normal') {
								if (spl[2].indexOf("for 7 minutes") !== -1) this.say(connection, this.room, '/hm ' + mutemsg[0] + ', Moderación automática: Tolerancia cero');
								else this.say(connection, this.room, '/rb ' + mutemsg[0] + ', Moderación automática: Tolerancia cero');
							} else {
								this.say(connection, this.room, '/rb ' + mutemsg[0] + ', Moderación automática: Tolerancia cero');
							}
						}
					}
				} else if (indexwarn !== -1) {
					var warnmsg = spl[2].split(" was warned by ");
					if (warnmsg.length > 1 && warnmsg[1].indexOf(config.nick) === -1) {
						var zt = this.isZeroTol(toId(warnmsg[0]), this.room);
						if (zt && zt !== 'low') {
							if (zt === 'normal') this.say(connection, this.room, '/m ' + warnmsg[0] + ', Moderación automática: Tolerancia cero');
							else if (zt === 'max') this.say(connection, this.room, '/rb ' + warnmsg[0] + ', Moderación automática: Tolerancia cero');
							else this.say(connection, this.room, '/hm ' + warnmsg[0] + ', Moderación automática: Tolerancia cero');
						}
					}
				}
				if (lastMessage) this.room = '';
				break;
			default:
				//console.log("DATA ( ".blue + this.room.blue + "): ".blue + message);
				if (lastMessage) this.room = '';
		}
	},
	chatMessage: function(message, by, room, connection) {
		if (ResourceMonitor.isLocked(by) && !this.hasRank(by, '~')) return;
		var cmdrMessage = '["' + room + '|' + by + '|' + message + '"]';
		message = message.trim();
		// auto accept invitations to rooms
		if (room.charAt(0) === ',' && message.substr(0,8) === '/invite ' && this.hasRank(by, '~') && !(config.serverid === 'showdown' && toId(message.substr(8)) === 'lobby')) {
			this.say(connection, '', '/join ' + message.substr(8));
		}
		if (room.charAt(0) === ',' && message.substr(0, config.commandcharacter.length) !== config.commandcharacter && !this.recentPMInfo[toId(by)]) {
			this.recentPMInfo[toId(by)] = 1;
			this.say(connection, '', '/pm ' + by + ', Hola, soy un bot para Pokemon Showdown. Si tienes alguna duda sobre mi funcionamiento escribe **,help**. No estoy programado para mantener conversaciones, por lo tanto dirígete a otro moderador/owner para cualquier consulta.');
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
		
		if (!Commands[cmd] && this.settings && this.settings.infocmds && this.settings.infocmds.info && this.settings.infocmds.info[toId(cmd)]) {
			arg = cmd;
			cmd = 'info';
		}

		if (Commands[cmd]) {
			var failsafe = 0;
			while (typeof Commands[cmd] !== "function" && failsafe++ < 10) {
				cmd = Commands[cmd];
			}
			if (typeof Commands[cmd] === "function") {
				cmdr(cmdrMessage);
				if (!this.hasRank(by, '~')) ResourceMonitor.countcmd(by);
				try {
					Commands[cmd].call(this, arg, by, room, connection);
				} catch (e) {
					ResourceMonitor.reportcrash(by, cmd, sys.inspect(e));
				};
			} else {
				error("invalid command type for " + cmd + ": " + (typeof Commands[cmd]));
			}
		}
	},
	say: function(connection, room, text) {
		if (config.disableBot) return;
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
			canUse = this.hasRank(user, ranks.substr(ranks.indexOf((cmd === 'autoban' || cmd === 'banword' || cmd === '0tol' || cmd === 'joinphrase') ? '#' : config.defaultrank)));
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
		if (this.settings['0tol'] && this.settings['0tol'][user]) return this.settings['0tol'][user];
		if (this.settings.zerotol && this.settings.zerotol[room] && this.settings.zerotol[room][user]) return 'normal';
		return false;
	},
	zeroTolUser: function(user, room) {
		if (room === 'espaol' || room === 'eventos') {
			if (!this.settings['zerotol']) this.settings['zerotol'] = {};
			if (!this.settings.zerotol[room]) this.settings.zerotol[room] = {};
		}
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
				try {
					self.say(con, room, (room.charAt(0) === ',' ? "" : "/pm " + by + ", ") + "hastebin.com/" + JSON.parse(chunk.toString())['key']);
				} catch (e) {
					self.say(con, '', '/pm ' + by + ', Error: No se puede subir a Hastebin (error en la conexión)');
				}
			});
		});
		
		req.on('error', function (e) {
			self.say(con, '', '/pm ' + by + ', Error: No se puede subir a Hastebin (error en la conexión)');
		});

		req.write(toUpload);
		req.end();
	},
	addTourPoints: function(user, points) {
		user = toId(user);
		points = parseInt(points);
		if (!points) return;
		if (!this.settings.tourPoints) this.settings.tourPoints = {};
		if (!this.settings.tourPoints[user]) this.settings.tourPoints[user] = 0;
		this.settings.tourPoints[user] += points;
	},
	getTourTable: function(minpos, t) {
		if (!this.settings.tourPoints) return false;
		var table = '|  n  |      Jugador       | Ranking\n';
		table +=    '|     |                    |\n'
		var ranks = [];
		var auxObj = {};
		var auxrank;
		var maxrank = 0; auxmax = 0;
		for (var i in this.settings.tourPoints) {
			if (this.settings.tourPoints[i] > auxmax) auxmax = this.settings.tourPoints[i];
		}
		while (auxmax / Math.pow(10, maxrank) >= 1) {
			maxrank++;
		}
		for (var i in this.settings.tourPoints) {
			auxrank = tonDigit(this.settings.tourPoints[i], maxrank);
			if (auxObj[auxrank]) {
				auxObj[auxrank][i] = 1;
			} else {
				auxObj[auxrank] = {};
				auxObj[auxrank][i] = 1;
				ranks.push(auxrank);
			}
		}
		ranks = ranks.sort(); //ordenar
		var k = 1;
		var aux, aux2, al;
		for (var i = ranks.length - 1; i >= 0; i--) {
			if (k > (minpos + t)) break;
			for (var j in auxObj[ranks[i]]) {
				if (k > (minpos + t)) break;
				if (k < 10) aux = k.toString() + "  ";
				else if (k < 100) aux = k.toString() + " ";
				else aux = k.toString();
				aux2 = j.charAt(0).toUpperCase() + ((j.length > 1) ? j.substr(1) : '');
				al = 18 - aux2.length;
				for (var g = 0; g < al; g++) {
					aux2 += " ";
				}
				if (k >= minpos) table += "| " + aux + " | " + aux2 + " | " + parseInt(ranks[i]).toString() + "\n";
				k++;
			}
		}
		return table;
	},
	updateTourTable: function(con, room) {
		var toUpload = this.getTourTable(0, 50);
		var self = this;
		if (!toUpload) return;
		toUpload = "Primeros 50 clasificados en el ranking de torneos:\n\n" + toUpload;
		var reqOpts = {
			hostname: "hastebin.com",
			method: "POST",
			path: '/documents'
		};

		var req = require('http').request(reqOpts, function(res) {
			res.on('data', function(chunk) {
				 global.toursTable = "hastebin.com/raw/" + JSON.parse(chunk.toString())['key'];
				 self.say(con, room, "Puntuaciones actualizadas. " + toursTable + " (50 primeros clasificados)");
			});
		});

		req.write(toUpload);
		req.end();
	},
	processChatData: function(user, room, connection, msg, timeOffSet) {
		// NOTE: this is still in early stages
		var is_staff = false;
		if (room.indexOf("battle") > -1) return;
		if (!this.roomLogs[room]) this.roomLogs[room] = {
			times: [0, 0, 0, 0],
			users: ['', '', '', ''],
			msgs: ['', '', '', ''],
			complete: 0
		};
		if (this.roomLogs[room].complete < 4) this.roomLogs[room].complete++;
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
		
		var time;
		if (timeOffSet) time = timeOffSet;
		else time = Date.now();
		
		if (!this.chatData[user]) this.chatData[user] = {
			zeroTol: 0,
			lastSeen: '',
			seenAt: time
		};
		var chatData = this.chatData[user];
		if (!chatData[room]) chatData[room] = {times:[], lastMessage: '#1', lastMessage2: '#2', points:0, lastAction:0};
		chatData = chatData[room];

		chatData.times.push(time);
		
		//anti spam
		this.roomLogs[room].times[3] = this.roomLogs[room].times[2];
		this.roomLogs[room].times[2] = this.roomLogs[room].times[1];
		this.roomLogs[room].times[1] = this.roomLogs[room].times[0];
		this.roomLogs[room].times[0] = time;
		
		this.roomLogs[room].msgs[3] = this.roomLogs[room].msgs[2];
		this.roomLogs[room].msgs[2] = this.roomLogs[room].msgs[1];
		this.roomLogs[room].msgs[1] = this.roomLogs[room].msgs[0];
		this.roomLogs[room].msgs[0] = msg;
		
		this.roomLogs[room].users[3] = this.roomLogs[room].users[2];
		this.roomLogs[room].users[2] = this.roomLogs[room].users[1];
		this.roomLogs[room].users[1] = this.roomLogs[room].users[0];
		this.roomLogs[room].users[0] = user;

		// this deals with punishing rulebreakers, but note that the bot can't think, so it might make mistakes
		if (config.allowmute && this.hasRank(this.ranks[room] || ' ', '%@&#~') && config.whitelist.indexOf(user) === -1 && !is_staff) {
			var useDefault = !(this.settings['modding'] && this.settings['modding'][room]);
			var pointVal = 0;
			var punishment = [];
			var muteMessage = '';
			var modSettings = useDefault ? null : this.settings['modding'][room];
			var capsMatch_K = msg.replace(/[^A-Za-z]/g, '').match(/[A-Z]/g);
			
			// moderation for spam
			if (useDefault || modSettings['spam'] !== 0 && pointVal < 4) {
				var times = chatData.times;
				var fastmessage = (times.length >= FLOOD_MESSAGE_NUM && (time - times[times.length - FLOOD_MESSAGE_NUM]) < FLOOD_MESSAGE_TIME);
				if (config.allowmute && config.whitelist.indexOf(user) === -1 && !is_staff && fastmessage) {
					if (this.roomLogs[room].users[3] === this.roomLogs[room].users[2] && this.roomLogs[room].users[2] === this.roomLogs[room].users[1] && this.roomLogs[room].users[1] === this.roomLogs[room].users[0]) {
						if (msg.length < 10) {
							muteMessage = ', Moderación automática: Flood intenso. Reglas: http://bit.ly/1abNG5E';
							pointVal = 3;
						} else if (msg.toLowerCase().indexOf("http://") > -1 || msg.toLowerCase().indexOf("https://") > -1 || msg.toLowerCase().indexOf("www.") > -1) {
							muteMessage = ', Moderación automática: Spam de links. Reglas: http://bit.ly/1abNG5E';
							pointVal = 4;
						} else {
							if (msg.length > 70 || (capsMatch_K && toId(msg).length > MIN_CAPS_LENGTH && (capsMatch_K.length >= Math.floor(toId(msg).length * MIN_CAPS_PROPORTION))) || msg.toLowerCase().indexOf("**") > -1 || msg.toLowerCase().match(/(.)\1{7,}/g) || msg.toLowerCase().match(/(..+)\1{4,}/g)) {
								muteMessage = ', Moderación automática: Spam de múltiple línea. Reglas: http://bit.ly/1abNG5E';
								pointVal = 4;
							} else {
								pointVal = 2;
								muteMessage = ', Moderación automática: Flood. Reglas: http://bit.ly/1abNG5E';
							}
						}
					}
				}
			}

			// moderation for porn/spam
			if (useDefault || modSettings['porn'] !== 0 && pointVal < 2) {
				if (config.bannedLinks) {
					for (var i = 0; i < config.bannedLinks.length; i++) {
						if (msg.toLowerCase().indexOf(config.bannedLinks[i]) > -1) {
							pointVal = 4;
							muteMessage = ', Moderación automática: Link con contenido prohibido';
							break;
						}
					}
				}
			}
			// moderation for spoiler
			if (useDefault || modSettings['spoiler'] !== 0) {
				if (msg.toLowerCase().indexOf("spoiler:") > -1 || msg.toLowerCase().indexOf("spoilers:") > -1) {
					punishment.push("Uso del Spoiler");
					if (pointVal < 2) {
						pointVal = 2;
						muteMessage = ', Moderación automática: Los spoilers no están permitidos. Reglas: http://bit.ly/1abNG5E';
					}
				}
			}
			// moderation for youtube channel
			if (useDefault || modSettings['youtube'] !== 0) {
				if (msg.toLowerCase().indexOf("youtube.com/channel/") > -1 || msg.toLowerCase().indexOf("youtube.com/user/") > -1) {
					punishment.push("Canal de Youtube");
					if (pointVal < 2) {
						pointVal = 2;
						muteMessage = ', Moderación automática: Publicidad de canales de Youtube. Reglas: http://bit.ly/1abNG5E';
					}
				}
			}
			// moderation for ps server
			if (useDefault || modSettings['psservers'] !== 0) {
				if (msg.toLowerCase().indexOf(".psim.us") > -1) {
					var serverAds = getServersAds(msg);
					for (var z = 0; z < serverAds.length; z++) {
						if (!(serverAds[z] in {"smogon": 1, "smogtours": 1})) {
							punishment.push("Publicidad");
							if (pointVal < 2) {
								pointVal = 2;
								muteMessage = ', Moderación automática: Publicidad de servidores privados de PS. Reglas: http://bit.ly/1abNG5E';
							}
							break;
						}
					}
				}
			}
			// moderation for inapropiate words
			if (useDefault || modSettings['inapropiate'] !== 0) {
				var banphraseSettings = this.settings.inapropiatephrases;
				var inapropiatePhrases = !!banphraseSettings ? (Object.keys(banphraseSettings[room] || {})).concat(Object.keys(banphraseSettings['global'] || {})) : [];
				var msgrip = " " + msg.toLowerCase().replace(/[^a-z0-9]/g, ' ') + " ";
				for (var i = 0; i < inapropiatePhrases.length; i++) {
						if (msgrip.indexOf(" " + inapropiatePhrases[i] + " ") > -1) {
							punishment.push("Lenguaje inapropiado");
							if (pointVal < 2) {
								pointVal = 2;
								muteMessage = ', Moderación automática: Su mensaje contiene una frase inapropiada. Reglas: http://bit.ly/1abNG5E';
							}
							break;
						}
				}
			}
			// moderation for banned words
			if (useDefault || modSettings['bannedwords'] !== 0) {
				var banphraseSettings = this.settings.bannedphrases;
				var bannedPhrases = !!banphraseSettings ? (Object.keys(banphraseSettings[room] || {})).concat(Object.keys(banphraseSettings['global'] || {})) : [];
				for (var i = 0; i < bannedPhrases.length; i++) {
					if (msg.toLowerCase().indexOf(bannedPhrases[i]) > -1) {
						punishment.push("Frases prohibidas");
						if (pointVal < 2) {
							pointVal = 2;
							muteMessage = ', Moderación automática: Su mensaje contiene una frase prohibida. Reglas: http://bit.ly/1abNG5E';
						}
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
					muteMessage = ', Moderación automática: Flood. Reglas: http://bit.ly/1abNG5E';
				}
			}
			// moderation for spam L1 (repeat 3 times the same message in 6 secons or faster)
			if (useDefault || modSettings['spam'] !== 0 && pointVal < 3) {
				if (times.length >= 3 && (time - times[times.length - 3]) < FLOOD_MESSAGE_TIME && msg === chatData.lastMessage && chatData.lastMessage === chatData.lastMessage2) {
					pointVal = 3;
					muteMessage = ', Moderación automática: Detectado posible spammer. Reglas: http://bit.ly/1abNG5E';
					if (msg.toLowerCase().indexOf("http://") > -1 || msg.toLowerCase().indexOf("https://") > -1 || msg.toLowerCase().indexOf("www.") > -1) {
						muteMessage = ', Moderación automática: Spam de links. Reglas: http://bit.ly/1abNG5E';
						if (msg.toLowerCase().indexOf("pokemonshowdown.com") === -1) pointVal = 4;
						else muteMessage = ', Moderación automática: Spam de links a combates. Reglas: http://bit.ly/1abNG5E';
					} else if (msg.length > 70 || (capsMatch_K && toId(msg).length > MIN_CAPS_LENGTH && (capsMatch_K.length >= Math.floor(toId(msg).length * MIN_CAPS_PROPORTION))) || msg.toLowerCase().indexOf("**") > -1 || msg.toLowerCase().match(/(.)\1{7,}/g) || msg.toLowerCase().match(/(..+)\1{4,}/g)) {
						muteMessage = ', Moderación automática: Spam de línea simple. Reglas: http://bit.ly/1abNG5E';
						pointVal = 4;
					} 
				}
			}
			//moderation for spam L2 (flooding with short messages: 8 or less chars)
			if (useDefault || modSettings['flood'] !== 0 && pointVal < 4) {
				if (isFlooding && msg.length < 10) {
					pointVal = 3;
					muteMessage = ', Moderación automática: Flood intenso. Reglas: http://bit.ly/1abNG5E';
				}
			}
			// moderation for caps (over x% of the letters in a line of y characters are capital)
			var capsMatch = msg.replace(/[^A-Za-z]/g, '').match(/[A-Z]/g);
			if ((useDefault || modSettings['caps'] !== 0) && capsMatch && toId(msg).length > MIN_CAPS_LENGTH && (capsMatch.length >= Math.floor(toId(msg).length * MIN_CAPS_PROPORTION))) {
				punishment.push("Caps");
				if (pointVal < 1) {
					pointVal = 1;
					muteMessage = ', Moderación automática: Uso excesivo de las mayúsculas. Reglas: http://bit.ly/1abNG5E';
				}
			}
			// moderation for stretching (over x consecutive characters in the message are the same)
			var stretchMatch = msg.toLowerCase().match(/(.)\1{9,}/g); // matches the same character (or group of characters) 8 (or 5) or more times in a row
			if (msg.toLowerCase().match(/(.)\1{7,}/g) || msg.toLowerCase().match(/(..+)\1{4,}/g)) punishment.push("Stretch");
			if ((useDefault || modSettings['stretching'] !== 0) && stretchMatch) {
				if (pointVal < 1) {
					pointVal = 1;
					muteMessage = ', Moderación automática: Alargar demasiado las palabras. Reglas: http://bit.ly/1abNG5E';
				}
			}
			//Double punishment
			if (useDefault || modSettings['double'] !== 0 && pointVal > 0) {
				if (punishment.length === 2) {
					if (punishment.indexOf("Frases prohibidas") === -1 && punishment.indexOf("Uso del Spoiler") === -1 && pointVal <= 2) {
						pointVal = 2;
						muteMessage = ', Doble infraccion: ' + punishment[0] + ' y ' + punishment[1] + '. Reglas: http://bit.ly/1abNG5E';
					} else if (pointVal <= 3) {
						pointVal = 3;
						muteMessage = ', Doble infraccion: ' + punishment[0] + ' y ' + punishment[1] + '. Reglas: http://bit.ly/1abNG5E';
					}
				} else if (punishment.length === 3) {
					if (pointVal <= 3) {
						pointVal = 3;
						muteMessage = ', Triple infraccion: ' + punishment[0] + ', ' + punishment[1] + ' y ' + punishment[2] + '. Reglas: http://bit.ly/1abNG5E';
					}
				}  else if (punishment.length > 3) {
					if (pointVal <= 4) {
						pointVal = 4;
						muteMessage = ', Múltiple infraccion: ' + punishment.join(", ") + '. Reglas: http://bit.ly/1abNG5E';
					}
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
					var ztVal = this.isZeroTol(toId(user), room);
					muteMessage += ' (Tolerancia 0)';
					if (ztVal === 'low' || ztVal === 'normal') {
						if (cmd === 'warn') cmd = 'mute';
						else if (cmd === 'mute') cmd = 'hourmute';
						else cmd = this.hasRank(this.ranks[room] || ' ', '@&#~') ? 'roomban' : 'hourmute';
					} else  if (ztVal === 'max') {
						cmd = this.hasRank(this.ranks[room] || ' ', '@&#~') ? 'roomban' : 'hourmute';
					} else {
						if (cmd === 'warn') cmd = 'hourmute';
						else cmd = this.hasRank(this.ranks[room] || ' ', '@&#~') ? 'roomban' : 'hourmute';
					}
				}
				if (chatData.points >= 2) this.chatData[user].zeroTol++; // getting muted or higher increases your zero tolerance level (warns do not)
				chatData.lastAction = time;
				this.say(connection, room, '/' + cmd + ' ' + user + muteMessage);
			}
		}
		chatData.lastMessage2 = chatData.lastMessage;
		chatData.lastMessage = msg;
	},
	makeTour: function(connection, room, tier, begintime, autodq) {
		this.tours[room] = {
				players: 0,
				maxPlayers: 0,
				autodq: autodq,
				now: Date.now(),
				timeout: begintime * 1000
		};
		this.say(connection, room, '/tour new ' + toId(tier) + ', elimination');
	},
	checkETours: function(connection) {
		//check tours
		if (config.disabletours) return;
		var f = new Date();
		var kTime = (f.getHours() * 60) + f.getMinutes();
		var tTime;
		/*First - search next tour*/
		var prog = eTourConfig.calendar;
		var actualTour = 0;
		if (eTourStatus.statusData !== f.getDate()) {
			if (!eTourStatus.waitingTourEnd && prog && prog.length && prog[f.getDate()]) {
				eTourStatus.nextTour = prog[f.getDate()];
				eTourStatus.nextWarn = 0;
				eTourStatus.statusData = f.getDate();
			}
		}
		/* Check next tour (start a tour or announces)*/
		if (eTourStatus.nextTour) {
			actualTour = eTourStatus.nextTour;
			tTime = (actualTour.hour * 60) + actualTour.minute;
			if (((kTime - tTime) >= 0 && Math.abs(kTime - tTime) < 2) || eTourStatus.waitingTourEnd) {
				//start the tour
				if (this.tourData[eTourConfig.toursRoom]) {
					//other tour is up
					if (!eTourStatus.waitingTourEnd) {
						this.say(connection, eTourConfig.toursRoom, '/mn Torneo [' + actualTour.name + '] no iniciado a causa de otro torneo ya iniciado. Se esperará a que finalice el torneo en cuestión.');
						eTourStatus.waitingTourEnd = 1;
					}
					return;
				}
				eTourStatus.actualTour = actualTour;
				eTourStatus.statusData = {};
				this.say(connection, eTourConfig.announceRoom, '/wall Torneo [' + actualTour.name + '] iniciado en la sala  de Eventos: http://play.pokemonshowdown.com/' + eTourConfig.toursRoom);
				this.makeTour(connection, eTourConfig.toursRoom, actualTour.tier, actualTour.signups * 60, actualTour.autodq);
				this.tours[eTourConfig.toursRoom].isRated = actualTour.isRated;
				this.say(connection, eTourConfig.toursRoom, '/wall Inscripciones para el Torneo [' + actualTour.name + '] abiertas! En ' + actualTour.signups + ' minuto' + ((actualTour.signups !== 1) ? 's' : '') + ' dará comienzo!');
				eTourStatus.nextTour = 0;
				eTourStatus.statusData = f.getDate();
				eTourStatus.waitingTourEnd = 0;
			}
		}
	},
	checkTours: function(connection) {
		var loop = function () {
			this.checkToursTimeout = setTimeout(function () {
				var self = this;
				if (!config.disabletours && self.settings && self.settings.autotours) {
					var f = new Date();
					for (var room in self.settings.autotours) {
						for (var i in self.settings.autotours[room]) {
							if ((f.getDay() === 0 || f.getDay() === 6) && self.settings.autotours[room][i].typedays !== "findes") continue;
							if (f.getDay() > 0 && f.getDay() < 6 && self.settings.autotours[room][i].typedays !== "laborales") continue;
							if (f.getHours() === self.settings.autotours[room][i].hour && (f.getMinutes() - self.settings.autotours[room][i].minute) >= 0 && (f.getMinutes() - self.settings.autotours[room][i].minute) < 2) {
								//make tour
								if (!self.tourData[room]) self.makeTour(connection, room, self.settings.autotours[room][i].tier, self.settings.autotours[room][i].begintime, self.settings.autotours[room][i].autodq);
							}
						}
					}
				}
				this.checkETours(connection);
				this.updateStaff(connection);
				loop();
			}.bind(this), 30000);
		}.bind(this);
		loop();
	},
	
	updateStaff: function (connection) {
		if (!global.STAFF_CHANGES_FLAG) return;
		this.staffRanks = {};
		global.staffpopup = true;
		send(connection, 'salastaff|/roomauth');
		ResourceMonitor.log('Lista de staff para el modo "autoinvite" actualizada con los cambios más recientes', 'i');
		global.STAFF_CHANGES_FLAG = false;
	},
	
	cleanChatData: function () {
		this.recentPMInfo = {};
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

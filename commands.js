/**
 * This is the file where the bot commands are located
 *
 * @license MIT license
 */

var http = require('http');
var sys = require('sys');

exports.commands = {
	/**
	 * Help commands
	 *
	 * These commands are here to provide information about the bot.
	 */
	bot: 'about',
	info: 'about',
	about: function(arg, by, room, con) {
		if (this.hasRank(by, '#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		text += '**Bot para Pokémon Showdown** por: Quinella y TalkTakesTime. Versión traducida y adaptada por Ecuacion y xJoelituh.';
		this.say(con, room, text);
	},
	ayuda: 'guide',
	help: 'guide',
	guide: function(arg, by, room, con) {
		if (this.hasRank(by, '#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		if (config.botguide) {
			text += 'Guia acerca del Bot y su funcionamiento: ' + config.botguide;
		} else {
			text += 'No hay ninguna guía para el Bot. Contacta con un Room Owner para preguntar dudas.';
		}
		this.say(con, room, text);
	},

	/**
	 * Dev commands
	 *
	 * These commands are here for highly ranked users (or the creator) to use
	 * to perform arbitrary actions that can't be done through any other commands
	 * or to help with upkeep of the bot.
	 */

	reload: function(arg, by, room, con) {
		if (!this.hasRank(by, '#~')) return false;
		try {
			this.uncacheTree('./commands.js');
			Commands = require('./commands.js').commands;
			this.say(con, room, 'Comandos actualizados.');
		} catch (e) {
			error('failed to reload: ' + sys.inspect(e));
		}
	},
	custom: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		// Custom commands can be executed in an arbitrary room using the syntax
		// ".custom [room] command", e.g., to do !data pikachu in the room lobby,
		// the command would be ".custom [lobby] !data pikachu". However, using
		// "[" and "]" in the custom command to be executed can mess this up, so
		// be careful with them.
		if (arg.indexOf('[') === 0 && arg.indexOf(']') > -1) {
			var tarRoom = arg.slice(1, arg.indexOf(']'));
			arg = arg.substr(arg.indexOf(']') + 1).trim();
		}
		this.say(con, tarRoom || room, arg);
	},
	tell: 'say',
	say: function(arg, by, room, con) {
		if (!this.canUse('say', room, by)) return false;
		this.say(con, room, stripCommands(arg));
	},
	js: function(arg, by, room, con) {
		if (config.excepts.indexOf(toId(by)) === -1) return false;
		try {
			var result = eval(arg.trim());
			this.say(con, room, JSON.stringify(result));
		} catch (e) {
			this.say(con, room, e.name + ": " + e.message);
		}
	},
	
	end: 'kill',
	destroy: 'kill',
	kill: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		console.log('Bot system was closed by '.red + by.red + '!'.red);
		process.exit();
	},
	batalla: 'allowbattle',
	permitirbatalla: 'allowbattle',
	allowbattles: 'allowbattle',
	allowbattle: function(arg, by, room, con) { 
		if (!this.hasRank(by, '~')) return false;
		if (toId(arg) === "off") {
			this.say(con, room, '/away');
			this.say(con, room, 'Sistema de batallas random automaticas desactivado');
		} else {
			this.say(con, room, '/back');
			this.say(con, room, 'Sistema de batallas random automaticas activado');
		}
	},
	
	allowbattleall: function(arg, by, room, con) { 
		if (!this.hasRank(by, '~')) return false;
		if (toId(arg) === "off") {
			config.acceptAll = false;
				this.say(con, room, 'Modo restringido: Solo aceptare batallas de los usuarios de la lista de excepciones.');
		} else {
			config.acceptAll = true;
			this.say(con, room, 'Modo abierto: Aceptare los retos de todos los usuarios.');
		}
	},
	
	startautomatedbattle: function(arg, by, room, con) { 
		if (!this.hasRank(by, '~')) return false;
		this.processBattle(room);
	},
	
	move: function(arg, by, room, con) { 
		if (!this.hasRank(by, '~')) return false;
		this.moveBattle(room, con);
	},
	
	getauth: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		this.say(con, arg || room, "/roomauth");
		this.say(con, room, '/msg ' + by + ',Lista de auth leída, compruebe la consola.');
	},
	
	uploadlog: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		var dateG = arg.replace("/", "_").replace("/", "_");
		dateG = dateG.replace("-", "_").replace("-", "_");
		if (!fs.existsSync("logs/chatlog_" + dateG + ".log")) {
			this.say(con, room, '/msg ' + by + ',El log que busca no existe.');
			return;
		}
		var gtLog = dateG.replace("_","-").replace("_","-") + "\n-------------------------------\n\n" + fs.readFileSync("logs/chatlog_" + dateG + ".log").toString();
		this.say(con, room, '/msg ' + by + ',Subiendo...');
		this.uploadToHastebin(con, room, by, gtLog);
	},

	/**
	 * Room Owner commands
	 *
	 * These commands allow room owners to personalise settings for moderation and command use.
	 */

	settings: 'set',
	set: function(arg, by, room, con) {
		if (!this.hasRank(by, '#~') || room.charAt(0) === ',') return false;

		var settable = {
			banword: 1,
			autoban: 1,
			info: 1,
			say: 1,
			joke: 1,
			choose: 1,
			usagestats: 1,
			helixesp: 1,
			buzz: 1,
			gg: 1,
			busca: 1

		};
		var modOpts = {
			flooding: 1,
			caps: 1,
			stretching: 1,
			bannedwords: 1,
			youtube: 1,
			spoiler: 1,
			porn: 1,
			snen: 1
		};

		var opts = arg.split(',');
		var cmd = toId(opts[0]);
		if (cmd === 'mod' || cmd === 'm' || cmd === 'modding') {
			if (!opts[1] || !toId(opts[1]) || !(toId(opts[1]) in modOpts)) return this.say(con, room, 'Comando Incoreecto: el modo correcto es ' + config.commandcharacter + 'set mod, [' +
				Object.keys(modOpts).join('/') + '](, [on/off])');

			if (!this.settings['modding']) this.settings['modding'] = {};
			if (!this.settings['modding'][room]) this.settings['modding'][room] = {};
			if (opts[2] && toId(opts[2])) {
				if (!this.hasRank(by, '#~')) return false;
				if (!(toId(opts[2]) in {on: 1, off: 1}))  return this.say(con, room, 'Comando Incoreecto: el modo correcto es ' + config.commandcharacter + 'set mod, [' +
					Object.keys(modOpts).join('/') + '](, [on/off])');
				if (toId(opts[2]) === 'off') {
					this.settings['modding'][room][toId(opts[1])] = 0;
				} else {
					delete this.settings['modding'][room][toId(opts[1])];
				}
				this.writeSettings();
				this.say(con, room, 'Moderación automática para ' + toId(opts[1]) + ' está ' + toId(opts[2]).toUpperCase() + ' en esta sala.');
				return;
			} else {
				this.say(con, room, 'Moderación automática para ' + toId(opts[1]) + ' ya estaba ' +
					(this.settings['modding'][room][toId(opts[1])] === 0 ? 'OFF' : 'ON') + ' en esta sala.');
				return;
			}
		} else {
			if (!Commands[cmd]) return this.say(con, room, config.commandcharacter + '' + opts[0] + ' no es un comando válido.');
			var failsafe = 0;
			while (!(cmd in settable)) {
				if (typeof Commands[cmd] === 'string') {
					cmd = Commands[cmd];
				} else if (typeof Commands[cmd] === 'function') {
					if (cmd in settable) {
						break;
					} else {
						this.say(con, room, 'Las opciones para ' + config.commandcharacter + '' + opts[0] + ' no pueden ser modificadas.');
						return;
					}
				} else {
					this.say(con, room, 'Algo va mal, contacta con un administrador del Bot para informarle del problema.');
					return;
				}
				failsafe++;
				if (failsafe > 5) {
					this.say(con, room, 'El comando "' + config.commandcharacter + '' + opts[0] + '" no se encuentra disponible.');
					return;
				}
			}

			var settingsLevels = {
				off: false,
				disable: false,
				'+': '+',
				'%': '%',
				'@': '@',
				'&': '&',
				'#': '#',
				'~': '~',
				on: true,
				enable: true
			};
			if (!opts[1] || !opts[1].trim()) {
				var msg = '';
				if (!this.settings[cmd] || (!this.settings[cmd][room] && this.settings[cmd][room] !== false)) {
					msg = '.' + cmd + ' está disponible para los usuarios de rango ' + ((cmd === 'autoban' || cmd === 'banword') ? '#' : config.defaultrank) + ' y superior.';
				} else if (this.settings[cmd][room] in settingsLevels) {
					msg = '.' + cmd + ' está disponible para los usuarios de rango ' + this.settings[cmd][room] + ' y superior.';
				} else if (this.settings[cmd][room] === true) {
					msg = '.' + cmd + ' está disponible para todos los usuarios.';
				} else if (this.settings[cmd][room] === false) {
					msg = '' + config.commandcharacter+''+ cmd + ' ha sido desactivado para esta sala.';
				}
				this.say(con, room, msg);
				return;
			} else {
				if (!this.hasRank(by, '#~')) return false;
				var newRank = opts[1].trim();
				if (!(newRank in settingsLevels)) return this.say(con, room, 'Unknown option: "' + newRank + '". Valid settings are: off/disable, +, %, @, &, #, ~, on/enable.');
				if (!this.settings[cmd]) this.settings[cmd] = {};
				this.settings[cmd][room] = settingsLevels[newRank];
				this.writeSettings();
				this.say(con, room, 'El comando ' + config.commandcharacter + '' + cmd + ' está ahora ' +
					(settingsLevels[newRank] === newRank ? 'disponible para los usuarios de rango ' + newRank + ' y superior.' :
					(this.settings[cmd][room] ? 'disponible para todos los usuarios.' : 'desactivado para esta sala.')))
			}
		}
	},
	blacklist: 'autoban',
	ban: 'autoban',
	ab: 'autoban',
	autoban: function(arg, by, room, con) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(con, room, 'Para poder banear usuarios, el Bot requiere de rango @ o superior.');

		arg = arg.split(',');
		var added = [];
		var illegalNick = [];
		var alreadyAdded = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(con, room, 'Debes especificar al menos un usuario.');
		for (var i = 0; i < arg.length; i++) {
			var tarUser = toId(arg[i]);
			if (tarUser.length < 1 || tarUser.length > 18) {
				illegalNick.push(tarUser);
				continue;
			}
			if (!this.blacklistUser(tarUser, room)) {
				alreadyAdded.push(tarUser);
				continue;
			}
			this.say(con, room, '/roomban ' + tarUser + ', Usuario baneado permanentemente');
			this.say(con,room, '/modnote ' + tarUser + ' fue agregado a la lista negra por ' + by + '.');
			added.push(tarUser);
		}

		var text = '';
		if (added.length) {
			text += 'Usuario(s) "' + added.join('", "') + '" correctamente agregado(s) a la lista negra. ';
			this.writeSettings();
		}
		if (alreadyAdded.length) text += 'Usuario(s) "' + alreadyAdded.join('", "') + '" ya estaba(n) en la lista negra. ';
		if (illegalNick.length) text += 'Todos los ' + (text.length ? 'demás ' : '') + 'usuarios tenian nombres incorrectos y no fueron agregados.';
		this.say(con, room, text);
	},
	unblacklist: 'unautoban',
	unban: 'unautoban',
	unab: 'unautoban',
	unautoban: function(arg, by, room, con) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(con, room, config.nick + 'Para poder banear usuarios, el Bot requiere de rango @ o superior.');

		arg = arg.split(',');
		var removed = [];
		var notRemoved = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(con, room, 'Debes especificar al menos un usuario.');
		for (var i = 0; i < arg.length; i++) {
			var tarUser = toId(arg[i]);
			if (tarUser.length < 1 || tarUser.length > 18) {
				notRemoved.push(tarUser);
				continue;
			}
			if (!this.unblacklistUser(tarUser, room)) {
				notRemoved.push(tarUser);
				continue;
			}
			this.say(con, room, '/roomunban ' + tarUser);
			removed.push(tarUser);
		}

		var text = '';
		if (removed.length) {
			text += 'Usuario(s) "' + removed.join('", "') + '" correctaente eliminado(s) de la lista negra. ';
			this.writeSettings();
		}
		if (notRemoved.length) text += (text.length ? 'El resto de ' : 'Los ') + ' usuarios especificados no estaban en la lista negra.';
		this.say(con, room, text);
	},
	viewbans: 'viewblacklist',
	vab: 'viewblacklist',
	viewautobans: 'viewblacklist',
	viewblacklist: function(arg, by, room, con) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;

		var text = '';
		if (!this.settings.blacklist || !this.settings.blacklist[room]) {
			text = 'La litsta negra de esta sala esta vacía.';
		} else {
			if (arg.length) {
				var nick = toId(arg);
				if (nick.length < 1 || nick.length > 18) {
					text = 'Usuario incorrecto: "' + nick + '".';
				} else {
					text = 'El usuario "' + nick + '" ' + (nick in this.settings.blacklist[room] ? '' : 'NO ') + 'está en la lista negra de la sala ' + room + '.';
				}
			} else {
				var nickList = Object.keys(this.settings.blacklist[room]);
				if (!nickList.length) return this.say(con, room, '/pm ' + by + ', La lista negra de esta sala esta vacía.');
				this.uploadToHastebin(con, room, by, 'Los siguientes usuarios están baneados en ' + room + ':\n\n' + nickList.join('\n'))
				return;
			}
		}
		this.say(con, room, '/pm ' + by + ', ' + text);
	},
	zt: 'zerotol',
	zerotol: function(arg, by, room, con) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(con, room, 'Para poder banear usuarios, el Bot requiere de rango @ o superior.');

		arg = arg.split(',');
		var added = [];
		var illegalNick = [];
		var alreadyAdded = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(con, room, 'Debes especificar al menos un usuario.');
		for (var i = 0; i < arg.length; i++) {
			var tarUser = toId(arg[i]);
			if (tarUser.length < 1 || tarUser.length > 18) {
				illegalNick.push(tarUser);
				continue;
			}
			if (!this.zeroTolUser(tarUser, room)) {
				alreadyAdded.push(tarUser);
				continue;
			}
			added.push(tarUser);
		}

		var text = '';
		if (added.length) {
			text += 'Usuario(s) "' + added.join('", "') + '" correctamente agregado(s) a la lista de Cero Tolerancia. ';
			this.writeSettings();
		}
		if (alreadyAdded.length) text += 'Usuario(s) "' + alreadyAdded.join('", "') + '" ya estaba(n) en la lista de Cero Tolerancia. ';
		if (illegalNick.length) text += 'Todos los ' + (text.length ? 'demás ' : '') + 'usuarios tenian nombres incorrectos y no fueron agregados.';
		this.say(con, room, text);
	},
	
	unzt: 'unzerotol',
	unzerotol: function(arg, by, room, con) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(con, room, config.nick + 'Para poder banear usuarios, el Bot requiere de rango @ o superior.');

		arg = arg.split(',');
		var removed = [];
		var notRemoved = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(con, room, 'Debes especificar al menos un usuario.');
		for (var i = 0; i < arg.length; i++) {
			var tarUser = toId(arg[i]);
			if (tarUser.length < 1 || tarUser.length > 18) {
				notRemoved.push(tarUser);
				continue;
			}
			if (!this.unzeroTolUser(tarUser, room)) {
				notRemoved.push(tarUser);
				continue;
			}
			removed.push(tarUser);
		}

		var text = '';
		if (removed.length) {
			text += 'Usuario(s) "' + removed.join('", "') + '" correctamente eliminado(s) de la lista de Cero Tolerancia. ';
			this.writeSettings();
		}
		if (notRemoved.length) text += (text.length ? 'El resto de ' : 'Los ') + ' usuarios especificados no estaban en la lista de Cero Tolerancia.';
		this.say(con, room, text);
	},
	vzt: 'viewzerotol',
	viewzerotollist: 'viewzerotol',
	viewzerotol: function(arg, by, room, con) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;

		var text = '';
		if (!this.settings.zerotol || !this.settings.zerotol[room]) {
			text = 'La lista de Cero Tolerancia de esta sala esta vacía.';
		} else {
			if (arg.length) {
				var nick = toId(arg);
				if (nick.length < 1 || nick.length > 18) {
					text = 'Usuario incorrecto: "' + nick + '".';
				} else {
					text = 'El usuario "' + nick + '" ' + (nick in this.settings.zerotol[room] ? '' : 'NO ') + 'está en la lista de Cero Tolerancia de la sala ' + room + '.';
				}
			} else {
				var nickList = Object.keys(this.settings.zerotol[room]);
				if (!nickList.length) return this.say(con, room, '/pm ' + by + ', La lista de Cero Tolerancia de esta sala esta vacía.');
				this.uploadToHastebin(con, room, by, 'Los siguientes usuarios están en la lista de Cero Tolerancia en ' + room + ':\n\n' + nickList.join('\n'))
				return;
			}
		}
		this.say(con, room, '/pm ' + by + ', ' + text);
	},
	banphrase: 'banword',
	banword: function(arg, by, room, con) {
		if (!this.canUse('banword', room, by)) return false;
		if (!this.settings.bannedphrases) this.settings.bannedphrases = {};
		arg = arg.trim().toLowerCase();
		if (!arg) return false;
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		if (!this.settings.bannedphrases[tarRoom]) this.settings.bannedphrases[tarRoom] = {};
		if (arg in this.settings.bannedphrases[tarRoom]) return this.say(con, room, "La frase \"" + arg + "\" ya estaba prohibida.");
		this.settings.bannedphrases[tarRoom][arg] = 1;
		this.writeSettings();
		this.say(con, room, "La frase \"" + arg + "\" está prohibida a partir de ahora.");
	},
	unbanphrase: 'unbanword',
	unbanword: function(arg, by, room, con) {
		if (!this.canUse('banword', room, by)) return false;
		arg = arg.trim().toLowerCase();
		if (!arg) return false;
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		if (!this.settings.bannedphrases || !this.settings.bannedphrases[tarRoom] || !(arg in this.settings.bannedphrases[tarRoom])) 
			return this.say(con, room, "La frase \"" + arg + "\" no estaba prohibida.");
		delete this.settings.bannedphrases[tarRoom][arg];
		if (!Object.size(this.settings.bannedphrases[tarRoom])) delete this.settings.bannedphrases[tarRoom];
		if (!Object.size(this.settings.bannedphrases)) delete this.settings.bannedphrases;
		this.writeSettings();
		this.say(con, room, "La frase \"" + arg + "\" ha dejado de estar prohibida.");
	},
	viewbannedphrases: 'viewbannedwords',
	vbw: 'viewbannedwords',
	viewbannedwords: function(arg, by, room, con) {
		if (!this.canUse('banword', room, by)) return false;
		arg = arg.trim().toLowerCase();
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		var text = "";
		if (!this.settings.bannedphrases || !this.settings.bannedphrases[tarRoom]) {
			text = "No hay frases prohibidas en esta sala.";
		} else {
			if (arg.length) {
				text = "La frase \"" + arg + "\" " + (arg in this.settings.bannedphrases[tarRoom] ? "" : "NO ") + "está prohibida " +
					(room.charAt(0) === ',' ? "globalmente" : "en " + room) + ".";
			} else {
				var banList = Object.keys(this.settings.bannedphrases[tarRoom]);
				if (!banList.length) return this.say(con, room, "No hay frases prohibidas en esta sala.");
				this.uploadToHastebin(con, room, by, "Las siguientes frases están prohibidas " + (room.charAt(0) === ',' ? "globalmente" : "en " + room) + ":\n\n" + banList.join('\n'))
				return;
			}
		}
		this.say(con, room, text);
	},

	/**
	 * General commands
	 *
	 * Add custom commands here.
	 */
	joke: function(arg, by, room, con) {
		if (!this.canUse('joke', room, by) || room.charAt(0) === ',') return false;
		var self = this;

		var reqOpt = {
			hostname: 'api.icndb.com',
			path: '/jokes/random',
			method: 'GET'
		};
		var req = http.request(reqOpt, function(res) {
			res.on('data', function(chunk) {
				try {
					var data = JSON.parse(chunk);
					self.say(con, room, data.value.joke.replace(/&quot;/g, "\""));
				} catch (e) {
					self.say(con, room, 'Sorry, couldn\'t fetch a random joke... :(');
				}
			});
		});
		req.end();
	},
	elige: 'choose',
	escoge: 'choose',
	pick: 'choose',
	choose: function(arg, by, room, con) {
		if (arg.indexOf(',') === -1) {
			var choices = arg.split(' ');
		} else {
			var choices = arg.split(',');
		}
		choices = choices.filter(function(i) {return (toId(i) !== '')});
		if (choices.length < 2) return this.say(con, room, (room.charAt(0) === ',' ? '': '/pm ' + by + ', ') + '.choose: Debes dar al menos 2 opciones válidas.');

		var choice = choices[Math.floor(Math.random()*choices.length)];
		this.say(con, room, ((this.canUse('choose', room, by) || room.charAt(0) === ',') ? '':'/pm ' + by + ', ') + stripCommands(choice));
	},
	seen: function(arg, by, room, con) { // this command is still a bit buggy
		var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
		arg = toId(arg);
		if (!arg || arg.length > 18) return this.say(con, room, text + 'Invalid username.');
		if (arg === toId(by)) {
			text += 'Mírate al espejo y hallarás la respuesta.';
		} else if (arg === toId(config.nick)) {
			text += 'Ese soy yo.';
		} else if (!this.chatData[arg] || !this.chatData[arg].seenAt) {
			text += 'El usuario ' + arg + ' no ha sido visto por aquí, al menos desde el ultimo reinicio del Bot.';
		} else {
			text += arg + ' fue visto por última vez hace ' + this.getTimeAgo(this.chatData[arg].seenAt) + ' ' + (
				this.chatData[arg].lastSeen ? ', ' + this.chatData[arg].lastSeen : '.');
		}
		this.say(con, room, text);
	},
	

	liga: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', ';
		}
		text += "¿Tienes alguna duda sobre la Liga? ¡Revisa el **índice de la Liga** aquí!: (http://goo.gl/CxH2gi) By: xJoelituh";
		this.say(con, room, text);
	},
	
	foro: 'forum',
	forum: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', ';
		}
		text += "¡Visita nuestro foro para participar en multitud de actividades! http://ps-salaespanol.proboards.com/";
		this.say(con, room, text);
	},
	
	faqs: 'faq',
	faq: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', ';
		}
		text += "Preguntas frecuentes sobre el funcionamiento del chat: http://ps-salaespanol.weebly.com/faq.html";
		this.say(con, room, text);
	},
	
	plug: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', ';
		} 
		text += 'Si quieres escuchar música y poder pasarlo bien hablando con gente, vente a nuestro plug oficial de la sala (https://plug.dj/salaesp/ ). Esperamos que lo disfrutes :^)';
		this.say(con, room, text);
	},
	
	suspect: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', ';
		} 
		text +='Actualmente hay suspect de Greninja. ¿Qué significa eso? El Smogon Council pone un metagame sin el Pokémon que está en el suspect y la gente lucha por ganar X puntos de COIL, que son necesarios para poder votar en el foro de Smogon para decidir si ese Pokémon merece ser baneado o no';
		this.say(con, room, text);
		
	},
	
	torneo: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', ';
		} 
			text +='Si quieres participar en un torneo tienes que esperar a que un moderador (@) o superior lo cree. Solo en ese momento se puede participar dandole al boton que pone "join". Para una explicación más elaborada, ve a esta pagina para un tutorial: http://ps-salaespanol.proboards.com/thread/405/';
		this.say(con, room, text);	
	
	},
	VoD: 'vod',
	VOD: 'vod',
	vod: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', ';
		} 
			text +='VoD son las siglas de "Voiced of the Day" que se traduce al castellano como "Voiced por un dia". Este rango es precisamente esto, la oportunidad de obtener el rango de voiced (+) por un dia. Se suele dar a los ganadores de eventos y torneos. Para mas información ve a: http://bit.ly/1B714Tj';
		this.say(con, room, text);	
	
	},

	modchat: function(arg, by, room, con) {
		var text  = '';
		if  (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', ';
		} 
			text +='Si no puedes hablar en el chat, normalmente es porque esta puesto el "Autoconfirmed moderated chat". Mientras esta activado solo pueden hablar los usuarios que tengan una cuenta de mas de una semana y hayan ganado una batalla. Esto ayuda a evitar spam y situaciones problemáticas.';
		this.say(con, room, text);	
	
	},
	rango: 'rangos',
	groups: 'rangos',
	rangos: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', ';
		} 
			text +='Esta sala esta liderada a base de una oligarquia meritocrática. Esto quiere decir que gobiernan unos pocos (el staff) que han ganado el rango a través de unos méritos particulares. Los rangos son:  VOICED (+), DRIVER (%), MODERADOR (@) y OWNER (#). Los usuarios voiced (+) son los usuarios ejemplares de la sala. Los drivers (%) son los vigilantes del chat. Estos usuarios pueden avisar y mutear (7-60min). Los moderadores (@) son usuarios de muchisima calidad. Pueden avisar, mutear y banear. Los owners (#) son los lideres del chat y pueden hacer muchas cosas :^)';
	this.say(con, room, text);	
	
	},
	
	castigos: 'sanciones',
	sanciones: 'sanciones',
	sanciones: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', En esta sala, es imperativo seguir unas normas básicas. Si un usuario rompe las reglas, el staff reserva el derecho de penar y sancionar a cualquier usuario. Las sanciones son estas: 1) Aviso/Warn  2) Mute/Silenciar y 3) Banear';
		} 	
			text +='En esta sala, es imperativo seguir unas normas básicas. Si un usuario rompe las reglas, el staff reserva el derecho de penar y sancionar a cualquier usuario. Las sanciones son estas: 1) AVISO/WARN  2) MUTE/SILENCIAR y 3) Banear/Aterrar';

	this.say(con, room, text);	
	},

	
	reglas: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', ';
		} 
			text +='Revisa las reglas del chat aquí: http://bit.ly/1abNG5E';
		this.say(con, room, text);	
	
	},

	staff: function(arg, by, room, con) {
			var text = '';
			if  (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', ';
		}
		text += 'Revisa la lista de staff: http://bit.ly/1xbOjJZ';
	
	this.say(con, room, text);
			
	},
	
	
	helix: 'helixesp',
	helixesp: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('helixesp', room, by)) {
			var text = '/pm ' + by + ', ';
		}
		var rand = Math.floor(22 * Math.random()) + 1;

		switch (rand) {
	 		case 1: text += "Todo apunta que sí."; break;
	  		case 2: text += "Las ranitas de Asty hacen croack"; break;
			case 3: text += "Respuesta borrosa, prueba de nuevo."; break;
			case 4: text += "Sin ninguna duda."; break;
			case 5: text += "Mis fuentes dicen que no."; break;
			case 6: text += "Como veo, sí."; break;
			case 7: text += "No entiendo gg."; break;
			case 8: text += "Concentrate y pregunta de nuevo."; break;
			case 9: text += "No parece tan bueno."; break;
			case 10: text += "Es cierto."; break;
			case 11: text += "Mejor no decirtelo ahora."; break;
			case 12: text += "Muy dudable."; break;
			case 13: text += "Sí - definitivamente."; break;
			case 14: text += "Creo que sí."; break;
			case 15: text += "No puedo predecir eso."; break;
			case 16: text += "Parece que no."; break;
			case 17: text += "Pregunta más tarde."; break;
			case 18: text += "Mis fuentes dicen que sí."; break;
			case 19: text += "Parece que sí."; break;
			case 20: text += "No cuentes con ello."; break;
			case 21: text += "Eres un malo."; break;
			case 22: text += "Te insultaria pero eres alguien importante en el chat."; break;
		}
		this.say(con, room, text);
	},

	gg: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('gg', room, by)) {
			var text = '/pm ' + by + ', ';
		}
		text += 'No entiendo gg';
		this.say(con, room, text);
	},
	b: 'busca',
	busca: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('busca', room, by)) {
                        var text = '/pm ' + by + ', ';
                } 
		text += '[[' + stripCommands(arg) + ']]';
		this.say(con, room, text);
	},

	
	poke: function(arg, by, room, con) {
		var rand = Math.floor(721 * Math.random()) + 1;
		var text = '';
		if (!this.canUse('info',room, by)) {
			var text = '/pm ' + by + ', Haz /dt ' + rand + ' para ver que Pokémon aleatorio ha salido.';
		}
			text +='!dt ' + rand;
		this.say(con, room, text);
	},
	
	
	/*prueba: function(arg, by, room, con) {
		var actual = new Date();
		var horas = actual.getHours();
		var minutos = actual.getMinutes();
		while (!minutos === 46) this.say(con, room, /modchat autoconfirmed);
	},*/


	sken: function(arg, by, room, con) {
		var rand = Math.floor(5 * Math.random()) + 1;
		var text = '';
			if (this.canUse('info',room,by) && (!toId(by) == 'sken')){
				var text = '';
				text +='No eres Sken.';
			} else {
			var text = '';			
			switch (rand) 	{
				case 1: text += "The opposing Tyranitar used Aerial Ace. Mega-Heracross fainted."; break;
				case 2: text += "Eres un parguela"; break;
				case 3: text += "He sido tu admirador durante mucho tiempo, pero me estás empezando a caer gordo, me estás arruinando la vida con tu presencia."; break;
				case 4: text += "Sken, acaso te crees la divina papaya? Pues yo creo que no."; break;
				case 5: text += "Sken, te amo"; break;
							}
											}
			this.say(con, room, text);

	}
	

			
};

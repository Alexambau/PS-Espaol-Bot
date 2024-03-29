﻿/**
 * This is the file where the bot commands are located
 *
 * @license MIT license
 */

var http = require('http');
var sys = require('sys');

var MD5 = require('./tools/md5.js').MD5;

var teamTools = require('./tools/teamutils.js');

const EVENTS_ROOMS = {'eventos': 1, 'salastaff': 1}; 

function getHash(name, maxNum) {
	var hash = parseInt(MD5(name), 16) % maxNum;
	while (hash >= maxNum) hash /= maxNum;
	return parseInt(hash);
}

exports.commands = {
	
	/*********************************************************
	* Development Commands
	*********************************************************/
	
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
	
	logbattle: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		console.log("BATTLE DATA -> ".red + JSON.stringify(BattleBot.data[room]));
	},
	
	reload: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		try {
			this.uncacheTree('./commands.js');
			Commands = require('./commands.js').commands;
			this.say(con, room, 'Comandos actualizados.');
		} catch (e) {
			error('failed to reload: ' + sys.inspect(e));
		}
	},
	
	reloadbattle: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		try {
			this.uncacheTree('./battle.js');
			global.BattleBot = require('./battle.js');
			BattleBot.init();
			BattleBot.teamBuilder.loadTeamList();
			this.say(con, room, 'Módulos de batallas actualizados.');
		} catch (e) {
			error('failed to reload: ' + sys.inspect(e));
		}
	},
	
	reloadtour: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		try {
			this.uncacheTree('./tools/etourconfig.js');
			eTourConfig = require('./tools/etourconfig.js');
			eTourStatus.statusData = 0;
			eTourStatus.nextTour = 0;
			this.checkETours(con);
			this.say(con, room, 'Calendario de Torneos actualizado.');
		} catch (e) {
			error('failed to reload: ' + sys.inspect(e));
		}
	},
	
	reloadteams: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		try {
			this.uncacheTree('./tools/teams.js');
			if (BattleBot.teamBuilder.loadTeamList())
				this.say(con, room, 'Teams actualizados.');
			else 
				this.say(con, room, 'Error en la lectura de teams.js.');
		} catch (e) {
			error('failed to reload: ' + sys.inspect(e));
		}
	},

	reloaddata: function(arg, by, room, con) {
		if (config.excepts.indexOf(toId(by)) === -1 || room.charAt(0) !== ',') return false;
		this.say(con, room, 'Reloading data files...');
		var https = require('https');
		var datenow = Date.now();
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
		return this.say(con, room, 'Data files reloaded');
	},
	
	rm: 'resourcemonitor',
	 resourcemonitor: function (arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		var args = arg.split(",");
		if (!arg || !args.length) return false;
		switch (toId(args[0])) {
			case 'lock':
			case 'ignore':
				if (args.length < 2) return this.say(con, room, "Debe especificar un usuario.");
				if (!ResourceMonitor.isLocked(args[1])) {
					ResourceMonitor.lock(args[1]);
					this.say(con, room, "El usuario " + toId(args[1]) + " ha sido ignorado y no podrá usar comandos.");
				} else {
					this.say(con, room, "El usuario " + toId(args[1]) + " ya estaba ignorado.");
				}
				break;
			case 'unlock':
			case 'unignore':
				if (args.length < 2) return this.say(con, room, "Debe especificar un usuario.");
				if (ResourceMonitor.isLocked(args[1])) {
					ResourceMonitor.unlock(args[1]);
					this.say(con, room, "El usuario " + toId(args[1]) + " ha dejado de ser ignorado.");
				} else {
					this.say(con, room, "El usuario " + toId(args[1]) + " no estaba ignorado.");
				}
				break;
			case 'clear':
				ResourceMonitor.cmdusage = {};
				ResourceMonitor.cmdtimes = {};
				ResourceMonitor.lockedlist = {};
				this.say(con, room, "Datos temporales del monitor de recursos borrados.");
				break;
			case 'logs':
				if (args.length < 2) return this.say(con, room, "Debe especificar un modo [on/off].");
				if (toId(args[1]) === "off") {
					config.ignorelogs = true;
					this.say(con, room, "Logs del monitor de recursos deshabilitados.");
				} else {
					config.ignorelogs = false;
					this.say(con, room, "Logs del monitor de recursos habilitados.");
				}
				break;
			case 'reload':
				try {
					this.uncacheTree('./tools/resourcemonitor.js');
					ResourceMonitor = require('./tools/resourcemonitor.js').monitor;
					ResourceMonitor.connection = con;
					this.say(con, room, "Monitor de recursos actualizado.");
				} catch (e) {
					error('failed to reload: ' + sys.inspect(e));
				}
				break;
			case 'help':
			default:
				this.say(con, room, "Lista de opciones: ignore, unignore, clear, logs, reload");
		}
	 },
	 
	 updateserver: function (arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;

		if (global.updateServerLock) {
			return this.say(con, room, "Ya había una actualizacion en curso");
		}

		global.updateServerLock = true;

		this.say(con, room, "Actualizando....");
		var self = this;

		var exec = require('child_process').exec;
		exec('git diff-index --quiet HEAD --', function (error) {
			var cmd = 'git pull --rebase';
			if (error) {
				if (error.code === 1) {
					// The working directory or index have local changes.
					cmd = 'git stash && ' + cmd + ' && git stash pop';
				} else {
					// The most likely case here is that the user does not have
					// `git` on the PATH (which would be error.code === 127).
					self.say(con, room, "Error:" + error);
					global.updateServerLock = false;
					return;
				}
			}
			var entry = "Running `" + cmd + "`";
			self.say(con, room, entry);
			exec(cmd, function (error, stdout, stderr) {
				("" + stdout + stderr).split("\n").forEach(function (s) {
					self.say(con, room, s);
				});
				global.updateServerLock = false;
			});
		});
	},
	
	ip: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		var self = this;
		require('http').request({
			hostname: 'fugal.net',
			path: '/ip.cgi',
			agent: false
		}, function(res) {
			if(res.statusCode != 200) {
				error('non-OK status: ' + res.statusCode);
				self.say(con, '', '/pm ' + by + ', Error al intentar obtener la ip: ' + 'non-OK status: ' + res.statusCode);
			}
			res.setEncoding('utf-8');
			var ipAddress = '';
			res.on('data', function(chunk) { ipAddress += chunk; });
			res.on('end', function() {
				self.say(con, '', '/pm ' + by + ', Ip del Bot: ' + ipAddress.trim());
			});
		}).on('error', function(err) {
			self.say(con, '', '/pm ' + by + ', Error al intentar obtener la ip');
		}).end();
	},
	
	ipdisable: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		var self = this;
		require('http').request({
			hostname: 'fugal.net',
			path: '/ip.cgi',
			agent: false
		}, function(res) {
			if(res.statusCode != 200) {
				error('non-OK status: ' + res.statusCode);
				self.say(con, '', '/pm ' + by + ', Error al intentar obtener la ip: ' + 'non-OK status: ' + res.statusCode);
			}
			res.setEncoding('utf-8');
			var ipAddress = '';
			res.on('data', function(chunk) { ipAddress += chunk; });
			res.on('end', function() {
				ipAddress = ipAddress.trim()
				if (ipAddress === arg) {
					config.disableBot = true;
					ResourceMonitor.log('Bot con IP ' + ipAddress + ' fue deshabilitado por ' + by, 'r');
				} else {
					console.log("IP = " + ipAddress + " | arg = " + arg + " | No deshabilitado.");
				}
			});
		}).on('error', function(err) {
			self.say(con, '', '/pm ' + by + ', Error al intentar obtener la ip');
		}).end();
	},
	
	ipenable: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		var self = this;
		require('http').request({
			hostname: 'fugal.net',
			path: '/ip.cgi',
			agent: false
		}, function(res) {
			if(res.statusCode != 200) {
				error('non-OK status: ' + res.statusCode);
				self.say(con, '', '/pm ' + by + ', Error al intentar obtener la ip: ' + 'non-OK status: ' + res.statusCode);
			}
			res.setEncoding('utf-8');
			var ipAddress = '';
			res.on('data', function(chunk) { ipAddress += chunk; });
			res.on('end', function() {
				ipAddress = ipAddress.trim()
				if (ipAddress === arg) {
					config.disableBot = false;
					ResourceMonitor.log('Bot con IP ' + ipAddress + ' fue habilitado por ' + by, 'r');
				} else {
					console.log("IP = " + ipAddress + " | arg = " + arg + " | No habilitado.");
				}
			});
		}).on('error', function(err) {
			self.say(con, '', '/pm ' + by + ', Error al intentar obtener la ip');
		}).end();
	},
	
	ipenableall: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		config.disableBot = false;
		this.say(con, '', '/pm ' + by + ', Bot habilitado independientemente de la IP.');
	},
	
	/*********************************************************
	* Basic commands
	*********************************************************/
	
	bot: 'about',
	about: function(arg, by, room, con) {
		if (this.hasRank(by, '#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		text += '**Bot para Pokémon Showdown** por: Quinella y TalkTakesTime. Versión traducida y adaptada por Ecuacion y xJoelituh. Gracias a Morfent por la parte del RolePlaying y a Parnassius por la de los Pokémon.';
		this.say(con, room, text);
	},
	
	ayuda: 'guide',
	help: 'guide',
	botguide: 'guide',
	guide: function(arg, by, room, con) {
		if (this.hasRank(by, '#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		text += 'Guia acerca del Bot y su funcionamiento: https://github.com/Ecuacion/PS-Espaol-Bot/blob/master/guia.md';
		this.say(con, room, text);
	},
	
	error: 'bug',
	issue: 'bug',
	bug: function(arg, by, room, con) {
		if (this.hasRank(by, '#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		text += 'Si el bot tiene un error o quieres hacer una sugerencia reporta aquí: https://github.com/Ecuacion/PS-Espaol-Bot/issues';
		this.say(con, room, text);
	},
	
	bottime: 'hora',
	hora: function(arg, by, room, con) {
		if (this.hasRank(by, '#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		var f = new Date();
		if (arg && arg === "-o") text += "Dia Semana: " + f.getDay() + " | ";
		text += "Hora del Bot: " + toDoubleDigit(f.getHours()) + ":" + toDoubleDigit(f.getMinutes()) + ":" + toDoubleDigit(f.getSeconds());
		this.say(con, room, text);
	},
	
	uptime: function (arg, by, room, con) {
		if (this.hasRank(by, '#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		text += '**Uptime:** ';
		var divisors = [52, 7, 24, 60, 60];
		var units = ['semana', 'día', 'hora', 'minuto', 'segundo'];
		var buffer = [];
		var uptime = ~~(process.uptime());
		do {
			divisor = divisors.pop();
			unit = uptime % divisor;
			buffer.push(unit > 1 ? unit + ' ' + units.pop() + 's' : unit + ' ' + units.pop());
			uptime = ~~(uptime / divisor);
		} while (uptime);

		switch (buffer.length) {
		case 5:
			text += buffer[4] + ', ';
			/* falls through */
		case 4:
			text += buffer[3] + ', ';
			/* falls through */
		case 3:
			text += buffer[2] + ', ' + buffer[1] + ', y ' + buffer[0];
			break;
		case 2:
			text += buffer[1] + ' y ' + buffer[0];
			break;
		case 1:
			text += buffer[0];
			break;
		}

		this.say(con, room, text);
	}, 
	
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
		if (!arg || arg.length > 18) return this.say(con, room, text + 'Nombre de usuario no válido.');
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
	
	inf: 'info',
	info: function(arg, by, room, con) {
		if (!this.settings.infocmds) this.settings.infocmds = {};
		if (!this.settings.infocmds.info) this.settings.infocmds.info = {};
		var text = '';
		if  (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		}
		if (!arg || arg === '') arg = 'list';
		if (toId(arg) === "list") {
			text += "Lista de tópicos: " + Object.keys(this.settings.infocmds.info).join(", ");
		} else {
			if (this.settings.infocmds.info[toId(arg)]) {
				text += this.settings.infocmds.info[toId(arg)];
			} else {
				text += 'No hay información adicional acerca de "' + toId(arg) + '"';
			}
		}
		this.say(con, room, text);
		
	},
	
	wall: 'infowall',
	iwall: 'infowall',
	infowall: function(arg, by, room, con, cmd) {
		if (!this.settings.infocmds) this.settings.infocmds = {};
		if (!this.settings.infocmds.info) this.settings.infocmds.info = {};
		var text = '';
		if  (!this.canUse('info', room, by)) {
			text += '/pm ' + by + ', ';
		}
		if (!arg || arg === '') arg = 'list';
		if (toId(arg) === "list") {
			text += "Lista de tópicos: " + Object.keys(this.settings.infocmds.info).join(", ");
		} else {
			if (this.settings.infocmds.info[toId(arg)]) {
				text += "/announce ";
				text += this.settings.infocmds.info[toId(arg)];
			} else {
				text += 'No hay información adicional acerca de "' + toId(arg) + '"';
			}
		}
		this.say(con, room, text);
		
	},
	
	helix: 'helixesp',
	helixesp: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('helixesp', room, by) && room.charAt(0) !== ',') {
			var text = '/pm ' + by + ', ';
		}
		var rand = Math.floor(22 * Math.random()) + 1;

		switch (rand) {
	 		case 1: text += "Todo apunta a que sí"; break;
	  		case 2: text += "Las ranitas de Asty hacen croack"; break;
			case 3: text += "Respuesta borrosa, prueba de nuevo"; break;
			case 4: text += "Sin ninguna duda."; break;
			case 5: text += "Mis fuentes dicen que no"; break;
			case 6: text += "Tal y como lo veo, sí"; break;
			case 7: text += "No entiendo gg."; break;
			case 8: text += "Concentrate y pregunta de nuevo"; break;
			case 9: text += "No parece buena idea"; break;
			case 10: text += "Es cierto"; break;
			case 11: text += "Mejor no decirtelo ahora."; break;
			case 12: text += "Muy dudable"; break;
			case 13: text += "Sí - definitivamente"; break;
			case 14: text += "Creo que sí"; break;
			case 15: text += "No puedo predecir eso"; break;
			case 16: text += "Parece que no"; break;
			case 17: text += "Esa pregunta es absurda"; break;
			case 18: text += "Mis fuentes dicen que sí"; break;
			case 19: text += "Parece que sí"; break;
			case 20: text += "No cuentes con ello"; break;
			case 21: text += "Eres un malo"; break;
			case 22: text += "Te insultaría pero eres alguien importante en el chat"; break;
		}
		this.say(con, room, text);
	},

	gg: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('gg', room, by) && room.charAt(0) !== ',') {
			var text = '/pm ' + by + ', ';
		}
		text += 'No entiendo gg';
		this.say(con, room, text);
	},
	
	b: 'busca',
	busca: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('busca', room, by) && room.charAt(0) !== ',') {
                        var text = '/pm ' + by + ', ';
                } 
		text += '[[' + stripCommands(arg) + ']]';
		this.say(con, room, text);
	},
	
	eventos: function(arg, by, room, con) {
		if (!this.canUse('info',room, by)) return this.say(con, "lobby", '/invite ' + by + ', eventos');
		this.say(con, room, 'Unios a la sala de Eventos haciendo click aquí: http://play.pokemonshowdown.com/eventos');
	},
	
	poke: function(arg, by, room, con) {
		if (this.canUse('poke', room, by) || room.charAt(0) === ',') {
			var text = '';
			if (room.charAt(0) !== ',') text += '!dt ';
		} else {
			var text = '/pm ' + by + ', ';
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
		} catch (e) {
			return this.say(con, '', '/pm ' + by + ', Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		var pokemon = Object.keys(pokedex);
		var rand = Math.floor(Math.random() * pokemon.length);
		text += pokedex[pokemon[rand]].species;
		this.say(con, room, text);
	},
	
	rpoke: 'randompoke',
	randompokemon: 'randompoke',
	randompoke: function(arg, by, room, con) {
		if (this.canUse('info', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Escribe el comando por mensaje privado.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var formatsdata = require('./formats-data.js').BattleFormatsData;
		} catch (e) {
			return this.say(con, room, 'Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		var pokemon = [];
		var extractedmon = '';
		var tiers = ["uber", "ou", "bl", "uu", "bl2", "ru", "bl3", "nu", "pu", "nfe", "lcuber", "lc", "cap", "unreleased"];
		var selectedTiers = arg.toLowerCase().replace(/[^a-zA-Z0-9,]/g,"").split(",");
		var tiersSearch = [];
		for (var j in selectedTiers) {
			if (tiers.indexOf(selectedTiers[j]) > -1 && tiersSearch.indexOf(selectedTiers[j]) == -1) tiersSearch.push(selectedTiers[j]);
		}
		
		for (var i in formatsdata) {
			if (formatsdata[i].tier) {
				if (arg != '') {
					if (tiersSearch.indexOf(formatsdata[i].tier.toLowerCase()) > -1) {
						pokemon.push(pokedex[i].species);
					}
				}
				else {
					if (formatsdata[i].tier != 'Unreleased' && formatsdata[i].tier != '' && formatsdata[i].tier != 'CAP') {
						pokemon.push(pokedex[i].species);
					}
				}
			}
		}
		
		if (pokemon.length == 0) return this.say(con, room, "No se han encontrado pokemon de las tiers especificadas");
		extractedmon = pokemon[Math.floor(Math.random()*pokemon.length)];
		text += extractedmon;
		this.say(con, room, text);
	},
	
	hpoke: 'hashpoke',
	hashpokemon: 'hashpoke',
	hashpoke: function(arg, by, room, con) {
		if (this.canUse('info', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Escribe el comando por mensaje privado.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
		} catch (e) {
			return this.say(con, room, 'Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		var pokemon = Object.keys(pokedex);
		var hash = getHash(toId(arg || by), pokemon.length);
		this.say(con, room, pokedex[pokemon[hash]].species);
	},
	
	sken: function(arg, by, room, con) {
		if (toId(by) !== 'sken' && !this.canUse('sken', room, by)) return;
		var rand = Math.floor(5 * Math.random()) + 1;
		var text = '';		
			switch (rand) 	{
				case 1: text += "The opposing Tyranitar used Aerial Ace. Mega-Heracross fainted."; break;
				case 2: text += "Eres un parguela"; break;
				case 3: text += "He sido tu admirador durante mucho tiempo, pero me estás empezando a caer gordo, me estás arruinando la vida con tu presencia."; break;
				case 4: text += "Sken, acaso te crees la divina papaya? Pues yo creo que no."; break;
				case 5: text += "Sken, te amo"; break;
					}
			this.say(con, room, text);

	},
	
	/*********************************************************
	* Information commands
	*********************************************************/
	
	indice: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		}
		text += "¡Bienvenidos a la comunidad de habla hispana! Si eres nuevo o tienes dudas revisa nuestro índice de guías: http://ps-salaespanol.proboards.com/thread/575/ndice-de-gu";
		this.say(con, room, text);
	},
	
	guias: 'guia',
	guia: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		}
		text += "Desde este índice (http://ps-salaespanol.proboards.com/thread/575/ndice-de-gu) podrás acceder a toda la información importante de la sala. By: Lost Seso";
		this.say(con, room, text);
	},
	
	foro: 'forum',
	forum: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		}
		text += "¡Visita nuestro foro para participar en multitud de actividades! http://ps-salaespanol.proboards.com/";
		this.say(con, room, text);
	},
	
	faqs: 'faq',
	faq: function(arg, by, room, con) {
		var text = '';
		if (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		}
		text += "Preguntas frecuentes sobre el funcionamiento del chat: http://ps-salaespanol.weebly.com/faq.html";
		this.say(con, room, text);
	},
	
	plug: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		} 
		text += 'Si quieres escuchar música y poder pasarlo bien hablando con gente, vente a nuestro plug oficial de la sala (https://plug.dj/salaesp/ ). Esperamos que lo disfrutes :^)';
		this.say(con, room, text);
	},
	
	suspect: function(arg, by, room, con) {
		if (!this.settings.infocmds) this.settings.infocmds = {};
		if (!this.settings.infocmds.suspect) this.settings.infocmds.suspect = {};
		var text = '';
		if  (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		}
		if (!arg || arg === '') arg = 'ou';
		if (toId(arg) === "list") {
			text += "Lista de suspects: " + Object.keys(this.settings.infocmds.suspect).join(", ");
		} else {
			if (this.settings.infocmds.suspect[toId(arg)]) {
				text += this.settings.infocmds.suspect[toId(arg)];
			} else {
				text += 'No hay información acerca del suspect de ' + toId(arg);
			}
		}
		this.say(con, room, text);
		
	},
	
	voiced: function(arg , by, room, con){
		var text = '';
		if (!this.canUse('info',room, by) && room.charAt(0) !== ','){
			text += '/pm ' + by + ', ';
		}
		text +='Si estas interesado en obtener el rango de voiced (+), primero tienes que seguir unos pasos. (http://bit.ly/1xWqypI). Ten en cuenta que pedir rango y comportarte bien solo por obtener rango no esta permitido. Si lo haces, tus posibilidades de ser voiced bajan mucho.';
		this.say(con, room, text);
	},

	VoD: 'vod',
	VOD: 'vod',
	vod: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		} 
			text +='VoD son las siglas de "Voiced of the Day" que se traduce al castellano como "Voiced por un dia". Este rango es precisamente esto, la oportunidad de obtener el rango de voiced (+) por un dia. Se suele dar a los ganadores de eventos y torneos. Para más información ve a: http://bit.ly/1B714Tj';
		this.say(con, room, text);	
	
	},

	modchat: function(arg, by, room, con) {
		var text  = '';
		if  (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		} 
		text +='Si no puedes hablar en el chat, normalmente es porque esta puesto el "Autoconfirmed moderated chat". Mientras esta activado solo pueden hablar los usuarios que tengan una cuenta de mas de una semana y hayan ganado una batalla. Esto ayuda a evitar spam y situaciones problemáticas.';
		this.say(con, room, text);	
	
	},
	
	
	castigos: 'sanciones',
	sanciones: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', Warn (aviso): Un aviso por comportamiento inadecuado  Mute (silenciar): Cuando un aviso no es suficiente, el usuario puede ser silenciado por 7/60minutos  Ban (aterrar): En casos extremos, el usuario es echado del chat (temporalmente o por siempre)';
		} 	
		text +='Warn (aviso): Un aviso por comportamiento inadecuado  Mute (silenciar): Cuando un aviso no es suficiente, el usuario puede ser silenciado por 7/60 min  Ban (aterrar): En casos extremos, el usuario es echado del chat (temporalmente o por siempre)';
		this.say(con, room, text);	
	},

	reglas: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by) || room.charAt(0) === ',') {
			text += '/pm ' + by + ', ';
			text +='Revisa las reglas del chat aquí: http://bit.ly/1abNG5E';
			this.say(con, '', text);
			return;
		} 
		text +='/announce Revisa las reglas del chat aquí: http://bit.ly/1abNG5E';
		this.say(con, room, text);	
	},

	staff: function(arg, by, room, con) {
		var text = '';
			if  (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		}
		text += 'Revisa la lista de staff: http://bit.ly/1xbOjJZ';
		this.say(con, room, text);	
	},
	
	/*********************************************************
	* Pokemon Info commands
	*********************************************************/
	
	gen: function(arg, by, room, con) {
		if (this.canUse('info', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Escribe el comando por mensaje privado.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
			var movedex = require('./moves.js').BattleMovedex;
			var abilities = require('./abilities.js').BattleAbilities;
			var items = require('./items.js').BattleItems;
		} catch (e) {
			return this.say(con, room, 'Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		var arg = toId(arg);
		if (arg == "") return this.say(con, room, "La generación de què?");
		if (aliases[arg]) arg = toId(aliases[arg]);
		if (arg == 'metronome') {
			text += 'Move: Gen 1; Item: Gen 4';
		}
		else if (pokedex[arg]) {
			if (pokedex[arg].num < 0) text += 'CAP';
			else if (pokedex[arg].num <= 151) text += 'Gen 1';
			else if (pokedex[arg].num <= 251) text += 'Gen 2';
			else if (pokedex[arg].num <= 386) text += 'Gen 3';
			else if (pokedex[arg].num <= 493) text += 'Gen 4';
			else if (pokedex[arg].num <= 649) text += 'Gen 5';
			else text += 'Gen 6';
		}
		else if (movedex[arg]) {
			if (movedex[arg].num <= 165) text += 'Gen 1';
			else if (movedex[arg].num <= 251) text += 'Gen 2';
			else if (movedex[arg].num <= 354) text += 'Gen 3';
			else if (movedex[arg].num <= 467) text += 'Gen 4';
			else if (movedex[arg].num <= 559) text += 'Gen 5';
			else if (movedex[arg].num <= 617) text += 'Gen 6';
			else text += 'CAP';
		}
		else if (abilities[arg]) {
			if (abilities[arg].num <= 0) text += 'CAP';
			else if (abilities[arg].num <= 76) text += 'Gen 3';
			else if (abilities[arg].num <= 123) text += 'Gen 4';
			else if (abilities[arg].num <= 164) text += 'Gen 5';
			else text += 'Gen 6';
		}
		else if (items[arg]) {
			text += 'Gen ' + items[arg].gen;
		}
		else text += 'No se ha encontrado Pokemon/movimiento/hablidad/objeto con ese nombre'
		this.say(con, room, text);
	},

	viablemoves: 'randommoves',
	randommoves: function(arg, by, room, con) {
		if (this.canUse('info', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Escribe el comando por mensaje privado.');
		}
		try {
			var aliases = require('./aliases.js').BattleAliases;
			var formatsdata = require('./formats-data.js').BattleFormatsData;
			var movedex = require('./moves.js').BattleMovedex;
		} catch (e) {
			return this.say(con, room, 'Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		arg = arg.toLowerCase().replace(/[^a-zA-Z0-9,]/g,"").split(",");
		var pokemon = arg[0];
		var doubleAlts = ["double", "doubles", "2", "triple", "triples", "3"];
		if (arg[1] && doubleAlts.indexOf(arg[1]) > -1) {
			text += "__Random doubles/triples moves__: ";
			var whichRandom = "randomDoubleBattleMoves";
		}
		else {
			text += "__Random singles moves__: ";
			var whichRandom = "randomBattleMoves";
		}
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (formatsdata[pokemon]) {
			moves = '';
			for (var i in formatsdata[pokemon][whichRandom]) {
				moves += ', ' + movedex[formatsdata[pokemon][whichRandom][i]].name;
			}
			if (moves == '') text += 'none';
			else text += moves.substring(2);
		}
		else {
			text += "Pokémon No encontrado";
		}
		this.say(con, room, text);
	},

	trad: function(arg, by, room, con) {
		if (this.canUse('info', room, by) || room.charAt(0) === ',') {
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Escribe el comando por mensaje privado.');
		}
		try {
			var trad = require('./tools/tradobject.js').trad;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		
		var word = toId(arg);
		if (word === "") return this.say(con, room, "¿Que tengo que traducir?");
		if (aliases[word]) word = toId(aliases[word]);
		
		var results = [];
		
		//if (parola == "metronome") return this.say(con, room, "metronomo (item), plessimetro (move)");
		
		for (var i in trad) {
			for (var j in trad[i]) {
				if (toId(trad[i][j].es) === word) results.push({"trad": trad[i][j].en, "cat": i});
				if (toId(trad[i][j].en) === word) results.push({"trad": trad[i][j].es, "cat": i});
			}
		}
		
		if (results.length) {
			if (results.length === 1) return this.say(con, room, results[0].trad);
			var resultstext = "";
			for (var k in results) {
				resultstext += results[k].trad + " (" + results[k].cat + ")";
				if (k < results.length - 1) resultstext += ", ";
			}
			return this.say(con, room, resultstext);
		}
		return this.say(con, room, "No se ha encontrado el objeto, movimiento, habilidad o naturaleza. Recuerde escribir las tildes en las palabras en Español.");
	},

	heavyslam: function(arg, by, room, con) {
		if (this.canUse('info', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Escribe el comando por mensaje privado.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		var pokemon = arg.split(',');
		if (pokemon.length < 2) return this.say(con, room, 'Debe especificar 2 Pokemon.');
		pokemon[0] = toId(pokemon[0]);
		pokemon[1] = toId(pokemon[1]);
		if (aliases[pokemon[0]]) pokemon[0] = toId(aliases[pokemon[0]]);
		if (aliases[pokemon[1]]) pokemon[1] = toId(aliases[pokemon[1]]);
		if (pokedex[pokemon[0]]) var weight0 = pokedex[pokemon[0]].weightkg;
		else return this.say(con, room, "Pokémon atacante no encontrado");
		if (pokedex[pokemon[1]]) var weight1 = pokedex[pokemon[1]].weightkg;
		else return this.say(con, room, "Pokémon defensor no encontrado");
		
		text += "Heavy slam/Heat crash base power: ";
		if (weight0 / weight1 <= 2) text += "40";
		else if (weight0 / weight1 <= 3) text += "60";
		else if (weight0 / weight1 <= 4) text += "80";
		else if (weight0 / weight1 <= 5) text += "100";
		else text += "120";
		this.say(con, room, text);
	},

	preevo: 'prevo',
	prevo: function(arg, by, room, con) {
		if (this.canUse('info', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Escribe el comando por mensaje privado.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		var pokemon = toId(arg);
		if (aliases[pokemon]) pokemon = toId(aliases[pokemon]);
		if (pokedex[pokemon]) {
			if (pokedex[pokemon].prevo) {
				text += pokedex[pokemon].prevo;
			}
			else text +='El Pokémon: ' + pokemon + ' no tiene preevolución.';
		}
		else text += "Pokémon No encontrado";
		this.say(con, room, text);
	},	

	priority: function(arg, by, room, con) {
		if (this.canUse('info', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Escribe el comando por mensaje privado.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var movedex = require('./moves.js').BattleMovedex;
			var learnsets = require('./learnsets-g6.js').BattleLearnsets;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		var arg = toId(arg);
		if (aliases[arg]) arg = toId(aliases[arg]);

		if (pokedex[arg]) {
			var prioritymoves = [];
			var pokemonToCheck = [arg];
			var i = true;
			while (i) {
				if (pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo) pokemonToCheck.push(pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo.toLowerCase());
				else i = false;
			}
			for (var j in pokemonToCheck) {
				if (learnsets[pokemonToCheck[j]]) {
					for (var k in learnsets[pokemonToCheck[j]].learnset) {
						if (movedex[k]) {
							if (movedex[k].priority > 0 && movedex[k].basePower > 0) {
								if (prioritymoves.indexOf(movedex[k].name) == -1) {
									prioritymoves.push(movedex[k].name);
								}
							}
						}
					}
				}
			}
			prioritymoves.sort();
			for (var l in prioritymoves) {
				text += prioritymoves[l];
				if (l != prioritymoves.length-1) text += ', ';
			}
		}
		else {
			text += "No encontrado";
		}
		if (text == '') text = 'No se han encontrado movimientos de prioridad.';
		this.say(con, room, text);
	},

	boosting: function(arg, by, room, con) {
		if (this.canUse('info', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Escribe el comando por mensaje privado.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var movedex = require('./moves.js').BattleMovedex;
			var learnsets = require('./learnsets-g6.js').BattleLearnsets;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		var arg = toId(arg);
		if (aliases[arg]) arg = toId(aliases[arg]);

		if (pokedex[arg]) {
			var boostingmoves = [];
			var pokemonToCheck = [arg];
			var i = true;
			while (i) {
				if (pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo) pokemonToCheck.push(pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo);
				else i = false;
			}
			for (var j in pokemonToCheck) {
				if (learnsets[pokemonToCheck[j]]) {
					for (var k in learnsets[pokemonToCheck[j]].learnset) {
						if (movedex[k]) {
							if ((movedex[k].boosts && movedex[k].target == 'self' && k != 'doubleteam' && k != 'minimize') || k == 'bellydrum') {
								if (boostingmoves.indexOf(movedex[k].name) == -1) {
									boostingmoves.push(movedex[k].name);
								}
							}
						}
					}
				}
			}
			boostingmoves.sort();
			for (var l in boostingmoves) {
				text += boostingmoves[l];
				if (l != boostingmoves.length-1) text += ', ';
			}
		}
		else {
			text += "No encontrado";
		}
		if (text == '') text = 'No se han encontrado movimientos de boosting';
		this.say(con, room, text);
	},

	recovery: function(arg, by, room, con) {
		if (this.canUse('info', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Escribe el comando por mensaje privado.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var movedex = require('./moves.js').BattleMovedex;
			var learnsets = require('./learnsets-g6.js').BattleLearnsets;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		var arg = toId(arg);
		if (aliases[arg]) arg = toId(aliases[arg]);

		if (pokedex[arg]) {
			var recoverymoves = [];
			var drainmoves = [];
			var pokemonToCheck = [arg];
			var i = true;
			while (i) {
				if (pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo) pokemonToCheck.push(pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo);
				else i = false;
			}
			for (var j in pokemonToCheck) {
				if (learnsets[pokemonToCheck[j]]) {
					for (var k in learnsets[pokemonToCheck[j]].learnset) {
						if (movedex[k]) {
							if (movedex[k].heal || k == "synthesis" || k == "moonlight" || k == "morningsun" || k == "wish" || k == "swallow") {
								if (recoverymoves.indexOf(movedex[k].name) == -1) {
									recoverymoves.push(movedex[k].name);
								}
							}
							else if (movedex[k].drain) {
								if (drainmoves.indexOf(movedex[k].name) == -1) {
									drainmoves.push(movedex[k].name);
								}
							}
						}
					}
				}
			}
			recoverymoves.sort();
			for (var l in recoverymoves) {
				text += recoverymoves[l];
				if (l != recoverymoves.length-1 || drainmoves.length > 0) text += ', ';
			}
			if (drainmoves.length > 0) {
				drainmoves.sort();
				text += '__';
				for (var k in drainmoves) {
					text += drainmoves[k];
					if (k != drainmoves.length-1) text += ', ';
				}
				text += '__';
			}
		}
		else {
			text += "No encontrado";
		}
		if (text == '') text = 'No se han encontrado movimientos de recuperación.';
		this.say(con, room, text);
	},

	hazards: 'hazard',
	hazard: function(arg, by, room, con) {
		if (this.canUse('info', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Escribe el comando por mensaje privado.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var movedex = require('./moves.js').BattleMovedex;
			var learnsets = require('./learnsets-g6.js').BattleLearnsets;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, '.');
		}
		var arg = toId(arg);
		if (aliases[arg]) arg = toId(aliases[arg]);

		if (pokedex[arg]) {
			var hazards = [];
			var pokemonToCheck = [arg];
			var i = true;
			while (i) {
				if (pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo) pokemonToCheck.push(pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo);
				else i = false;
			}
			for (var j in pokemonToCheck) {
				if (learnsets[pokemonToCheck[j]]) {
					for (var k in learnsets[pokemonToCheck[j]].learnset) {
						if (movedex[k]) {
							if (k == "stealthrock" || k == "spikes" || k == "toxicspikes" || k == "stickyweb") {
								if (hazards.indexOf(movedex[k].name) == -1) {
									hazards.push(movedex[k].name);
								}
							}
						}
					}
				}
			}
			hazards.sort();
			for (var l in hazards) {
				text += hazards[l];
				if (l != hazards.length-1) text += ', ';
			}
		}
		else {
			text += "No encontrado";
		}
		if (text == '') text = 'No se han encontrado hazards disponibles.';
		this.say(con, room, text);
	},
	

	typelearn: function(arg, by, room, con) {
		if (this.canUse('info', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Escribe el comando por mensaje privado.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
			var movedex = require('./moves.js').BattleMovedex;
			var learnsets = require('./learnsets-g6.js').BattleLearnsets;
		} catch (e) {
			return this.say(con, room, 'Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		
		arg = arg.toLowerCase().replace(/[^a-z0-9,]/g, '').split(',');
		if (!arg[1]) return this.say(con, room, 'Escribe el Pokémon y el tipo');
		arg[0] = arg[0].replace(/[+-]/g,"");
		arg[1] = arg[1].replace(/[+-]/g,"");
		if (aliases[arg[0]]) arg[0] = toId(aliases[arg[0]]);
		if (aliases[arg[1]]) arg[1] = toId(aliases[arg[1]]);
		
		if (pokedex[arg[1]]) {
			var pokemonarg = 1;
			var typearg = 0;
		}
		else if (pokedex[arg[0]]) {
			var pokemonarg = 0;
			var typearg = 1;
		}
		else return this.say(con, room, 'Pokémon No encontrado');
		var types = ['bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting', 'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock', 'steel', 'water'];
		if (types.indexOf(arg[typearg]) == -1) return this.say(con, room, 'Tipo No encontrado');
		if (pokedex[arg[pokemonarg]]) {
			var typemoves = [];
			var pokemonToCheck = [arg[pokemonarg]];
			var i = true;
			while (i) {
				if (pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo) pokemonToCheck.push(pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo);
				else i = false;
			}
			var exceptsmoves = ['beatup', 'crushgrip', 'electroball', 'flail', 'frustration', 'grassknot', 'gyroball', 'heatcrash', 'heavyslam', 'lowkick', 'naturalgift', 'punishment', 'return', 'reversal', 'spitup', 'trumpcard', 'wringout'];
			for (var j in pokemonToCheck) {
				if (learnsets[pokemonToCheck[j]]) {
					for (var k in learnsets[pokemonToCheck[j]].learnset) {
						if (movedex[k]) {
							if (movedex[k].type.toLowerCase() == arg[typearg] && (movedex[k].basePower > 0 || exceptsmoves.indexOf(k) > -1)) {
								if (typemoves.indexOf(movedex[k].name) == -1) {
									typemoves.push(movedex[k].name);
								}
							}
						}
					}
				}
			}
			typemoves.sort();
			for (var l in typemoves) {
				text += typemoves[l];
				if (l != typemoves.length-1) text += ', ';
			}
		}
		else {
			text += "No encontrado";
		}
		if (text == '') text = 'El movimiento:  ' + arg[typearg] + ' no ha sido encontrado';
		this.say(con, room, text);
	},
	 
	/*********************************************************
	* Administration commands
	*********************************************************/
	
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
	
	getauth: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		this.roomRanks = {};
		this.say(con, arg || room, "/roomauth");
		this.say(con, room, 'Lista de auth de la sala ' + (arg || room) + ' leida con éxito.');
	},
	
	getstaff: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		global.STAFF_CHANGES_FLAG = false;
		this.staffRanks = {};
		global.staffpopup = true;
		this.say(con, 'salastaff', "/roomauth");
		this.say(con, room, 'Lista de staff leida con éxito.');
	},
	
	autoinvite: 'autoinvitestaff',
	autoinvitestaff: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		if (toId(arg) === "off") {
			this.settings.blockinvite = 1;
			this.say(con, room, 'Modo autoinvite desactivado.');
		} else {
			this.settings.blockinvite = 0;
			this.staffRanks = {};
			global.staffpopup = true;
			this.say(con, 'salastaff', "/roomauth");
			this.say(con, room, 'Modo autoinvite activado.');
		}
		this.writeSettings();
	},
	
	settings: 'set',
	set: function(arg, by, room, con) {
		if (!this.hasRank(by, '#~') || room.charAt(0) === ',') return false;

		var settable = {
			banword: 1,
			autoban: 1,
			'0tol': 1,
			joinphrase: 1,
			me: 1,
			info: 1,
			say: 1,
			joke: 1,
			choose: 1,
			usagestats: 1,
			helixesp: 1,
			buzz: 1,
			gg: 1,
			poke: 1,
			busca: 1,
			sken: 1,
			hangman: 1,
			setrp: 1

		};
		var modOpts = {
			flooding: 1,
			flood: 1,
			caps: 1,
			stretching: 1,
			bannedwords: 1,
			youtube: 1,
			psservers: 1,
			spoiler: 1,
			porn: 1,
			snen: 1,
			spam: 1,
			double: 1,
			inapropiate: 1
		};

		var opts = arg.split(',');
		var cmd = toId(opts[0]);
		if (cmd === 'mod' || cmd === 'm' || cmd === 'modding') {
			if (!opts[1] || !toId(opts[1]) || !(toId(opts[1]) in modOpts)) return this.say(con, room, 'Comando Incorrecto: el modo correcto es ' + config.commandcharacter + 'set mod, [' +
				Object.keys(modOpts).join('/') + '](, [on/off])');

			if (!this.settings['modding']) this.settings['modding'] = {};
			if (!this.settings['modding'][room]) this.settings['modding'][room] = {};
			if (opts[2] && toId(opts[2])) {
				if (!this.hasRank(by, '#~')) return false;
				if (!(toId(opts[2]) in {on: 1, off: 1}))  return this.say(con, room, 'Comando Incorrecto: el modo correcto es ' + config.commandcharacter + 'set mod, [' +
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
	
	ic: function(arg, by, room, con) {
		if (!this.hasRank(by, '@#&~')) return false;
		if (!this.hasRank(by, '~') && room !== 'salastaff') return false;
		if (!this.settings.infocmds) this.settings.infocmds = {};
		if (!arg || !arg.length) return;
		var args = arg.split(" ");
		var cmdTable = {
			info: 1,
			suspect: 1
		};
		var cmdId = '';
		var cmdArgs = '';
		if (args[0] === "-s") {
			if (!this.sicCache.length) return this.say(con, room, "No hay datos ic guardados temporalmente");
			if (!args[1]) return;
			cmdId = toId(args[1]);
			if (!cmdTable[cmdId]) {
				return this.say(con, room, "No se reconoce el comando. La lista de comandos dinámicos es [" + Object.keys(cmdTable).join(", ") + "]");
			}
			if (!args[2]) return this.say(con, room, "Debes especificar un argumento");
			cmdArgs = toId(args[2]);
			if (!this.settings.infocmds[cmdId]) this.settings.infocmds[cmdId] = {};
			this.settings.infocmds[cmdId][cmdArgs] = this.sicCache;
			this.writeSettings();
			this.say(con, room, "Comando dinámico **" + config.commandcharacter + cmdId + " " + cmdArgs + "** ha sido modificado.");
		} else if (args[0] === "-d") {
			if (!args[1]) return;
			cmdId = toId(args[1]);
			if (!cmdTable[cmdId]) {
				return this.say(con, room, "No se reconoce el comando. La lista de comandos dinámicos es [" + Object.keys(cmdTable).join(", ") + "]");
			}
			if (!args[2]) return this.say(con, room, "Debes especificar un argumento");
			cmdArgs = toId(args[2]);
			if (!this.settings.infocmds[cmdId]) this.settings.infocmds[cmdId] = {};
			if (this.settings.infocmds[cmdId][cmdArgs]) delete this.settings.infocmds[cmdId][cmdArgs];
			else return this.say(con, room, "No existía el subcomando que se quería borrar");
			this.writeSettings();
			this.say(con, room, "Comando dinámico **" + config.commandcharacter + cmdId + " " + cmdArgs + "** ha sido borrado.");
		} else if (args[0] === "-n") {
			this.sicCache = '';
			this.say(con, room, "Datos temporales [ic] borrados");
		} else if (args[0] === "-v") {
			if (!this.sicCache.length) this.say(con, room, "No hay datos ic guardados temporalmente");
			this.say(con, room, this.sicCache);
		} else if (args[0] === "-h") {
			this.say(con, room, "Use el comando así: " + config.commandcharacter + "ic -[s/d/n/v] [comando] [argumento] " + " o bien " + config.commandcharacter + "ic [texto] para guardar temporalmente datos.");
		} else {
			this.sicCache = stripCommands(arg);
			this.say(con, room, "Datos guardados temporalemnte. Ahora puede asignar la información a un comando dinámico.");
		}
	},
	
	/*********************************************************
	* Moderation commands
	*********************************************************/
	
	blacklist: 'autoban',
	ban: 'autoban',
	ab: 'autoban',
	autoban: function(arg, by, room, con) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(con, room, 'Para poder banear usuarios, el Bot requiere de rango @ o superior.');
		var tarRoom = room; if (tarRoom === 'salastaff') tarRoom = 'espaol';
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
			if (!this.blacklistUser(tarUser, tarRoom)) {
				alreadyAdded.push(tarUser);
				continue;
			}
			this.say(con, tarRoom, '/roomban ' + tarUser + ', Usuario baneado permanentemente');
			this.say(con, tarRoom, '/modnote ' + tarUser + ' fue agregado a la lista negra por ' + by + '.');
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
		var tarRoom = room; if (tarRoom === 'salastaff') tarRoom = 'espaol';
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
			if (!this.unblacklistUser(tarUser, tarRoom)) {
				notRemoved.push(tarUser);
				continue;
			}
			this.say(con, tarRoom, '/roomunban ' + tarUser);
			removed.push(tarUser);
		}

		var text = '';
		if (removed.length) {
			text += 'Usuario(s) "' + removed.join('", "') + '" correctamente eliminado(s) de la lista negra. ';
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
		var tarRoom = room; if (tarRoom === 'salastaff') tarRoom = 'espaol';
		var text = '';
		if (!this.settings.blacklist || !this.settings.blacklist[tarRoom]) {
			text = 'La lista negra de esta sala esta vacía.';
		} else {
			if (arg.length) {
				var nick = toId(arg);
				if (nick.length < 1 || nick.length > 18) {
					text = 'Usuario incorrecto: "' + nick + '".';
				} else {
					text = 'El usuario "' + nick + '" ' + (nick in this.settings.blacklist[tarRoom] ? '' : 'NO ') + 'está en la lista negra de la sala ' + tarRoom + '.';
				}
			} else {
				var nickList = Object.keys(this.settings.blacklist[tarRoom]);
				if (!nickList.length) return this.say(con, room, '/pm ' + by + ', La lista negra de esta sala esta vacía.');
				this.uploadToHastebin(con, room, by, 'Los siguientes usuarios están baneados en ' + tarRoom + ':\n\n' + nickList.join('\n'))
				return;
			}
		}
		this.say(con, room, '/pm ' + by + ', ' + text);
	},
	
	zt: 'zerotol',
	zerotol: function(arg, by, room, con) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(con, room, 'Para poder banear usuarios, el Bot requiere de rango @ o superior.');
		var tarRoom = room; if (tarRoom === 'salastaff') tarRoom = 'espaol';
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
			if (!this.zeroTolUser(tarUser, tarRoom)) {
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
		var tarRoom = room; if (tarRoom === 'salastaff') tarRoom = 'espaol';
		
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
			if (!this.unzeroTolUser(tarUser, tarRoom)) {
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
	
	'v0tol': 'viewzerotol',
	vzt: 'viewzerotol',
	viewzerotollist: 'viewzerotol',
	viewzerotol: function(arg, by, room, con) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		var tarRoom = room; if (tarRoom === 'salastaff') tarRoom = 'espaol';
		
		var text = '';
		if (!this.settings.zerotol || !this.settings.zerotol[tarRoom]) {
			text = 'La lista de Cero Tolerancia de esta sala esta vacía.';
		} else {
			if (arg.length) {
				var nick = toId(arg);
				if (nick.length < 1 || nick.length > 18) {
					text = 'Usuario incorrecto: "' + nick + '".';
				} else {
					text = 'El usuario "' + nick + '" ' + (nick in this.settings.zerotol[tarRoom] ? '' : 'NO ') + 'está en la lista de Cero Tolerancia de la sala ' + room + '.';
				}
			} else {
				var nickList = Object.keys(this.settings.zerotol[tarRoom]);
				if (!nickList.length) return this.say(con, room, '/pm ' + by + ', La lista de Cero Tolerancia de esta sala esta vacía.');
				this.uploadToHastebin(con, room, by, 'Los siguientes usuarios están en la lista de Cero Tolerancia en ' + tarRoom + ':\n\n' + nickList.join('\n'))
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
		if (tarRoom === 'salastaff') tarRoom = 'espaol';

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
		if (tarRoom === 'salastaff') tarRoom = 'espaol';

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
		if (tarRoom === 'salastaff') tarRoom = 'espaol';

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
				this.uploadToHastebin(con, room, by, "Las siguientes frases están prohibidas " + (room.charAt(0) === ',' ? "globalmente" : "en " + tarRoom) + ":\n\n" + banList.join('\n'))
				return;
			}
		}
		this.say(con, room, text);
	},
	
	iw: 'inapropiateword',
	inapropiateword: function(arg, by, room, con) {
		if (!this.canUse('banword', room, by)) return false;
		if (!this.settings.inapropiatephrases) this.settings.inapropiatephrases = {};
		arg = arg.trim().toLowerCase();
		if (!arg) return false;
		var tarRoom = room;
		if (tarRoom === 'salastaff') tarRoom = 'espaol';

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		if (!this.settings.inapropiatephrases[tarRoom]) this.settings.inapropiatephrases[tarRoom] = {};
		if (arg in this.settings.inapropiatephrases[tarRoom]) return this.say(con, room, "La frase \"" + arg + "\" ya estaba en la lista de lenguaje inapropiado.");
		this.settings.inapropiatephrases[tarRoom][arg] = 1;
		this.writeSettings();
		this.say(con, room, "La frase \"" + arg + "\" está ahora en la lista de lenguaje inapropiado.");
	},
	
	uiw: 'uninapropiateword',
	uninapropiateword: function(arg, by, room, con) {
		if (!this.canUse('banword', room, by)) return false;
		arg = arg.trim().toLowerCase();
		if (!arg) return false;
		var tarRoom = room;
		if (tarRoom === 'salastaff') tarRoom = 'espaol';

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		if (!this.settings.inapropiatephrases || !this.settings.inapropiatephrases[tarRoom] || !(arg in this.settings.inapropiatephrases[tarRoom])) 
			return this.say(con, room, "La frase \"" + arg + "\" no estaba en la lista de lenguaje inapropiado.");
		delete this.settings.inapropiatephrases[tarRoom][arg];
		if (!Object.size(this.settings.inapropiatephrases[tarRoom])) delete this.settings.inapropiatephrases[tarRoom];
		if (!Object.size(this.settings.inapropiatephrases)) delete this.settings.inapropiatephrases;
		this.writeSettings();
		this.say(con, room, "La frase \"" + arg + "\" ha dejado de estar en la lista de lenguaje inapropiado.");
	},
	
	viewinapropiatephrases: 'viewinapropiatewords',
	viw: 'viewinapropiatewords',
	viewinapropiatewords: function(arg, by, room, con) {
		if (!this.canUse('banword', room, by)) return false;
		arg = arg.trim().toLowerCase();
		var tarRoom = room;
		if (tarRoom === 'salastaff') tarRoom = 'espaol';

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		var text = "";
		if (!this.settings.inapropiatephrases || !this.settings.inapropiatephrases[tarRoom]) {
			text = "No hay frases inapropiadas en esta sala.";
		} else {
			if (arg.length) {
				text = "La frase \"" + arg + "\" " + (arg in this.settings.inapropiatephrases[tarRoom] ? "" : "NO ") + "es inapropiada " +
					(room.charAt(0) === ',' ? "en todas partes" : "en " + room) + ".";
			} else {
				var banList = Object.keys(this.settings.inapropiatephrases[tarRoom]);
				if (!banList.length) return this.say(con, room, "No hay frases inapropiadas en esta sala.");
				this.uploadToHastebin(con, room, by, "Las siguientes frases son inapropiadas " + (room.charAt(0) === ',' ? "globalmente" : "en " + tarRoom) + ":\n\n" + banList.join('\n'))
				return;
			}
		}
		this.say(con, room, text);
	},
	
	jf: 'joinphrase',
	joinphrase: function(arg, by, room, con) {
		if (!this.canUse('joinphrase', room, by)) return false;
		if (!this.settings.joinphrases) this.settings.joinphrases = {};
		if (room.charAt(0) !== ',' && toId(arg) in {'on': 1, 'enable': 1}) {
			if (!this.settings.disjoinphrases) this.settings.disjoinphrases = {};
			if (this.settings.disjoinphrases[room]) delete this.settings.disjoinphrases[room];
			else return this.say(con, room, "Las frases de entrada ya estaban activadas en esta sala");
			this.writeSettings();
			return this.say(con, room, "Las frases de entrada han sido activadas en esta sala");
		}
		if (room.charAt(0) !== ',' &&  toId(arg) in {'off': 1, 'disable': 1}) {
			if (!this.settings.disjoinphrases) this.settings.disjoinphrases = {};
			if (!this.settings.disjoinphrases[room]) this.settings.disjoinphrases[room] = 1;
			else return this.say(con, room, "Las frases de entrada ya estaban desactivadas en esta sala");
			this.writeSettings();
			return this.say(con, room, "Las frases de entrada han sido desactivadas en esta sala");
		}
		var args = arg.split(",");
		if (args.length < 2) return this.say(con, room, "Use el comando así: " + config.commandcharacter + "joinphrase [set/delete], [usuario], [frase]");
		if (toId(args[0]) !== "delete" && args.length === 2) {
			arg = "set," + toId(args[0]) + "," + arg.substr(args[0].length + 1);
			args = arg.split(",");
		}
		arg = arg.substr(args[0].length + args[1].length + 2);
		arg = arg.trim();
		var user = toId(args[1]);
		if (!user) return false;
		var tarRoom = room;
		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}
		switch (toId(args[0])) {
			case 'set':
			case 'add':
			case 'change':
				if (!arg) return false;
				if (args.length < 3) return this.say(con, room, "Use el comando así: " + config.commandcharacter + "joinphrase [set/delete], [usuario], [frase]");
				if (!this.settings.joinphrases[tarRoom]) this.settings.joinphrases[tarRoom] = {};
				this.settings.joinphrases[tarRoom][user] = stripCommands(arg);
				this.writeSettings();
				this.say(con, room, "La frase de entrada para el usuario " + user + " ha sido modificada " + ((tarRoom === 'global') ? 'para todas las salas.' : 'para esta sala.'));
				break;
			case 'delete':
				if (!this.settings.joinphrases[tarRoom]) this.settings.joinphrases[tarRoom] = {};
				if (!this.settings.joinphrases[tarRoom][user]) return this.say(con, room, "No existía ninguna frase de entrada para el usuario " + user + ((tarRoom === 'global') ? ' en todas las salas.' : ' en esta sala.'));
				delete this.settings.joinphrases[tarRoom][user];
				this.writeSettings();
				this.say(con, room, "La frase de entrada para el usuario " + user + " ha sido eliminada " + ((tarRoom === 'global') ? 'para todas las salas.' : 'para esta sala.'));
				break;
			default:
				return this.say(con, room, "Use el comando así: " + config.commandcharacter + "joinphrase [set/delete], [usuario], [frase]");
		}
	},
	
	vjf: 'viewjoinphrases',
	viewjoinphrases: function(arg, by, room, con) {
		if (!this.canUse('joinphrase', room, by)) return false;
		if (!this.settings.joinphrases) this.settings.joinphrases = {};
		arg = toId(arg);
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}
		if (!this.settings.joinphrases[tarRoom]) this.settings.joinphrases[tarRoom] = {};
		
		if (arg) {
			if (arg.length < 1 || arg.length > 18) return this.say(con, room, "El nick que ha especificado no es válido.");
			if (this.settings.joinphrases[tarRoom][arg]) return this.say(con, room, this.settings.joinphrases[tarRoom][arg]);
			else return this.say(con, room, "No hay ninguna frase de entrada adjudicada a " + arg + ".");
		}
		
		var List = [];
		for (var i in this.settings.joinphrases[tarRoom]) {
			List.push(i + " => " + this.settings.joinphrases[tarRoom][i]);
		}
		if (!List.length) return this.say(con, room, "No hay frases de entrada en esta sala.");
		this.uploadToHastebin(con, room, by, "Las siguientes frases de entrada estan adjudicadas " + (room.charAt(0) === ',' ? "en todas las salas" : "en " + room) + ":\n\n" + List.join('\n'));
	},
	 
	/*********************************************************
	* Battles, tours and ladder (Bot Battling System)
	*********************************************************/
	
	batalla: 'allowbattle',
	permitirbatalla: 'allowbattle',
	allowbattles: 'allowbattle',
	allowbattle: function(arg, by, room, con) { 
		if (!this.hasRank(by, '~')) return false;
		if (toId(arg) === "off") {
			this.say(con, '', '/blockchallenges');
			this.say(con, room, 'Sistema de batallas automaticas desactivado');
		} else {
			this.say(con, '', '/unblockchallenges');
			this.say(con, room, 'Sistema de batallas automaticas activado');
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
	
	move: function(arg, by, room, con) { 
		if (!this.hasRank(by, '+%@#~')) return false;
		if (arg && !this.hasRank(by, '~')) return false;
		
		if (room.indexOf("battle-") === -1) return this.say(con, room, 'Esto solo puede ser usado en una sala de batalla');
		try {
			if (!arg) BattleBot.receive(con, room, "|forcemove|");
			else if (arg === "random") BattleBot.receive(con, room, "|forcemoverandom|");
			else this.say(con, room, '/choose ' + arg);
		} catch (e) {
			this.say(con, room, 'Error en el modulo de batalla. No se pudo escoger movimiento');
		}
		
	},
	
	jointours: function(arg, by, room, con) { 
		if (!this.hasRank(by, '~')) return false;
		if (room.charAt(0) === ',') return false;
		if (!this.settings.jointours) this.settings.jointours = {};
		if (toId(arg) === "off") {
			if (!this.settings.jointours[room]) return this.say(con, room, 'El modo "union a torneos" ya estaba desactivado en la sala ' + room);
			delete this.settings.jointours[room];
			this.writeSettings();
			this.say(con, room, 'Modo "union a torneos" desactivado en la sala ' + room);
		} else {
			if (this.settings.jointours[room]) return this.say(con, room, 'El modo "union a torneos" ya estaba activado en la sala ' + room);
			this.settings.jointours[room] = 1;
			this.writeSettings();
			this.say(con, room, 'Modo "union a torneos" activado en la sala ' + room);
		}
	},
	
	sb: 'searchbattle',
	searchbattle: function(arg, by, room, con) { 
		if (!this.hasRank(by, '%@#~')) return false;
		
		if (!this.tourFormats || !this.tourFormats[toId(arg)]) return this.say(con, room, 'El formato ' + toId(arg) + ' no se reconoce como un formato válido');
		if (!this.formats || (!this.formats[toId(arg)] && !BattleBot.teamBuilder.hasTeam(arg))) return this.say(con, room, 'No poseo equipos para jugar en el formato ' + toId(arg) + '. Por favor edite teams.js');
		this.ratedRoom = room;
		
		var team = BattleBot.teamBuilder.getTeam(arg);
		if (team) this.say(con, '', '/useteam ' + team);
		this.say(con, '', '/search ' + arg);
	},
	
	chall: 'challenge',
	challenge: function(arg, by, room, con) { 
		if (!this.hasRank(by, '%@#~')) return false;
		var args = arg.split(",");
		if (args.length < 2) return this.say(con, room, 'Usa el comando así: ' + config.commandcharacter + "challenge [usuario], [formato]");
		
		if (!this.tourFormats || !this.tourFormats[toId(args[1])]) return this.say(con, room, 'El formato ' + toId(args[1]) + ' no se reconoce como un formato válido');
		if (!this.formats || (!this.formats[toId(args[1])] && !BattleBot.teamBuilder.hasTeam(args[1]))) return this.say(con, room, 'No poseo equipos para jugar en el formato ' + toId(args[1]) + '. Por favor edite teams.js');
		
		var team = BattleBot.teamBuilder.getTeam(args[1]);
		if (team) this.say(con, '', '/useteam ' + team);
		this.say(con, '', '/challenge ' + toId(args[0]) + ", " + toId(args[1]));
	},
	
	tourjoin: 'jointour',
	jt: 'jointour',
	jointour: function(arg, by, room, con) {
		if (!this.hasRank(by, '%@#~')) return false;
		if (!this.tourData[room] || !this.tourData[room].format) return this.say(con, room, 'No había ningún torneo en esta sala al que unirse');
		if (this.tourData[room].isJoined) return this.say(con, room, 'Error al intentar unirse: Ya estoy participando en este torneo');
		if (this.tourData[room].isStarted) return this.say(con, room, 'Error al intentar unirse: El torneo ya había empezado');
		var format = this.tourData[room].format;
		if (!this.formats || (!this.formats[toId(format)] && !BattleBot.teamBuilder.hasTeam(format))) return this.say(con, room, 'No poseo equipos para jugar un torneo en el formato ' + format + '. Por favor edite teams.js');
		this.say(con, room, "/tour join");
	},
	
	leavetour: function(arg, by, room, con) {
		if (!this.hasRank(by, '#~')) return false;
		if (!this.tourData[room] || !this.tourData[room].format) return this.say(con, room, 'No había ningún torneo en esta sala.');
		if (!this.tourData[room].isJoined) return this.say(con, room, 'Error al intentar salir: No estoy participando en este torneo');
		this.say(con, room, "/tour leave");
	},
	
	teams: 'team',
	botteams: 'team',
	team: function(arg, by, room, con) {
		if (room === 'salastaff') {
			if (!this.hasRank(by, '@#&~')) return false;
		} else {
			if (!this.hasRank(by, '~')) return false;
		}
		if (!arg) return this.say(con, room, 'Uso correcto: ' + config.commandcharacter + 'team [add/delete], [name], [format], [Exportable en Hastebin: http://hastebin.com/raw/example]');
		arg = arg.split(',');
		var opt = toId(arg[0]);
		var self = this;
		switch (opt) {
			case 'add':
			case 'new':
				if (arg.length < 4) return this.say(con, room, 'Uso correcto: ' + config.commandcharacter + 'team [add/delete], [name], [format], [Exportable en Hastebin]');
				var name = toId(arg[1]);
				var format = toId(arg[2]);
				var link = arg[3].trim();
				var splink = link.split('/');
				link = 'http://hastebin.com/raw/' + splink[splink.length - 1];
				if (!this.tourFormats || !this.tourFormats[format]) return this.say(con, room, "El formato __" + format + "__ no existe");
				this.say(con, room, 'Descargando y procesando equipo... (' + link + ')');
				http.get(link, function (res) {
					var data = '';
					res.on('data', function (part) {
						data += part;
					});
					res.on('end', function (end) {
						if (data === '{"message":"Document not found."}') {
							self.say(con, room, "Error: El documento de Hastebin especificado está vacío");
							return;
						}
						var team, packed;
						try {
							team = teamTools.teamToJSON(data);
							packed = BattleBot.teamBuilder.packTeam(team);
						} catch (e) {
							debug(e.stack);
							self.say(con, room, "Error: Fallo en el formato del equipo, debe estar en formato exportable de PS");
							return;
						}
						if (BattleBot.teamBuilder.addTeam(name, format, packed)) {
							self.say(con, room, "El equipo __" + name + "__ ha sido agregado a la lista de equipos del bot");
						} else {
							self.say(con, room, "Error: Ya existía un equipo con ese id, especifique otro id distinto");
						}
					});
					res.on('error', function (end) {
						Bot.say(room, "Error al descargar el equipo: No se puede obtener ningún dato (Error en la conexión)");
					});
				}).on('error', function (e) {
					self.say(room, "Error al descargar el equipo: La conexión se ha interrumpido");
				});
				break;
			case 'delete':
			case 'remove':
				if (!this.hasRank(by, '~')) return this.say(con, room, 'Acceso denegado para eliminar equipos de la lista');
				if (arg.length < 2) return this.say(con, room, 'Uso correcto: ' + config.commandcharacter + 'team [add/delete], [name], [format], [Exportable en Hastebin]');
				var name = toId(arg[1]);
				if (BattleBot.teamBuilder.removeTeam(name)) {
					this.say(con, room, "El equipo __" + name + "__ fue eliminado correctamente de la lista de equipos");
				} else {
					this.say(con, room, "El equipo __" + name + "__ no estaba en la lista de equipos");
				}
				break;
			default:
				return this.say(con, room, 'Uso correcto: ' + config.commandcharacter + 'team [add/delete], [name], [format], [Exportable en Hastebin]');
		}
	},

	viewteamlist: 'teamlist',
	viewteamslist: 'teamlist',
	teamslist: 'teamlist',
	teamlist: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		var teamsStr = 'Lista de equipos del Bot:\n\n';
		var teams = BattleBot.teamBuilder.dynTeams;
		var nTeams = 0;
		for (var i in teams) {
			teamsStr += 'Id: ' + i + ' | Formato: ' + teams[i].format + ' | Pokemon: ' + teamTools.teamOverview(teams[i].packed) + '\n';
			nTeams++;
		}
		if (!nTeams) return this.say(con, '', '/pm ' + by + ',La lista de equipos del Bot está vacía');
		this.uploadToHastebin(con, room, by, teamsStr);
	},
	
	/*********************************************************
	* LeaderBoards Tournament commands
	*********************************************************/
	
	rankedtour: 'etour',
	etour: function(arg, by, room, con) { 
		if (!this.hasRank(by, '@#&~')) return false;
		if (room !== eTourConfig.toursRoom) return this.say(con, room, 'Este comando solo puede ser usado en la sala de Eventos.');
		var args = arg.split(",");
		if (args.length < 4) return this.say(con, room, 'Uso: ' + config.commandcharacter + 'etour [formato], [nombre], [inscripciones(min)], [autodq(min)]');
		if (!parseFloat(args[2]) || !parseFloat(args[3])) return this.say(con, room, 'Uso: ' + config.commandcharacter + 'etour [formato], [nombre], [inscripciones(min)], [autodq(min)]');
		if (toId(args[0]) === "random") args[0] = "randombattle";
		if (toId(args[0]) === "randomdobles") args[0] = "randomdoublesbattle";
		if (toId(args[0]) === "randomtriples") args[0] = "randomtriplesbattle";
		if (toId(args[0]) === "vgc" || toId(args[0]) === "vgc2015") args[0] = "Battle Spot Doubles (VGC 2015)";
		if (!this.tourFormats || !this.tourFormats[toId(args[0])]) return this.say(con, room, 'El formato ' + toId(args[0]) + ' no se reconoce como un formato valido para un torneo');
		if (this.tourData[eTourConfig.toursRoom]) return this.say(con, room, 'Ya hay un torneo en marcha, no se puede iniciar otro.');
		var actualTour = {hour: 0, minute: 0, tier: args[0], name: args[1].trim(), isRated: true, signups: parseFloat(args[2]), autodq: parseFloat(args[3])};
		eTourStatus.actualTour = actualTour;
		eTourStatus.statusData = {};
		this.say(con, eTourConfig.announceRoom, '/wall Torneo [' + actualTour.name + '] iniciado en la sala de Eventos: http://play.pokemonshowdown.com/' + eTourConfig.toursRoom);
		this.makeTour(con, eTourConfig.toursRoom, actualTour.tier, actualTour.signups * 60, actualTour.autodq);
		this.tours[eTourConfig.toursRoom].isRated = actualTour.isRated;
		this.say(con, eTourConfig.toursRoom, '/wall Inscripciones para el Torneo [' + actualTour.name + '] abiertas! En ' + actualTour.signups + ' minuto' + ((actualTour.signups !== 1) ? 's' : '') + ' dará comienzo!');
	},
	
	etourstdin: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		if (!arg || !arg.length) return this.say(con, room, 'Uso: ' + config.commandcharacter + 'etourstdin user1:rank1, user2:rank2...');
		if (!this.settings.tourPoints) this.settings.tourPoints = {};
		var args = arg.split(",");
		var aux, target, rank;
		for (var i = 0; i < args.length; i++) {
			aux = args[i].split(":");
			if (aux.length < 2) continue;
			target = toId(aux[0]);
			rank = parseInt(aux[1]);
			if (rank) {
				if (!this.settings.tourPoints[target]) this.settings.tourPoints[target] = rank;
			} else {
				if (this.settings.tourPoints[target]) delete this.settings.tourPoints[target];
			}
		}
		this.writeSettings();
		return this.say(con, room, 'Datos introducidos (sobrescritos al ranking)');
	},
	
	etourstdinplus: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		if (!arg || !arg.length) return this.say(con, room, 'Uso: ' + config.commandcharacter + 'etourstdinplus user1:plusrank1, user2:plusrank2...');
		if (!this.settings.tourPoints) this.settings.tourPoints = {};
		var args = arg.split(",");
		var aux, target, rank;
		for (var i = 0; i < args.length; i++) {
			aux = args[i].split(":");
			if (aux.length < 2) continue;
			target = toId(aux[0]);
			rank = parseInt(aux[1]);
			if (!rank) continue;
			if (!this.settings.tourPoints[target]) this.settings.tourPoints[target] = 0;
			this.settings.tourPoints[target] += rank;
		}
		this.writeSettings();
		return this.say(con, room, 'Datos introducidos (sumados al ranking)');
	},
	
	etourstdout: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		if (!this.settings.tourPoints) this.settings.tourPoints = {};
		var data = JSON.stringify(this.settings.tourPoints);
		this.uploadToHastebin(con, room, by, 'tourPoints = ' + data);
	},
	
	updatetourladder: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
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
				self.say(con, room, 'Tabla de puntuacines actualizada: ' + global.toursTable);
			});
		});

		req.write(toUpload);
		req.end();
	},
	
	cleartourladder: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;
		if (arg && arg !== "7m03ad2wfpl") return; //security key
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
				self.say(con, room, 'Tabla de puntuacines actualizada: ' + global.toursTable);
				self.settings.tourPoints = {};
				self.writeSettings();
				self.say(con, room, 'Datos borrados. Tabla de puntuaciones reseteada con éxito.');
			});
		});

		req.write(toUpload);
		req.end();
		
	},
	
	ladder: 'tourladder',
	tourladder: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		}
		if (!global.toursTable) text += 'No hay tabla de resultados subida.';
		else text += 'Tabla de puntuacines en torneos: ' + global.toursTable;
		this.say(con, room, text);
	},
	
	puntos: 'ranking',
	rank: 'ranking',
	ranking: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		}
		var target = toId(arg) || by;
		text += 'Puntuación del usuario ' + target + ": ";
		if (!this.settings.tourPoints) this.settings.tourPoints = {};
		if (!this.settings.tourPoints[toId(by)]) text += "0 Puntos.";
		else text += this.settings.tourPoints[toId(by)] + " Puntos.";
		this.say(con, room, text);
	},
	
	itour: 'infotour',
	infotour: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		}
		var f = new Date();
		var prog = eTourConfig.calendar;
		if (prog && prog.length && prog[f.getDate()]) {
			text += '**' + prog[f.getDate()].name + '** hoy a las **' + toDoubleDigit(prog[f.getDate()].hour) + ":" + toDoubleDigit(prog[f.getDate()].minute) + "** (Hora del Bot) Formato: **" + prog[f.getDate()].tier + "** en la sala de Eventos.";
		} else {
			text += 'Hoy no hay ningún torneo por puntos programado. Revise el calendario de torneos.';
		}
		this.say(con, room, text);
	},
	
	syspuntuaciones: 'pointssystem',
	sistemapuntuaciones: 'pointssystem',
	pointssystem: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		}
		text += 'Por ganar: ' + eTourConfig.pointsWinner + ' | Por llegar a la final: ' + eTourConfig.pointsSubWinner + ' | Semifinales: ' + eTourConfig.pointsSemiFinals + ' | Cuartos: ' + eTourConfig.pointsQuarterFinals;
		this.say(con, room, text);
	},
	
	calendar: 'tourcalendar',
	calendario: 'tourcalendar',
	tourcalendar: function(arg, by, room, con) {
		var text = '';
		if  (!this.canUse('info', room, by) && room.charAt(0) !== ',') {
			text += '/pm ' + by + ', ';
		}
		text += 'Calendario de torneos: http://ps-salaespanol.proboards.com/thread/1209/torneo-leaderboards-calendario-abril-2015';
		this.say(con, room, text);
	},
	
	/*********************************************************
	* Automated Tours
	*********************************************************/
	
	tourhelp: function(arg, by, room, con) { 
		if (!this.hasRank(by, '%@#&~')) return false;
		this.say(con, room, 'Usa el comando así: ' + config.commandcharacter + 'tour [Tier], [TiempoEnSec], [Max-Jugadores], [AutoDQ] - Todo es opcional.');
	},
	
	tournament: 'tour',
	tour: function(arg, by, room, con) { 
		if (!this.hasRank(by, '@#&~') || room.charAt(0) === ',') return false;
		if (this.tourData && this.tourData[room]) return this.say(con, room, 'Ya hay un torneo en marcha, no se puede iniciar otro.');
		arg = arg.replace(" ", "");
		if (!arg || !arg.length) {
			//default
			this.tours[room] = {
				players: 0,
				maxPlayers: 0,
				autodq: 2,
				now: Date.now(),
				timeout: 30000
			};
			this.say(con, room, '/tour new ou, elimination');
		}
		var args = arg.split(",");
		var format = toId(args[0]);
		var formatAliases = {
			'random': 'Random Battle',
			'randomdoubles': 'Random Doubles Battle',
			'randomtriples': 'Random Triples Battle',
			'doubles': 'Doubles OU',
			'triples': 'Smogon Triples',
			'vgc': 'Battle Spot Doubles (VGC 2015)',
			'vgc2015': 'Battle Spot Doubles (VGC 2015)',
			'ag': 'Anything Goes',
			'cc1v1': 'Challenge Cup 1v1',
			'aaa': 'Almost Any Ability',
			'hackcc': 'Monotype Random Battle',
			'monorandom': 'Hackmons Cup',
			'oras': 'OU',
			'bw': '[Gen 5] OU',
			'dpp': '[Gen 4] OU',
			'adv': '[Gen 3] OU',
			'gsc': '[Gen 2] OU',
			'rby': '[Gen 1] OU'
		};
		if ((!this.tourFormats || !this.tourFormats[format]) && formatAliases[format]) format = toId(formatAliases[format]);
		if (!this.tourFormats || !this.tourFormats[format]) return this.say(con, room, 'El formato ' + format + ' no se reconoce como un formato valido para un torneo');
		this.tours[room] = {
				players: 0,
				maxPlayers: 0,
				autodq: 2,
				now: Date.now(),
				timeout: 30000
		};
		if (args[1] && parseInt(args[1])) this.tours[room].timeout = parseInt(args[1]) * 1000;
		if (args[2] && parseInt(args[2])) this.tours[room].maxPlayers = parseInt(args[2]);
		if (args[3] && parseInt(args[3])) this.tours[room].autodq = parseInt(args[3]);
		this.say(con, room, '/tour new ' + format + ', elimination');
	},
	
	tours: 'autotours',
	progtours: 'autotours',
	autotours: function(arg, by, room, con) { 
		if (!this.hasRank(by, '~')) return false;
		if (toId(arg) === "off") {
			if (config.disabletours) return this.say(con, room, 'El modo "torneos programados" ya estaba deshabilitado.');
			config.disabletours = true;
			this.say(con, room, 'Modo "torneos programados" deshabilitado.');
		} else {
			if (!config.disabletours) return this.say(con, room, 'El modo "torneos programados" ya estaba habilitado.');
			config.disabletours = false;
			this.say(con, room, 'Modo "torneos programados" habilitado.');
		}
	},
	
	settour: 'setautomatedtour',
	progtour: 'setautomatedtour',
	setautomatedtour: function(arg, by, room, con) {
		if (!this.canUse('banword', room, by) || room.charAt(0) === ',') return false;
		if (!this.settings.autotours) this.settings.autotours = {}
		if (!arg) return this.say(con, room, "Use el comando así: " + config.commandcharacter + "progtour [hora], [minuto], [tier], [segundos para auto iniciarse], [minutos autodq], [laborales/findes]");
		var tarRoom = room;
		if (!this.settings.autotours[tarRoom]) this.settings.autotours[tarRoom] = {};
		var args = arg.split(",");
		if (args.length < 6) return this.say(con, room, "Use el comando así: " + config.commandcharacter + "progtour [hora], [minuto], [tier], [segundos para auto iniciarse], [minutos autodq], [laborales/findes]");
		var hour = parseInt(args[0]);
		var minute = parseInt(args[1]);
		var tier = toId(args[2]);
		var begintime = parseInt(args[3]);
		var autodq = parseFloat(args[4]);
		var finde = toId(args[5]);
		if (!(finde in {"laborales": 1, "findes": 1})) return this.say(con, room, "Use el comando así: " + config.commandcharacter + "progtour [hora], [minuto], [tier], [segundos para auto iniciarse], [minutos autodq], [laborales/findes]");
		if (!minute && minute !== 0) return this.say(con, room, "Use el comando así: " + config.commandcharacter + "progtour [hora], [minuto], [tier], [segundos para auto iniciarse], [minutos autodq], [laborales/findes]");
		if (!hour || !tier || !begintime || !autodq) return this.say(con, room, "Use el comando así: " + config.commandcharacter + "progtour [hora], [minuto], [tier], [segundos para auto iniciarse], [minutos autodq], [laborales/findes]");
		if (!this.tourFormats || !this.tourFormats[tier]) return this.say(con, room, 'El formato ' + tier + ' no se reconoce como un formato válido para un torneo');
		var hourId = finde + toDoubleDigit(hour) + toDoubleDigit(minute);
		if (this.settings.autotours[tarRoom][hourId]) return this.say(con, room, "En la franja horaria especificada ya estaba programado un torneo");
		this.settings.autotours[tarRoom][hourId] = {
			hour: hour,
			minute: minute,
			typedays: finde,
			tier: tier,
			begintime: begintime,
			autodq: autodq
		};
		this.writeSettings();
		this.say(con, room, "Se ha programado un torneo " + tier + ((finde === "findes") ? " los fines de samana" : " los días laborales") + " a las " + toDoubleDigit(hour) + ":" + toDoubleDigit(minute) + " (Hora del Bot)");
	},
	
	unsettour: 'unsetautomatedtour',
	unprogtour: 'unsetautomatedtour',
	unsetautomatedtour: function(arg, by, room, con) {
		if (!this.canUse('banword', room, by) || room.charAt(0) === ',') return false;
		if (!this.settings.autotours) this.settings.autotours = {}
		if (!arg) return this.say(con, room, "Use el comando así: " + config.commandcharacter + "unprogtour [hora], [minuto], [laborales/findes]");
		var tarRoom = room;
		if (!this.settings.autotours[tarRoom]) this.settings.autotours[tarRoom] = {};
		var args = arg.split(",");
		if (args.length < 3) return this.say(con, room, "Use el comando así: " + config.commandcharacter + "unprogtour [hora], [minuto], [laborales/findes]");
		var hour = parseInt(args[0]);
		var minute = parseInt(args[1]);
		var finde = toId(args[2]);
		if (!minute && minute !== 0) return this.say(con, room, "Use el comando así: " + config.commandcharacter + "unprogtour [hora], [minuto], [laborales/findes]");
		if (!hour) return this.say(con, room, "Use el comando así: " + config.commandcharacter + "unprogtour [hora], [minuto], [laborales/findes]");
		var hourId = finde + toDoubleDigit(hour) + toDoubleDigit(minute);
		if (!this.settings.autotours[tarRoom][hourId]) return this.say(con, room, "En la franja horaria especificada no hay programado ningún torneo");
		delete this.settings.autotours[tarRoom][hourId];
		this.writeSettings();
		this.say(con, room, "Se borrado el torneo programado " + ((finde === "findes") ? "los fines de samana" : "los días laborales") + " a las " + toDoubleDigit(hour) + ":" + toDoubleDigit(minute) + " (Hora del Bot)");
	},
	
	vpt: 'viewprogtours',
	viewprogtour: 'viewprogtours',
	viewprogtours: function(arg, by, room, con) {
		if (!this.canUse('banword', room, by) || room.charAt(0) === ',') return false;
		if (!this.settings.autotours) this.settings.autotours = {}
		var tarRoom = room;
		if (!this.settings.autotours[tarRoom]) this.settings.autotours[tarRoom] = {};
		var data = '';
		for (var i in this.settings.autotours[tarRoom]) {
			data += "[" + toDoubleDigit(this.settings.autotours[tarRoom][i].hour) + ":" + toDoubleDigit(this.settings.autotours[tarRoom][i].minute) + "] [" + this.settings.autotours[tarRoom][i].typedays + "] - Tier: " + this.settings.autotours[tarRoom][i].tier + " | Tiempo de Incripciones: " + this.settings.autotours[tarRoom][i].begintime + " sec | Autodq: " + this.settings.autotours[tarRoom][i].autodq + "m\n";
		}
		if (data === '') return this.say(con, room, "No ha torneos programados en esta sala");
		this.uploadToHastebin(con, room, by, "Torneos programdos en " + room + ":\n\n" + data);
	},
	
	/*********************************************************
	* Games Commands
	*********************************************************/
	
	ahorcado: 'hangman',
	hangman: function(arg, by, room, con) {
		if (!(room in EVENTS_ROOMS)) return false;
		if (!this.canUse('hangman', room, by)) return false;
		if (this.game[room]) {
			var res = this.game[room].game.getStatus();
			return this.say(con, room, "**Hangman:** " + res.word + " | " + res.saidKeys + " | Pista: " + this.game[room].game.clue);
		}
		
		/* Create game generator */
		var maxFail = false;
		if (arg) maxFail = parseInt(arg);
		this.game[room] = {
			type: 'Hangman',
			game: require('./tools/games.js').hangman
		};
		
		/* Get random phrase */
		var phrase = '';
		var clue = '';
		
		try {
			var hangmanWords = require('./tools/hangman-data.js').hangmanWords;
		} catch (e) {
			delete this.game[room]; //deallocate
			return this.say(con, '', '/pm ' + by + ', Se ha encontrado un error: Vuelve a probar en unos segundos.');
		}
		
		var Opts = Object.keys(hangmanWords);
		
		if (!Opts.length) {
			delete this.game[room]; //deallocate
			return this.say(con, room, "No hay ninguna palabra en la base de datos del juego de hangman. No se puede iniciar el juego.");
		}
		
		
		var randClue = Opts[Math.floor(Math.random() * Opts.length)];
		
		var wordsF = hangmanWords[randClue];
		
		phrase = wordsF[Math.floor(Math.random() * wordsF.length)];
		clue = randClue;
		
		/* Init game */
		var res = this.game[room].game.init(phrase);
		this.game[room].game.clue = clue;
		if (maxFail) {
			this.game[room].game.maxFail = maxFail;
			this.say(con, room, "**Hangman:** " + res.word + " | Pista: " + this.game[room].game.clue + " | Se permiten " + maxFail + " fallos");
		} else {
			this.say(con, room, "**Hangman:** " + res.word + " | Pista: " + this.game[room].game.clue);
		}
	},
	
	ph: 'pokemonhangman',
	pokehangman: 'pokemonhangman',
	pokemonhangman: function(arg, by, room, con) {
		if (!(room in EVENTS_ROOMS)) return false;
		if (!this.canUse('hangman', room, by)) return false;
		if (this.game[room]) return this.say(con, room, "Ya hay un juego en marcha, no se puede iniciar otro.");
		var maxFail = false;
		if (arg) maxFail = parseInt(arg);
		this.game[room] = {
			type: 'Hangman',
			game: require('./tools/games.js').hangman
		};
		var phrase = '';
		var Opts = ['pokemon', 'pokemon', 'move', 'ability', 'nature', 'item'];
		var chosen = Opts[Math.floor(Math.random() * Opts.length)];
		switch (chosen) {
			case 'pokemon':
				try {
					var pokedex = require('./pokedex.js').BattlePokedex;
				} catch (e) {
					delete this.game[room]; //deallocate
					return this.say(con, '', '/pm ' + by + ', Se ha encontrado un error: Vuelve a probar en unos segundos.');
				}
				var pokemon = Object.keys(pokedex);
				do {
					var rand = Math.floor(Math.random() * pokemon.length);
				} while (pokedex[pokemon[rand]].num <= 0);
				phrase = pokedex[pokemon[rand]].species.replace(/[-]/, " ");
				var res = this.game[room].game.init(phrase);
				var randClue = Math.floor(Math.random() * 4);
				switch(randClue) {
					case 0:
						this.game[room].game.clue = pokedex[pokemon[rand]].types[0] + " type";
						break;
					case 1:
						this.game[room].game.clue =  pokedex[pokemon[rand]].types[1] ? (pokedex[pokemon[rand]].types[1] + " type") : (pokedex[pokemon[rand]].types[0] + " type");
						break;
					case 2:
						if (pokedex[pokemon[rand]].num <= 151) this.game[room].game.clue = 'Gen 1';
						else if (pokedex[pokemon[rand]].num <= 251) this.game[room].game.clue = 'Gen 2';
						else if (pokedex[pokemon[rand]].num <= 386) this.game[room].game.clue = 'Gen 3';
						else if (pokedex[pokemon[rand]].num <= 493) this.game[room].game.clue = 'Gen 4';
						else if (pokedex[pokemon[rand]].num <= 649) this.game[room].game.clue = 'Gen 5';
						else this.game[room].game.clue = 'Gen 6';
						break;
					default:
						var formatsData = require('./formats-data.js').BattleFormatsData;
						if (formatsData[pokemon[rand]].tier) {
							this.game[room].game.clue = "Tier " + formatsData[pokemon[rand]].tier;
						} else {
							this.game[room].game.clue =  pokedex[pokemon[rand]].types[1] ? (pokedex[pokemon[rand]].types[1] + " type") : (pokedex[pokemon[rand]].types[0] + " type");
						}
				}
				break;
			case 'move':
				try {
					var movedex = require('./moves.js').BattleMovedex;
				} catch (e) {
					delete this.game[room]; //deallocate
					return this.say(con, '', '/pm ' + by + ', Se ha encontrado un error: Vuelve a probar en unos segundos.');
				}
				var moves = Object.keys(movedex);
				var rand = moves[Math.floor(Math.random() * moves.length)];
				var moveChosen = movedex[rand];
				phrase = moveChosen.name.replace(/[-]/, " ");
				var res = this.game[room].game.init(phrase);
				this.game[room].game.clue = "Move " + moveChosen.type + " type";
				break;
			case 'item':
				try {
					var items = require('./items.js').BattleItems;
				} catch (e) {
					delete this.game[room]; //deallocate
					return this.say(con, '', '/pm ' + by + ', Se ha encontrado un error: Vuelve a probar en unos segundos.');
				}
				var itemArr = Object.keys(items);
				var rand = itemArr[Math.floor(Math.random() * itemArr.length)];
				var itChosen = items[rand];
				phrase = itChosen.name.replace(/[-]/, " ");
				var res = this.game[room].game.init(phrase);
				this.game[room].game.clue = "Item gen " + itChosen.gen;
				break;
			case 'ability':
				try {
					var abilities = require('./abilities.js').BattleAbilities;
				} catch (e) {
					delete this.game[room]; //deallocate
					return this.say(con, '', '/pm ' + by + ', Se ha encontrado un error: Vuelve a probar en unos segundos.');
				}
				var abilitiesArr = Object.keys(abilities);
				var rand = abilitiesArr[Math.floor(Math.random() * abilitiesArr.length)];
				var abChosen = abilities[rand];
				phrase = abChosen.name.replace(/[-]/, " ");
				var res = this.game[room].game.init(phrase);
				this.game[room].game.clue = "Ability";
				break;
			case 'nature':
				var natures = ['Adamant', 'Bashful', 'Bold', 'Brave', 'Calm', 'Careful', 'Docile', 'Gentle', 'Hardy', 'Hasty', 'Impish', 'Jolly', 'Lax', 'Lonely', 'Mild', 'Modest', 'Naive', 'Naughty', 'Quiet', 'Quirky', 'Rash', 'Relaxed', 'Sassy', 'Serious', 'Timid'];
				phrase = natures[Math.floor(Math.random() * natures.length)].replace(/[-]/, " ");
				var res = this.game[room].game.init(phrase);
				this.game[room].game.clue = "Nature";
				break;
		}
		
		if (maxFail) {
			this.game[room].game.maxFail = maxFail;
			this.say(con, room, "**Hangman:** " + res.word + " | Pista: " + this.game[room].game.clue + " | Se permiten " + maxFail + " fallos");
		} else {
			this.say(con, room, "**Hangman:** " + res.word + " | Pista: " + this.game[room].game.clue);
		}
		
	},
	
	g: 'guess',
	guess: function(arg, by, room, con) {
		if (!(room in EVENTS_ROOMS)) return false;
		if (!this.game[room] || !this.game[room].type) return;
		switch (this.game[room].type) {
			case 'Hangman':
				if (arg.length > 1) {
					if (arg.toLowerCase().replace(/[^a-z0-9ñ]/g, '') === this.game[room].game.wordStr) {
						var winner = by.substr(1);
						this.say(con, room, "Felicidades a **" + winner + "** por ganar el juego de hangman! La palabra era **" + this.game[room].game.wordStrF + "**");
						delete this.game[room]; //deallocate
						break;
					} else {
						this.game[room].game.failCount++;
					}
				}
				var res = this.game[room].game.guess(arg);
				if (this.game[room].game.maxFail && this.game[room].game.failCount > this.game[room].game.maxFail) {
					var losser = by.substr(1);
					this.say(con, room, "Se ha excedido el número máximo de errores y **" + losser + "** ha sido ahorcado! La palabra era **" + this.game[room].game.wordStrF + "**");
					delete this.game[room]; //deallocate
					break;
				}
				if (!res) break;
				if (res.type === 'end') {
					var winner = by.substr(1);
					this.say(con, room, "Felicidades a **" + winner + "** por ganar el juego de hangman! La palabra era **" + this.game[room].game.wordStrF + "**");
					delete this.game[room]; //deallocate
					break;
				}
				this.say(con, room, "**Hangman:** " + res.word + " | " + res.saidKeys + " | Pista: " + this.game[room].game.clue);
				break;
		}
	},
	
	endhangman: function(arg, by, room, con) {
		if (!(room in EVENTS_ROOMS)) return false;
		if (!this.canUse('hangman', room, by)) return false;
		if (!this.game[room] || this.game[room].type !== 'Hangman') return this.say(con, room, "No hay ningun juego  de hangman en marcha.");
		this.say(con, room, "El juego de " + this.game[room].type + " ha terminado! La palabra era " + this.game[room].game.wordStrF);
		delete this.game[room]; //deallocate
	},
	
	endgame: function(arg, by, room, con) {
		if (!(room in EVENTS_ROOMS)) return false;
		if (!this.canUse('banword', room, by)) return false;
		if (!this.game[room]) return this.say(con, room, "No hay ningun juego en marcha.");
		this.say(con, room, "El juego de " + this.game[room].type + " ha terminado!");
		delete this.game[room]; //deallocate
	},
	
	/*********************************************************
	* 0tol Commands
	*********************************************************/
	
	'0tole': '0tol',
	'0tol': function(arg, by, room, con) {
		var reply = function (text) {
			if (config.excepts.indexOf(toId(by)) !== -1 || this.staffRanks[toId(by)]) {
				this.say(con, room, text);
			} else {
				this.say(con, '', '/pm ' + by + ',' + text);
			}
		}.bind(this);
		var levelTable = {
			'low': 'Bajo',
			'normal': 'Normal',
			'high': 'Alto',
			'max': 'Máximo'
		};
		if (!this.settings['0tol']) this.settings['0tol'] = {};
		if (!arg) {
			if (this.isZeroTol(toId(by), room)) return reply('Actualmente **SÍ** Estás en la lista de tolerancia cero');
			else return reply('Actualmente **NO** estás en la lista de tolerancia cero');
		}
		if (toId(arg) === 'info') {
			Commands['info'].call(this, '0tol', by, room, con);
			return;
		}
		if (config.excepts.indexOf(toId(by)) === -1 && !this.staffRanks[toId(by)]) return false;
		if (toId(arg) === 'list') {
			if (config.excepts.indexOf(toId(by)) === -1) return false;
			//upload to hastebin
			if (this.settings['0tol']) {
				var nickList = Object.keys(this.settings['0tol']);
				if (!nickList.length) return reply('La lista de Cero Tolerancia está vacía.');
				var str = '', userT = '', al;
				for (var j in this.settings['0tol']) {
					userT = j;
					al = 18 - userT.length;
					for (var g = 0; g < al; g++) userT += ' ';
					str += 'User: ' + j + ' | 0tol: ' + this.settings['0tol'][j] + '\n';
				}
				this.uploadToHastebin(con, room, by, 'Los siguientes usuarios están en la lista de Tolerancia Cero:\n\n' + str)
				return;
			}
			return reply('La lista de Cero Tolerancia está vacía.');
		}
		var args = arg.split(',');
		if (args.length === 1) {
			arg = toId(arg);
			var subText = '';
			if (this.settings['0tol'][arg]) subText = '(' + levelTable[this.settings['0tol'][arg]] + ')';
			return reply('Usuario "' + arg + '" ' + (this.isZeroTol(arg, room) ? '**SÍ**' : '**NO**') + ' está en la lista de tolerancia cero. ' + subText);
		}
		if (config.excepts.indexOf(toId(by)) === -1) {
			if (room !== 'salastaff') return false;
			if (!this.canUse('0tol', room, by)) return false;
		}
		switch (toId(args[0])) {
			case 'add':
				if (args.length < 2) return reply('Uso correcto: ,0tol add, [usuario]:[low/normal/high/max], ...');
				var added = [], illegal = [], fail = [], alreadyAdded = [];
				var spl;
				var alTable = {
					'l': 'low',
					'n': 'normal',
					'h': 'high',
					'm': 'max'
				};
				for (var i = 1; i < args.length; i++) {
					spl = args[i].split(':');
					var targetUser = toId(spl[0]);
					if (!targetUser.length || targetUser.length > 18) {
						illegal.push(targetUser);
						continue;
					}
					var level = toId(spl[1] || 'normal');
					if (alTable[level]) level = alTable[level];
					if (!(level in {'low': 1, 'normal': 1, 'high': 1, 'max': 1})) {
						fail.push(targetUser);
						continue;
					}
					if (this.settings['0tol'][targetUser] && this.settings['0tol'][targetUser] === level) {
						alreadyAdded.push(targetUser);
						continue;
					}
					this.settings['0tol'][targetUser] = level;
					added.push(targetUser);
				}
				var text = '';
				if (added.length) {
					text += 'Usuario(s) "' + added.join('", "') + '" agregado(s) a la lista de tolerancia cero. ';
					this.writeSettings();
				}
				if (illegal.length) {
					text += illegal.length + ' usuarios tenían nicks ilegales. ';
				}
				if (fail.length) {
					text += 'Usuario(s) "' + fail.join('", "') + '" tenía(n) niveles no válidos. ';
				}
				if (alreadyAdded.length) {
					text += 'Usuario(s) "' + alreadyAdded.join('", "') + '" ya estaba(n) presente(s) en la lista. ';
				}
				reply(text);
				break;
			case 'remove':
			case 'delete':
				if (args.length < 2) return reply('Uso correcto: ,0tol delete, [usuario]');
				var removed = [], notRemoved = [];
				for (var i = 1; i < args.length; i++) {
					var targetUser = toId(args[i]);
					if (!this.settings['0tol'][targetUser]) {
						notRemoved.push(targetUser);
						continue;
					}
					removed.push(targetUser);
					delete this.settings['0tol'][targetUser];
				}
				var text = '';
				if (removed.length) {
					text += 'Usuario(s) "' + removed.join('", "') + '" eliminado(s) de la lista de tolerancia cero. ';
					this.writeSettings();
				}
				if (notRemoved.length) {
					text += 'Usuario(s) "' + notRemoved.join('", "') + '" no estaba(n) en la lista de tolerancia cero. ';
				}
				reply(text);
				break;
			default:
				reply('Uso correcto: ,0tol [add/delete/list] o ,0tol [usuario]');
		}
	},
	
	/*********************************************************/
	
	nop: function(arg, by, room, con) {
		return;
	}
};

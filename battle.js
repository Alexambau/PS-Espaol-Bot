module.exports = {
	/* Data and modules */
	data: {},
	iaModules: {},
	
	/* Config - Edit this */
	iaModList: {
		'orasrandom': './oras-random.js'
	},
	iaConfig: {
		'ou': 'orasrandom'
	},
	
	/* Functions */
	init: function () {
		for (var k in this.data) delete this.data[k];
		for (var i in this.iaModList) {
			try {
				this.iaModules[i] = require(this.iaModList[i]);
			} catch (e) {}
		}
		return;
	},
	
	send: function (connection, room, text) {
		send(connection, room + "|" + text);
	},
	
	sendDecision: function (connection, room, decision) {
		var str = '/choose ';
		if (!decision || !decision.length) return;
		for (var i = 0; i < decision.length; i++) {
			if (decision[i].type === 'switch') {
				str += 'switch ' + decision[i].switchIn;
			} else if (decision[i].type === 'team') {
				str += 'team ' + decision[i].team;
			} else if (decision[i].type === 'pass') {
				str += 'pass';
			} else {
				str += 'move ' + decision[i].move;
				if (decision[i].mega) str += ' mega';
			}
			if (i !== (decision[i].length -1)) str += ', ';
		}
		this.send(connection, room, str + "|" + (this.data[room].turn || "1"));
	},
	
	getRandomMove: function (room) {
		/*	Random decison: This function always returns a valid decision.
				Decision: Random Lead, Random Move, No Switch             */
		if (this.data[room]) return []; // no data
		var req = this.data[room].reqtest;
		if (!req) return []; //no request
		if (req.forceSwitch) {
			var desSwitch = [];
			var switchChosen = {};
			for (var i = 0; i < req.forceSwitch.length; i++) {
				if (!req.forceSwitch[i]) {
					desSwitch.push({type: 'pass'});
				} else {
					var posibbles = [];
					for (var j = 0; j < req.side.pokemon.length; j++ ) {
						if (!switchChosen[j] && req.side.pokemon[j].condition !== '0 fnt' && !req.side.pokemon[j].active) posibbles.push(j + 1);
					}
					var swChosen = posibbles[Math.floor(posibbles.length * Math.random())];
					switchChosen[swChosen] = true;
					desSwitch.push({type: 'switch', switchIn: swChosen});
				}
			}
			return desSwitch;
		} else if (req.active) {
			var desMoves = [];
			for (var i = 0; i < req.active.length; i++) {
				var actualDes = {};
				var moves = [];
				actualDes.type = 'move';
				if (req.side.pokemon[i].canMegaEvo) actualDes.mega = true;
				for (var j = 0; j < req.active[i].moves.length; j++) {
					if (!req.active[i].moves[j].disabled) moves.push(req.active[i].moves[j].move);
				}
				actualDes.move = moves[Math.floor(Math.random() * moves.length)];
				desMoves.push(actualDes);
			}
			return desMoves;
		} else if (req.teamPreview) {
			var teamPreData = [];
			for (var i = 0; i < 6; i++) teamPreData.push(i);
			teamPreData = teamPreData.randomize().join("");
			if (this.data[room].teampreview) {
				var nTeam = parseInt(this.data[room].teampreview);
				if (nTeam) {
					return [
						{type: 'team', team: teamPreData.substr(0, nTeam)}
					];
				}
			}
			switch (req.gametype) {
				case 'triples':
					return [
						{type: 'team', team: teamPreData.substr(0, 3)}
					];
				case 'doubles':
					return [
						{type: 'team', team: teamPreData.substr(0, 2)}
					];
				default:
					return [
						{type: 'team', team: teamPreData.substr(0, 1)}
					];
			}
		}
		return [];
	},
	
	makeDecision: function (connection, room) {
		var decision = {};
		if (!this.data[room]) return;
		if (this.data[room].tier) {
			var tier = toId(this.data[room].tier);
			if (this.iaConfig[tier]) {
				if (iaModList[this.iaConfig[tier]] && iaModList[this.iaConfig[tier]].getDecision) {
					try {
						decision = iaModList[this.iaConfig[tier]].getDecision(room, this.data[room]);
						this.sendDecision(connection, room, decision);
						return;
					} catch (e) {
						error(e.stack);
					}
				}
			}
		}
		try {
			decision = this.getRandomMove(room);
			this.sendDecision(connection, room, decision);
		} catch (e) {
			error(e.stack);
			this.send(connection, room, "Fatal Error parsing room [" + room + "] - " + sys.inspect(e));
			send(connection, [room + "|/forfeit", room + "|/leave"]); //forfeit and leave on fatal error
		}
	},
	
	finishBattle: function (connection, room, win) {
		if (win) {
			var winmsg = [
				':P noob',
				'GG',
				'g_g',
				'ggado easy',
				'rekt',
				'gg easy game'
			];
			this.send(connection, room, winmsg[Math.floor(Math.random() * winmsg.length)]);
		} else {
			var losemsg = [
				'gg Haxer',
				'bg',
				'just hax c:',
				'wow ok :(',
				'rip :(',
				'gg wp'
			];
			this.send(connection, room, losemsg[Math.floor(Math.random() * losemsg.length)]);
		}
		this.send(connection, room, '/leave');
		if (this.data[room]) delete this.data[room];
	},
	
	receive: function (connection, room, data) {
		/* IMPORTANT !
			This funtion gets all battle datas.
		*/
		var args = ['done'], kwargs = {};
		data = data.substr(1).trim();
		if (data !== '') {
			args = data.split('|');
			for (var i=0,len=args.length; i<len; i++) args[i] = args[i].trim();
		}
		while (args[args.length-1] && args[args.length-1].substr(0,1) === '[') {
			var bracketPos = args[args.length-1].indexOf(']');
			if (bracketPos <= 0) break;
			var argstr = args.pop();
			// default to '.' so it evaluates to boolean true
			kwargs[argstr.substr(1,bracketPos-1)] = (argstr.substr(bracketPos+1).trim() || '.');
		}
		//DATA = args, kwargs
		//run minors and majors
		if (!this.data[room]) this.data[room] = {};
		switch (args[0]) {
			/*----------------------------------
				Run majors
			--------------------------------------*/
			case 'title':
				if (!this.data[room]) this.data[room] = {};
				this.data[room].title = args[1];
				//welcome message if needed
				break;
			case 'deinit':
				//deallocate
				if (this.data[room]) delete this.data[room];
				break;
			case 'player':
				if (!args[1] || !args[2]) return;
				if (toId(args[2]) === toId(config.nick)) {
					//self
					this.data[room].self = {id: args[1], name: args[2], avatar: args[3]};
				} else {
					//opponent
					this.data[room].opponent = {id: args[1], name: args[2], avatar: args[3]};
				}
				break;
			case 'rated':
				this.data[room].rated = true;
				break;
			case 'gametype':
				this.data[room].gametype = args[1];
				if (args[1] === 'doubles') {
					this.data[room].statusData = {
						self: {
							side: {},
							pokemon: [
								{},
								{}
							]
						},
						foe: {
							side: {},
							pokemon: [
								{},
								{}
							]
						},
					};
				} else if (args[1] === 'triples') {
					this.data[room].statusData = {
						self: {
							side: {},
							pokemon: [
								{},
								{},
								{}
							]
						},
						foe: {
							side: {},
							pokemon: [
								{},
								{},
								{}
							]
						},
					};
				} else {
					this.data[room].statusData = {
						self: {
							side: {},
							pokemon: [
								{}
							]
						},
						foe: {
							side: {},
							pokemon: [
								{}
							]
						},
					};
				}
				break;
			case 'gen':
				this.data[room].gen = args[1];
				break;
			case 'tier':
				this.data[room].tier = args[1];
				break;
			case 'rule':
				if (!this.data[room].rules) this.data[room].rules = [];
				this.data[room].rules.push(args[1]);
				break;
			case 'variation':
				if (!this.data[room].variations) this.data[room].variations = [];
				this.data[room].variations.push(args[1]);
				break;
			case 'request':
				var reqtest = data.substr(8);
				try {
					this.data[room].request = JSON.parse(reqtest);
				} catch (e) {
					error("(REQUEST ISSUE)\n".red + e.stack);
				}
				//request received
				break;
			case 'start':
				this.data[room].started = true;
				this.send(connection, room, '/timer on');
				break;
			case 'teampreview':
				this.data[room].teampreview = args[1];
				this.send(connection, room, '/timer on');
				this.makeDecision(connection, room);
				break;
			case 'turn':
				this.data[room].turn = args[1];
			case 'inactive':
				this.makeDecision(connection, room);
				break;
			case 'callback':
				this.data[room].callback = args[1];
				this.makeDecision(connection, room);
				break;
			case 'win':
				this.finishBattle(connection, room, (args[2] && toId(args[2]) === toId(config.nick)));
				break;
			case 'join':
			case 'j':
				break;
			case 'leave':
			case 'l':
				break;
			case 'tie':
				this.send(connection, room, '/leave');
				break;
			case 'clearpoke':
				this.data[room].oppTeam = [];
				if (!this.data[room].statusData) return;
				for (var i = 0; i < this.data[room].statusData.self.pokemon.length; i++) {
					this.data[room].statusData.self.pokemon[i] = {};
				}
				for (var i = 0; i < this.data[room].statusData.foe.pokemon.length; i++) {
					this.data[room].statusData.foe.pokemon[i] = {};
				}
				break;
			case 'poke':
				if (args[2] && this.data[room].opponent && this.data[room].opponent.id === args[1]) {
					if (!this.data[room].oppTeam) this.data[room].oppTeam = [];
					var poke = {};
					var dataPoke = args[2].split(',');
					poke.species = dataPoke[0].trim();
					var argPoke = '';
					for (var i = 1; i < dataPoke.length; i++) {
						argPoke = dataPoke[i].trim();
						if (argPoke.charAt(0) === 'L') poke.level = parseInt(argPoke.substr(1));
						else poke.gender = argPoke;
					}
					this.data[room].oppTeam.push(poke);
				}
				break;
			case 'switch':
			case 'drag':
			case 'replace':
				if (!this.data[room].statusData) return; //no gametype (bug)
				if (args.length < 4) return;
				var nameDT = args[1].split(":");
				var pokeId = nameDT[1];
				var sideId = toId(nameDT[0]);
				var pokeIndex = 0;
				switch (sideId.charAt(2)) {
					case 'a':
						pokeIndex = 0;
						break;
					case 'b':
						pokeIndex = 1;
						break;
					case 'c':
						pokeIndex = 2;
						break;
				}
				//get pokemon  basicdata
				var poke = {};
				poke.name = pokeId;
				var dataPoke = args[2].split(',');
				poke.species = dataPoke[0].trim();
				var argPoke = '';
				for (var i = 1; i < dataPoke.length; i++) {
					argPoke = dataPoke[i].trim();
					if (argPoke.charAt(0) === 'L') poke.level = parseInt(argPoke.substr(1));
					else poke.gender = argPoke;
				}
				//get status and hp
				dataPoke = args[3].split(' ');
				var hpAux = dataPoke[0].split('/');
				if (!hpAux[1]) {
					poke.hp = 0;
				} else {
					poke.hp = (parseFloat(hpAux[0]) * 100) / parseFloat(hpAux[1]);
				}
				if (dataPoke[1]) {
					poke.status = dataPoke[1];
				} else {
					poke.status = false;
				}
				//set data
				if (this.data[room].opponent.id === sideId) {
					//offset
					if (!this.data[room].oppTeamOffSet) this.data[room].oppTeamOffSet = {};
					if (!this.data[room].oppTeamOffSet[pokeId]) this.data[room].oppTeamOffSet[pokeId] = {};
					for (var i in poke)
						this.data[room].oppTeamOffSet[pokeId][i] = poke[i];
					//active
					this.data[room].statusData.foe.pokemon[pokeIndex] = poke;
				} else {
					//active
					this.data[room].statusData.self.pokemon[pokeIndex] = poke;
				}				
				break;
			case 'detailschange':
				if (!this.data[room].statusData) return; //no gametype (bug)
				if (args.length < 3) return;
				var nameDT = args[1].split(":");
				var pokeId = nameDT[1];
				var sideId = toId(nameDT[0]);
				var pokeIndex = 0;
				switch (sideId.charAt(2)) {
					case 'a':
						pokeIndex = 0;
						break;
					case 'b':
						pokeIndex = 1;
						break;
					case 'c':
						pokeIndex = 2;
						break;
				}
				if (this.data[room].opponent.id === sideId) {
					if (!this.data[room].oppTeamOffSet) this.data[room].oppTeamOffSet = {};
					if (!this.data[room].oppTeamOffSet[pokeId]) this.data[room].oppTeamOffSet[pokeId] = {};
					this.data[room].oppTeamOffSet[pokeId].species = args[2];
					this.data[room].statusData.foe.pokemon[pokeIndex].species = args[2];
				} else {
					this.data[room].statusData.self.pokemon[pokeIndex].species = args[2];
				}
				break;
			case 'faint':
				if (!this.data[room].statusData) return; //no gametype (bug)
				if (args.length < 2) return;
				var nameDT = args[1].split(":");
				var pokeId = nameDT[1];
				var sideId = toId(nameDT[0]);
				var pokeIndex = 0;
				switch (sideId.charAt(2)) {
					case 'a':
						pokeIndex = 0;
						break;
					case 'b':
						pokeIndex = 1;
						break;
					case 'c':
						pokeIndex = 2;
						break;
				}
				if (this.data[room].opponent.id === sideId) {
					if (!this.data[room].oppTeamOffSet) this.data[room].oppTeamOffSet = {};
					if (!this.data[room].oppTeamOffSet[pokeId]) this.data[room].oppTeamOffSet[pokeId] = {};
					this.data[room].oppTeamOffSet[pokeId].fainted = true;
					this.data[room].statusData.foe.pokemon[pokeIndex] = {};
				} else {
					this.data[room].statusData.self.pokemon[pokeIndex] = {};
				}
				break;
			case 'swap':
				if (!this.data[room].statusData) return; //no gametype (bug)
				if (args.length < 3) return;
				var nameDT = args[1].split(":");
				var pokeId = nameDT[1];
				var sideId = toId(nameDT[0]);
				var pokeIndex = 0;
				switch (sideId.charAt(2)) {
					case 'a':
						pokeIndex = 0;
						break;
					case 'b':
						pokeIndex = 1;
						break;
					case 'c':
						pokeIndex = 2;
						break;
				}
				var swapPos = parseInt(args[2]);
				if (this.data[room].opponent.id === sideId) {
					var aux = this.data[room].statusData.foe.pokemon[pokeIndex];
					this.data[room].statusData.foe.pokemon[pokeIndex] = this.data[room].statusData.foe.pokemon[swapPos];
					this.data[room].statusData.foe.pokemon[swapPos] = aux;
				} else {
					var aux = this.data[room].statusData.self.pokemon[pokeIndex];
					this.data[room].statusData.self.pokemon[pokeIndex] = this.data[room].statusData.self.pokemon[swapPos];
					this.data[room].statusData.self.pokemon[swapPos] = aux;
				}
				break;
			case 'move':
				if (!this.data[room].statusData) return; //no gametype (bug)
				if (args.length < 3) return;
				var nameDT = args[1].split(":");
				var pokeId = nameDT[1];
				var sideId = toId(nameDT[0]);
				var pokeIndex = 0;
				switch (sideId.charAt(2)) {
					case 'a':
						pokeIndex = 0;
						break;
					case 'b':
						pokeIndex = 1;
						break;
					case 'c':
						pokeIndex = 2;
						break;
				}
				if (this.data[room].opponent.id === sideId) {
					if (!this.data[room].oppTeamOffSet) this.data[room].oppTeamOffSet = {};
					if (!this.data[room].oppTeamOffSet[pokeId]) this.data[room].oppTeamOffSet[pokeId] = {};
					if (!this.data[room].oppTeamOffSet[pokeId].moves[args[2]]) this.data[room].oppTeamOffSet[pokeId].moves[args[2]] = 0; 
					++this.data[room].oppTeamOffSet[pokeId].moves[args[2]]; //register move usage
				}
				break;
			
				
			/*----------------------------------
				Run minors
			--------------------------------------*/
			
			/*-----------------------------------------------*/
			case 'done':
			default:
				return;
		}
	}
};
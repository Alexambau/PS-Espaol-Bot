module.exports = {
	gen6_get_mux: function (typeA, typesB, not_inmune) {
		var mux = 1;
		for (var i = 0; i < typesB.length; i++) {
			if (this.TypeChartGen6[typesB[i]].damageTaken[typeA] === 1) {
				mux *= 2;
			} else if (this.TypeChartGen6[typesB[i]].damageTaken[typeA] === 2) {
				mux /= 2;
			} else if (this.TypeChartGen6[typesB[i]].damageTaken[typeA] === 3) {
				if (!not_inmune) mux = 0;
			}
		}
		return mux;
	},
	has_ability: function (pokemonA, abilities) {
		var pokedex = require('./pokedex.js').BattlePokedex;
		var data1 = pokedex[toId(pokemonA)];
		if (!data1) return false;
		for (var j = 0; j < abilities.length; j++) {
			ability = abilities[j];
			for (var i in data1.abilities) {
				if (data1.abilities[i] === ability) return true;
			}
		}
		return false;
	},
	inmune: function (moveData, pokemonA) {
		var pokedex = require('./pokedex.js').BattlePokedex;
		var data1 = pokedex[toId(pokemonA)];
		if (moveData.type === "Ground" && this.has_ability(pokemonA, ["Levitate"])) return true;
		if (moveData.type === "Water" && this.has_ability(pokemonA, ["Water Absorb", "Dry Skin", "Storm Drain"])) return true;
		if (moveData.type === "Fire" && this.has_ability(pokemonA, ["Flash Fire"])) return true;
		if (moveData.type === "Electric" && this.has_ability(pokemonA, ["Volt Absorb", "Lightning Rod"])) return true;
		if (moveData.isPowder && (data1.types[0] === "Grass" || (data1.types[1] && data1.types[1] === "Grass"))) return true;
		return false;
	},
	gen6_getDisadvantage: function (pokemonA, pokemonB) {
		//console.log(pokemonA + ", " + pokemonB);
		var pokedex = require('./pokedex.js').BattlePokedex;
		var data1 = pokedex[toId(pokemonA)];
		var data2 = pokedex[toId(pokemonB)];
		if (!data1 || !data2) return 2;
		var def = this.gen6_get_mux(data2.types[0], data1.types);
		if (data2.types[1]) def += this.gen6_get_mux(data2.types[1], data1.types);
		else def += 1;
		return def;
	},
	getViableSupportMoves: function (data) {
		var moves = [];
		var req = data.request;
		var pokemonA = data.statusData.self.pokemon[0].species;
		var pokemonB = data.statusData.foe.pokemon[0].species;
		var dataMove;
		var pokedex = require('./pokedex.js').BattlePokedex;
		var movedex = require('./moves.js').BattleMovedex;
		var data1 = pokedex[toId(pokemonA)];
		var data2 = pokedex[toId(pokemonB)];
		for (var i = 0; i < req.active[0].moves.length; i++) {
			if (req.active[0].moves[i].disabled) continue;
			dataMove = movedex[toId(req.active[0].moves[i].move)];
			if (!dataMove) continue;
			if (dataMove.category !== 'Status') continue;
			//discard moves
			
			/* Hazards - Foe side*/
			if (dataMove.name === "Spikes" && data.statusData.foe.side['Spikes'] && data.statusData.foe.side['Spikes'] > 2) continue;
			if (dataMove.name === "Toxic Spikes" && data.statusData.foe.side['Toxic Spikes'] && data.statusData.foe.side['Toxic Spikes'] > 1) continue;
			if (dataMove.name === "Stealth Rock" && data.statusData.foe.side['Stealth Rock']) continue;
			if (dataMove.name === "Sticky Web" && data.statusData.foe.side['Sticky Web']) continue;
			
			/* Self side */
			if (dataMove.target === 'allySide' && data.statusData.self.side[dataMove.name]) continue;
			
			/* Protect and wish moves : Detect, Endure, King's Shield, Protect, Quick Guard, Spiky Shield, or Wide Guard */ 
			var singleTurnMoves = {"Protect": 1, "Detect": 1, "Endure": 1, "King's Shield": 1, "Quick Guard": 1, "Spiky Shield": 1, "Wide Guard": 1};
			if ((dataMove.name in singleTurnMoves) && data.statusData.self.pokemon[0]['lastMove'] && data.statusData.self.pokemon[0]['lastMove'] in singleTurnMoves) continue;
			if (dataMove.name === "Wish" && data.statusData.self.pokemon[0]['lastMove'] && data.statusData.self.pokemon[0]['lastMove'] === "Wish") continue;
			
			/* Inmune */
			if (dataMove.target !== "self" && dataMove.target !== "allySide" && dataMove.target !== "foeSide") {
				if (this.gen6_get_mux(dataMove.type, data2.types) === 0) continue;
				if (data.statusData.foe.pokemon[0]['volatiles'] && data.statusData.foe.pokemon[0]['volatiles'][dataMove.name]) continue;
			}
			
			/* Bounceable */
			if (dataMove.isBounceable && this.has_ability(pokemonB, ["Magic Bounce"])) continue;
			
			/* Hazards Removal*/
			if (dataMove.name === "Rapid Spin" || dataMove.name === "Defog") {
				if (!data.statusData.self.side['Spikes'] && !data.statusData.self.side['Toxic Spikes'] && !data.statusData.self.side['Stealth Rock'] && !data.statusData.self.side['Sticky Web']) continue;
			}
			
			/* Status */
			if((dataMove.name in {"Refresh": 1, "Heal Bell": 1, "Aromatherapy": 1}) && !data.statusData.self.pokemon[0]['status']) continue;
			if (dataMove.status && data.statusData.foe.pokemon[0]['status']) continue;
			if ((dataMove.status === "par") && (data2.types[0] === "Electric" || (data2.types[1] && (data2.types[1] === "Electric")))) continue;
			if ((dataMove.status === "brn") && (data2.types[0] === "Fire" || (data2.types[1] && (data2.types[1] === "Fire")))) continue;
			if ((dataMove.status === "tox" || dataMove.status === "psn") && (data2.types[0] === "Poison" || data2.types[0] === "Steel" || (data2.types[1] && (data2.types[1] === "Poison" || data2.types[1] === "Steel")))) continue;
			
			/* Substitute */
			if (dataMove.name === "Substitute" && data.statusData.self.pokemon[0]['volatiles'] && data.statusData.self.pokemon[0]['volatiles']['Substitute']) continue;
			if (dataMove.name === "Substitute" && data.statusData.self.pokemon[0]['hp'] < 26) continue;
			
			/* Other volatiles */
			if (dataMove.target === "self") {
				if (data.statusData.self.pokemon[0]['volatiles'] && data.statusData.self.pokemon[0]['volatiles'][dataMove.name]) continue;
			}
			
			/* Sleep talk */
			if (dataMove.name === "Sleep Talk" && (!data.statusData.self.pokemon[0]['status'] || data.statusData.self.pokemon[0]['status'] !== 'slp')) continue;
			
			/* Heal */
			if (dataMove.heal || (dataMove.name in {"Rest": 1, "Synthesis": 1, "Morning Sun": 1, "Moonlight": 1})) {
				if (data.statusData.self.pokemon[0]['hp'] > 99) continue; 
			}
			if (dataMove.name === "Pain Split" && data.statusData.self.pokemon[0]['hp'] >= data.statusData.foe.pokemon[0]['hp']) continue;
			
			/* Boost */
			if (dataMove.boosts && dataMove.target === "self") {
				if (data.statusData.self.pokemon[0]['hp'] < 75) continue; //survive
				var alreadyBoosted = 0;
				for (var j in dataMove.boosts) {
					alreadyBoosted++;
					if (data.statusData.self.pokemon[0]['boost'] && data.statusData.self.pokemon[0]['boost'][j] && data.statusData.self.pokemon[0]['boost'][j] >= 6) {
						alreadyBoosted--;
					}
				}
				if (!alreadyBoosted) continue;
			}
			
			/* Weather */
			if (dataMove.weather) {
				if (data.weather && (data.weather in {'desolateland': 1, 'primordialsea': 1, 'deltastream': 1} || data.weather === dataMove.weather)) continue;
			}
			if (dataMove.target === 'all') {
				if (data.fields && data.fields[dataMove.name]) continue;
			}
			
			/* Exceptions */
			if (dataMove.name === "Baton pass") {
				if (!data.statusData.self.pokemon[0]['boost']) continue;
				var bosts = 0;
				for (var j in data.statusData.self.pokemon[0]['boost']) 
					if (data.statusData.self.pokemon[0]['boost'][j] && data.statusData.self.pokemon[0]['boost'][j] > 0) bosts++;
				if (!bosts) continue;
			}
			if (dataMove.name === "Endeavor" && data.statusData.self.pokemon[0]['hp'] >= data.statusData.foe.pokemon[0]['hp']) continue;
			
			/* Do not use this moves */
			if (dataMove.name in {"Lunar Dance": 1, "Healing Wish": 1}) continue;
			
			//push
			moves.push(req.active[0].moves[i].move);
		}
		return moves;
	},
	getEffectiveOffMoves: function (data) {
		var moves = [];
		var req = data.request;
		var pokemonA = data.statusData.self.pokemon[0].species;
		var pokemonB = data.statusData.foe.pokemon[0].species;
		var dataMove;
		var pokedex = require('./pokedex.js').BattlePokedex;
		var movedex = require('./moves.js').BattleMovedex;
		var data1 = pokedex[toId(pokemonA)];
		var data2 = pokedex[toId(pokemonB)];
		for (var i = 0; i < req.active[0].moves.length; i++) {
			if (req.active[0].moves[i].disabled) continue;
			dataMove = movedex[toId(req.active[0].moves[i].move)];
			if (!dataMove) continue;
			//modify move
			switch (req.active[0].baseAbility) {
				case 'Aerilate':
					if (dataMove.type === "Normal") dataMove.type === "Flying";
					break;
				case 'Pixilate':
					if (dataMove.type === "Normal") dataMove.type === "Fairy";
					break;
				case 'Refrigerate':
					if (dataMove.type === "Normal") dataMove.type === "Ice";
					break;
			}
			if (dataMove.name === "Judgment") dataMove.type = data1.types[0];
			var not_inmune = false;
			if (req.active[0].baseAbility === "Scrappy" && dataMove.type in {"Normal": 1, "Fighting": 1}) not_inmune = true;
			//discard moves
			if (!(dataMove.category in {"Physical": 1, "Special": 1})) continue;
			
			if (data.statusData.self.pokemon[0]['boost']) {
				if (dataMove.category === "Special" && data.statusData.self.pokemon[0]['boost']['spa'] && data.statusData.self.pokemon[0]['boost']['spa'] < -1) continue;
				if (dataMove.category === "Physical" && data.statusData.self.pokemon[0]['boost']['atk'] && data.statusData.self.pokemon[0]['boost']['atk'] < -1) continue;
			}
			
			if (dataMove.name === "Fake Out" && data.statusData.self.pokemon[0]['lastMove']) continue;
			if (dataMove.type === "Ground" && data.statusData.foe.pokemon[0]['item'] && data.statusData.foe.pokemon[0]['item'] === "Air Ballon") continue;
			if (this.inmune(dataMove, pokemonB) && req.active[0].baseAbility !== "Mold Breaker") continue;
			//push
			if (this.gen6_get_mux(dataMove.type, data2.types, not_inmune) > 1 || (this.gen6_get_mux(dataMove.type, data2.types, not_inmune) === 1 && (dataMove.type === data1.types[0] || req.active[0].baseAbility === "Protean" || (data1.types[1] && dataMove.type === data1.types[1])))) {
				moves.push(req.active[0].moves[i].move);
			}
		}
		return moves;
	},
	getOffMoves: function (data) {
		var moves = [];
		var req = data.request;
		var pokemonA = data.statusData.self.pokemon[0].species;
		var pokemonB = data.statusData.foe.pokemon[0].species;
		var dataMove;
		var pokedex = require('./pokedex.js').BattlePokedex;
		var movedex = require('./moves.js').BattleMovedex;
		var data1 = pokedex[toId(pokemonA)];
		var data2 = pokedex[toId(pokemonB)];
		console.log(pokemonA + "/" + pokemonB);
		for (var i = 0; i < req.active[0].moves.length; i++) {
			if (req.active[0].moves[i].disabled) continue;
			dataMove = movedex[toId(req.active[0].moves[i].move)];
			if (!dataMove) {
				//by default, unknown moves are pushed here
				moves.push(i + 1);
				continue;
			}
			//modify move
			switch (req.active[0].baseAbility) {
				case 'Aerilate':
					if (dataMove.type === "Normal") dataMove.type === "Flying";
					break;
				case 'Pixilate':
					if (dataMove.type === "Normal") dataMove.type === "Fairy";
					break;
				case 'Refrigerate':
					if (dataMove.type === "Normal") dataMove.type === "Ice";
					break;
			}
			if (dataMove.name === "Judgment") dataMove.type = data1.types[0];
			var not_inmune = false;
			if (req.active[0].baseAbility === "Scrappy" && dataMove.type in {"Normal": 1, "Fighting": 1}) not_inmune = true;
			//discard moves
			if (!(dataMove.category in {"Physical": 1, "Special": 1})) continue;
			if (dataMove.name === "Fake Out" && data.statusData.self.pokemon[0]['lastMove']) continue;
			if (this.gen6_get_mux(dataMove.type, data2.types) === 0 && !not_inmune) continue;
			if (dataMove.type === "Ground" && data.statusData.foe.pokemon[0]['item'] && data.statusData.foe.pokemon[0]['item'] === "Air Ballon") continue;
			if (this.inmune(dataMove, pokemonB) && req.active[0].baseAbility !== "Mold Breaker") continue;
			//push
			moves.push(req.active[0].moves[i].move);
		}
		return moves;
	},
	getBestSwitch: function (data) {
		var res = {};
		if (!data) return []; // no data
		var req = data.request;
		if (!req) return []; //no request
		var disaux;
		var disAdvantage;
		var posibbles = {}, absPos = [];
		if (!data.statusData.self.pokemon[0].species || !data.statusData.foe.pokemon[0].species) {
			disAdvantage = -1;
		} else {
			disAdvantage =  this.gen6_getDisadvantage(data.statusData.self.pokemon[0].species, data.statusData.foe.pokemon[0].species);
		}
		var chosen = -1;
		for (var i = 0; i < req.side.pokemon.length; i++) {
			if (req.side.pokemon[i].condition !== '0 fnt' && !req.side.pokemon[i].active) {
				absPos.push(i + 1);
				if (!data.statusData.foe.pokemon[0].species) disaux = 1;
				else disaux = this.gen6_getDisadvantage(req.side.pokemon[i].details.substr(0, req.side.pokemon[i].details.indexOf(",")), data.statusData.foe.pokemon[0].species);
				posibbles[i + 1] = disaux;
				if (disAdvantage === -1 || disAdvantage > disaux) {
					chosen = i + 1;
					disAdvantage = disaux;
				}	
			}
		}
		if (chosen === -1) {
			res.must = false;
			if (absPos.length) {
				res.can = true;
				res.poke = absPos[Math.floor(Math.random() * absPos.length)];
				if (data.statusData.self.pokemon[0]['boost']) {
					if (data.statusData.self.pokemon[0]['boost']['spa'] && data.statusData.self.pokemon[0]['boost']['spa'] < -1) res.should = true;
					if (data.statusData.self.pokemon[0]['boost']['atk'] && data.statusData.self.pokemon[0]['boost']['atk'] < -1) res.should = true;
				}
			} else {
				res.can = false;
			}
			return res;
		}
		res.must = true;
		res.can = true;
		var bestSW = [];
		for (var i in posibbles)
			if (posibbles[i] === disAdvantage) bestSW.push(i);
		res.poke = bestSW[Math.floor(Math.random() * bestSW.length)];
		return res;
	},
	
	getDecision: function (room, data) {
		if (!data) return []; // no data
		var req = data.request;
		if (!req) return []; //no request
		
		var trapped = false;
		if (data.callback) {
			if (data.callback === "trapped") trapped = true;
			data.callback = false;
		}
		
		if (req.forceSwitch) {
			var switchInfo = this.getBestSwitch(data);
			return [{type: 'switch', switchIn: switchInfo.poke}];
		} else if (req.active) {
			var actualDes = {};
			var moves = [];
			if (req.side.pokemon[0].canMegaEvo) actualDes.mega = true;
			
			var supportMoves = this.getViableSupportMoves(data);
			var offMoves = this.getOffMoves(data);
			var offMaxMoves = this.getEffectiveOffMoves(data);
			var switchInfo = this.getBestSwitch(data);
			
			if (!trapped && !req.active[0].trapped) {
				if (switchInfo.must && !offMaxMoves.length) return [{type: 'switch', switchIn: switchInfo.poke}];
				if (switchInfo.can && !offMoves.length && !supportMoves.length) return [{type: 'switch', switchIn: switchInfo.poke}];
				if (switchInfo.should && !offMaxMoves.length && Math.floor(Math.random() * 10) <= 5) return [{type: 'switch', switchIn: switchInfo.poke}];
			}
			
			if (offMaxMoves.length) {
				for (var i = 0; i < offMaxMoves.length; i++)
					moves.push(offMaxMoves[i]);
			} else {
				for (var i = 0; i < offMoves.length; i++)
					moves.push(offMoves[i]);
			}
			
			for (var i = 0; i < supportMoves.length; i++)
					moves.push(supportMoves[i]);
			
			actualDes.move = moves[Math.floor(Math.random() * moves.length)];
			return [{type: 'move', mega: actualDes.mega, move: actualDes.move}];
		} else if (req.teamPreview) {
			var teamPreData = [];
			for (var i = 0; i < req.side.pokemon.length; i++) teamPreData.push(i + 1);
			teamPreData = teamPreData.randomize().join("");
			return [
				{type: 'team', team: teamPreData.substr(0, 1)}
			];
		}
		return [];
	},
	receive: function (room, args, kwargs) {
		return; //do nothing, data is suffient
	},
	TypeChartGen6: {
		"Bug": {
			damageTaken: {
				"Bug": 0,
				"Dark": 0,
				"Dragon": 0,
				"Electric": 0,
				"Fairy": 0,
				"Fighting": 2,
				"Fire": 1,
				"Flying": 1,
				"Ghost": 0,
				"Grass": 2,
				"Ground": 2,
				"Ice": 0,
				"Normal": 0,
				"Poison": 0,
				"Psychic": 0,
				"Rock": 1,
				"Steel": 0,
				"Water": 0
			},
			HPivs: {"atk":30, "def":30, "spd":30}
		},
		"Dark": {
			damageTaken: {
				"Bug": 1,
				"Dark": 2,
				"Dragon": 0,
				"Electric": 0,
				"Fairy": 1,
				"Fighting": 1,
				"Fire": 0,
				"Flying": 0,
				"Ghost": 2,
				"Grass": 0,
				"Ground": 0,
				"Ice": 0,
				"Normal": 0,
				"Poison": 0,
				"Psychic": 3,
				"Rock": 0,
				"Steel": 0,
				"Water": 0
			},
			HPivs: {}
		},
		"Dragon": {
			damageTaken: {
				"Bug": 0,
				"Dark": 0,
				"Dragon": 1,
				"Electric": 2,
				"Fairy": 1,
				"Fighting": 0,
				"Fire": 2,
				"Flying": 0,
				"Ghost": 0,
				"Grass": 2,
				"Ground": 0,
				"Ice": 1,
				"Normal": 0,
				"Poison": 0,
				"Psychic": 0,
				"Rock": 0,
				"Steel": 0,
				"Water": 2
			},
			HPivs: {"atk":30}
		},
		"Electric": {
			damageTaken: {
				par: 3,
				"Bug": 0,
				"Dark": 0,
				"Dragon": 0,
				"Electric": 2,
				"Fairy": 0,
				"Fighting": 0,
				"Fire": 0,
				"Flying": 2,
				"Ghost": 0,
				"Grass": 0,
				"Ground": 1,
				"Ice": 0,
				"Normal": 0,
				"Poison": 0,
				"Psychic": 0,
				"Rock": 0,
				"Steel": 2,
				"Water": 0
			},
			HPivs: {"spa":30}
		},
		"Fairy": {
			damageTaken: {
				"Bug": 2,
				"Dark": 2,
				"Dragon": 3,
				"Electric": 0,
				"Fairy": 0,
				"Fighting": 2,
				"Fire": 0,
				"Flying": 0,
				"Ghost": 0,
				"Grass": 0,
				"Ground": 0,
				"Ice": 0,
				"Normal": 0,
				"Poison": 1,
				"Psychic": 0,
				"Rock": 0,
				"Steel": 1,
				"Water": 0
			}
		},
		"Fighting": {
			damageTaken: {
				"Bug": 2,
				"Dark": 2,
				"Dragon": 0,
				"Electric": 0,
				"Fairy": 1,
				"Fighting": 0,
				"Fire": 0,
				"Flying": 1,
				"Ghost": 0,
				"Grass": 0,
				"Ground": 0,
				"Ice": 0,
				"Normal": 0,
				"Poison": 0,
				"Psychic": 1,
				"Rock": 2,
				"Steel": 0,
				"Water": 0
			},
			HPivs: {"def":30, "spa":30, "spd":30, "spe":30}
		},
		"Fire": {
			damageTaken: {
				brn: 3,
				"Bug": 2,
				"Dark": 0,
				"Dragon": 0,
				"Electric": 0,
				"Fairy": 2,
				"Fighting": 0,
				"Fire": 2,
				"Flying": 0,
				"Ghost": 0,
				"Grass": 2,
				"Ground": 1,
				"Ice": 2,
				"Normal": 0,
				"Poison": 0,
				"Psychic": 0,
				"Rock": 1,
				"Steel": 2,
				"Water": 1
			},
			HPivs: {"atk":30, "spa":30, "spe":30}
		},
		"Flying": {
			damageTaken: {
				"Bug": 2,
				"Dark": 0,
				"Dragon": 0,
				"Electric": 1,
				"Fairy": 0,
				"Fighting": 2,
				"Fire": 0,
				"Flying": 0,
				"Ghost": 0,
				"Grass": 2,
				"Ground": 3,
				"Ice": 1,
				"Normal": 0,
				"Poison": 0,
				"Psychic": 0,
				"Rock": 1,
				"Steel": 0,
				"Water": 0
			},
			HPivs: {"hp":30, "atk":30, "def":30, "spa":30, "spd":30}
		},
		"Ghost": {
			damageTaken: {
				trapped: 3,
				"Bug": 2,
				"Dark": 1,
				"Dragon": 0,
				"Electric": 0,
				"Fairy": 0,
				"Fighting": 3,
				"Fire": 0,
				"Flying": 0,
				"Ghost": 1,
				"Grass": 0,
				"Ground": 0,
				"Ice": 0,
				"Normal": 3,
				"Poison": 2,
				"Psychic": 0,
				"Rock": 0,
				"Steel": 0,
				"Water": 0
			},
			HPivs: {"def":30, "spd":30}
		},
		"Grass": {
			damageTaken: {
				powder: 3,
				"Bug": 1,
				"Dark": 0,
				"Dragon": 0,
				"Electric": 2,
				"Fairy": 0,
				"Fighting": 0,
				"Fire": 1,
				"Flying": 1,
				"Ghost": 0,
				"Grass": 2,
				"Ground": 2,
				"Ice": 1,
				"Normal": 0,
				"Poison": 1,
				"Psychic": 0,
				"Rock": 0,
				"Steel": 0,
				"Water": 2
			},
			HPivs: {"atk":30, "spa":30}
		},
		"Ground": {
			damageTaken: {
				sandstorm: 3,
				"Bug": 0,
				"Dark": 0,
				"Dragon": 0,
				"Electric": 3,
				"Fairy": 0,
				"Fighting": 0,
				"Fire": 0,
				"Flying": 0,
				"Ghost": 0,
				"Grass": 1,
				"Ground": 0,
				"Ice": 1,
				"Normal": 0,
				"Poison": 2,
				"Psychic": 0,
				"Rock": 2,
				"Steel": 0,
				"Water": 1
			},
			HPivs: {"spa":30, "spd":30}
		},
		"Ice": {
			damageTaken: {
				hail: 3,
				frz: 3,
				"Bug": 0,
				"Dark": 0,
				"Dragon": 0,
				"Electric": 0,
				"Fairy": 0,
				"Fighting": 1,
				"Fire": 1,
				"Flying": 0,
				"Ghost": 0,
				"Grass": 0,
				"Ground": 0,
				"Ice": 2,
				"Normal": 0,
				"Poison": 0,
				"Psychic": 0,
				"Rock": 1,
				"Steel": 1,
				"Water": 0
			},
			HPivs: {"atk":30, "def":30}
		},
		"Normal": {
			damageTaken: {
				"Bug": 0,
				"Dark": 0,
				"Dragon": 0,
				"Electric": 0,
				"Fairy": 0,
				"Fighting": 1,
				"Fire": 0,
				"Flying": 0,
				"Ghost": 3,
				"Grass": 0,
				"Ground": 0,
				"Ice": 0,
				"Normal": 0,
				"Poison": 0,
				"Psychic": 0,
				"Rock": 0,
				"Steel": 0,
				"Water": 0
			}
		},
		"Poison": {
			damageTaken: {
				psn: 3,
				tox: 3,
				"Bug": 2,
				"Dark": 0,
				"Dragon": 0,
				"Electric": 0,
				"Fairy": 2,
				"Fighting": 2,
				"Fire": 0,
				"Flying": 0,
				"Ghost": 0,
				"Grass": 2,
				"Ground": 1,
				"Ice": 0,
				"Normal": 0,
				"Poison": 2,
				"Psychic": 1,
				"Rock": 0,
				"Steel": 0,
				"Water": 0
			},
			HPivs: {"def":30, "spa":30, "spd":30}
		},
		"Psychic": {
			damageTaken: {
				"Bug": 1,
				"Dark": 1,
				"Dragon": 0,
				"Electric": 0,
				"Fairy": 0,
				"Fighting": 2,
				"Fire": 0,
				"Flying": 0,
				"Ghost": 1,
				"Grass": 0,
				"Ground": 0,
				"Ice": 0,
				"Normal": 0,
				"Poison": 0,
				"Psychic": 2,
				"Rock": 0,
				"Steel": 0,
				"Water": 0
			},
			HPivs: {"atk":30, "spe":30}
		},
		"Rock": {
			damageTaken: {
				sandstorm: 3,
				"Bug": 0,
				"Dark": 0,
				"Dragon": 0,
				"Electric": 0,
				"Fairy": 0,
				"Fighting": 1,
				"Fire": 2,
				"Flying": 2,
				"Ghost": 0,
				"Grass": 1,
				"Ground": 1,
				"Ice": 0,
				"Normal": 2,
				"Poison": 2,
				"Psychic": 0,
				"Rock": 0,
				"Steel": 1,
				"Water": 1
			},
			HPivs: {"def":30, "spd":30, "spe":30}
		},
		"Steel": {
			damageTaken: {
				psn: 3,
				tox: 3,
				sandstorm: 3,
				"Bug": 2,
				"Dark": 0,
				"Dragon": 2,
				"Electric": 0,
				"Fairy": 2,
				"Fighting": 1,
				"Fire": 1,
				"Flying": 2,
				"Ghost": 0,
				"Grass": 2,
				"Ground": 1,
				"Ice": 2,
				"Normal": 2,
				"Poison": 3,
				"Psychic": 2,
				"Rock": 2,
				"Steel": 2,
				"Water": 0
			},
			HPivs: {"spd":30}
		},
		"Water": {
			damageTaken: {
				"Bug": 0,
				"Dark": 0,
				"Dragon": 0,
				"Electric": 1,
				"Fairy": 0,
				"Fighting": 0,
				"Fire": 2,
				"Flying": 0,
				"Ghost": 0,
				"Grass": 1,
				"Ground": 0,
				"Ice": 2,
				"Normal": 0,
				"Poison": 0,
				"Psychic": 0,
				"Rock": 0,
				"Steel": 2,
				"Water": 2
			},
			HPivs: {"atk":30, "def":30, "spa":30}
		}
	}
};
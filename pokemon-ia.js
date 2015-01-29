/*
*/

/* functions */

function gen6_get_mux (typeA, typesB) {
	var mux = 1;
	if (exports.TypeChartGen6[typesB[0]].damageTaken[typeA] === 1) {
		mux *= 2;
	} else if (exports.TypeChartGen6[typesB[0]].damageTaken[typeA] === 2) {
		mux /= 2;
	} else if (exports.TypeChartGen6[typesB[0]].damageTaken[typeA] === 3) {
		mux = 0;
	}
	if (typesB[1]) {
		if (exports.TypeChartGen6[typesB[1]].damageTaken[typeA] === 1) {
			mux *= 2;
		} else if (exports.TypeChartGen6[typesB[1]].damageTaken[typeA] === 2) {
			mux /= 2;
		} else if (exports.TypeChartGen6[typesB[1]].damageTaken[typeA] === 3) {
			mux = 0;
		}
	}
	return mux;
}

function has_ability(pokemonA, abilities) {
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
}

function goodMoves(dataType, foeInfo, field, poke) {
	poke--;
	var pokemonB = foeInfo["a"];
	var pokemonA = dataType.side.pokemon[poke].details;
	if (pokemonA.indexOf(",") !== -1) pokemonA = dataType.side.pokemon[0].details.substr(0, dataType.side.pokemon[poke].details.indexOf(","));
	var pokedex = require('./pokedex.js').BattlePokedex;
	var movedex = require('./moves.js').BattleMovedex;
	var data1 = pokedex[toId(pokemonA)];
	var data2 = pokedex[toId(pokemonB)];
	if (!data1 || !data2) return [];
	var dataMove;
	var moves_V = [];
	for (var i = 0; i < dataType.side.pokemon[poke].moves.length; i++) {
		dataMove = movedex[toId(dataType.side.pokemon[poke].moves[i])];
		if (!dataMove) continue;
		if (dataMove.isViable && (dataMove.category in {"Physical": 1, "Special": 1})) {
			if (inmune(dataMove, pokemonB)) continue;
			if (dataMove.type === "Ground" && foeInfo.items && foeInfo.items["a"] && foeInfo.items["a"] === "Air Ballon") continue;
			if (gen6_get_mux(dataMove.type, data2.types) > 1 || (gen6_get_mux(dataMove.type, data2.types) === 1 && (dataMove.type === data1.types[0] ||(data1.types[1] && dataMove.type === data1.types[1])))) moves_V.push(dataMove.name);
		}
	}
	if (moves_V.length) return moves_V.randomize();
	return [];
}

function viableMoves(dataType, foeInfo, field, poke) {
	poke--;
	var pokemonB = foeInfo["a"];
	var pokemonA = dataType.side.pokemon[poke].details;
	if (pokemonA.indexOf(",") !== -1) pokemonA = dataType.side.pokemon[0].details.substr(0, dataType.side.pokemon[poke].details.indexOf(","));
	var pokedex = require('./pokedex.js').BattlePokedex;
	var movedex = require('./moves.js').BattleMovedex;
	var data1 = pokedex[toId(pokemonA)];
	var data2 = pokedex[toId(pokemonB)];
	if (!data1 || !data2) return [];
	var dataMove;
	var moves_V = [];
	for (var i = 0; i < dataType.side.pokemon[poke].moves.length; i++) {
		dataMove = movedex[toId(dataType.side.pokemon[poke].moves[i])];
		if (!dataMove) continue;
		if (dataMove.category === "Status" && has_ability(foeInfo["a"], ["Magic Bounce"])) continue;
		if (dataMove.category === "Status" && foeInfo.substitute && dataMove.target !== "self" && dataMove.target !== "allySide" && dataMove.target !== "foeSide") continue;
		if (dataMove.name === "Light Screen" && field && field.lightScreen) continue;
		if (dataMove.name === "Reflect" && field && field.reflect) continue;
		if (dataMove.name === "Sticky Web" && foeInfo.sticky) continue;
		if (dataMove.name === "Stealth Rock" && foeInfo.sr) continue;
		if (dataMove.name === "Spikes" && foeInfo.spikes && foeInfo.spikes > 2) continue;
		if (dataMove.name === "Toxic Spikes" && foeInfo.tSpikes && foeInfo.tSpikes > 1) continue;
		if (dataMove.name === "Defog" && (!field || (!field.sr && !field.spikes))) continue;
		if (dataMove.name === "Disable" && foeInfo.disable) continue;
		if (dataMove.name === "Leech Seed" && (foeInfo.leech || (data2.types[0] === "Grass" || (data2.types[1] && (data2.types[1] === "Grass"))))) continue;
		if (dataMove.name in {"Refresh": 1, "Heal Bell": 1, "Aromatherapy": 1} && dataType.side.pokemon[0].condition.indexOf(" ") === -1) continue;
		if (dataMove.weather && field && field.weather && toId(field.weather) in {'desolateland': 1, 'primordialsea': 1, 'deltastream': 1}) continue;
		if (dataMove.weather && field && field.weather && toId(field.weather) === toId(dataMove.weather)) continue;

		if (dataMove.name in {"Taunt": 1, "Fake Out": 1, "Endeavor": 1, "Trick Room": 1, "Healing Wish": 1}) continue; //dificult moves (too much information required)
		if (dataMove.status) {
			if (dataMove.status && ((foeInfo.status && foeInfo.status["a"]) || foeInfo.substitute || has_ability(foeInfo["a"], ["Magic Bounce"]))) continue;
			if ((dataMove.status === "tox" || dataMove.status === "psn") && (data2.types[0] === "Poison" || data2.types[0] === "Steel" || (data2.types[1] && (data2.types[1] === "Poison" || data2.types[1] === "Steel")))) continue;
			if ((dataMove.status === "par") && (data2.types[0] === "Electric" || (data2.types[1] && (data2.types[1] === "Electric")))) continue;
			if ((dataMove.status === "brn") && (data2.types[0] === "Fire" || (data2.types[1] && (data2.types[1] === "Fire")))) continue;
		}
		if (dataMove.target !== "self" && dataMove.target !== "allySide" && dataMove.target !== "foeSide") {
			if (gen6_get_mux(dataMove.type, data2.types) === 0) continue;
			if (dataMove.type === "Ground" && foeInfo.items && foeInfo.items["a"] && foeInfo.items["a"] === "Air Ballon") continue;
			if (inmune(dataMove, foeInfo["a"])) continue;
		}
		moves_V.push(dataMove.name);
	}
	if (moves_V.length) return moves_V.randomize();
	return [];
}

function inmune(moveData, pokemonA) {
	var pokedex = require('./pokedex.js').BattlePokedex;
	var data1 = pokedex[toId(pokemonA)];
	if (moveData.type === "Ground" && has_ability(pokemonA, ["Levitate"])) return true;
	if (moveData.type === "Water" && has_ability(pokemonA, ["Water Absorb", "Dry Skin", "Storm Drain"])) return true;
	if (moveData.type === "Fire" && has_ability(pokemonA, ["Flash Fire"])) return true;
	if (moveData.type === "Electric" && has_ability(pokemonA, ["Volt Absorb", "Lightning Rod"])) return true;
	if (moveData.isPowder && (data1.types[0] === "Grass" || (data1.types[1] && data1.types[1] === "Grass"))) return true;
	return false;
}

function can_switch(dataType, dis, foeInfo, field) {
	var pokeL = 0, chosen = -1;
	var disaux, disAdvantage = dis;
	var posibbles = [];
	for (var j = 0; j < dataType.side.pokemon.length; j++ ) {
		if (dataType.side.pokemon[j].condition !== '0 fnt' && !dataType.side.pokemon[j].active) {
			disaux = gen6_getDisadvantage(dataType.side.pokemon[j].details.substr(0, dataType.side.pokemon[j].details.indexOf(",")), foeInfo["a"]);
			if (disAdvantage === -1 || disAdvantage > disaux) {
				chosen = j + 1;
				disAdvantage = disaux;
			}
			pokeL++;
		}
	}
	if (chosen === -1) return false;
	for (var j = 0; j < dataType.side.pokemon.length; j++ ) {
		if (dataType.side.pokemon[j].condition !== '0 fnt' && !dataType.side.pokemon[j].active) {
			disaux = gen6_getDisadvantage(dataType.side.pokemon[j].details.substr(0, dataType.side.pokemon[j].details.indexOf(",")), foeInfo["a"]);
			if (disAdvantage === disaux) {
				posibbles.push(j + 1);
			}
		}
	}
	if (posibbles.length) {
		posibbles = posibbles.randomize();
		for (var i = 0; i < posibbles.length; i++) {
			if (goodMoves(dataType, foeInfo, field, posibbles[i]).length) return posibbles[i]; 
		}
		for (var i = 0; i < posibbles.length; i++) {
			if (viableMoves(dataType, foeInfo, field, posibbles[i]).length) return posibbles[i]; 
		}
	}
	return false;
}

function gen6_getDisadvantage(pokemonA, pokemonB) {
	//console.log(pokemonA + ", " + pokemonB);
	var pokedex = require('./pokedex.js').BattlePokedex;
	var data1 = pokedex[toId(pokemonA)];
	var data2 = pokedex[toId(pokemonB)];
	if (!data1 || !data2) return 2;
	var def = gen6_get_mux(data2.types[0], data1.types);
	if (data2.types[1]) def += gen6_get_mux(data2.types[1], data1.types);
	else def += 1;
	return def;
}

function gen6_getGoodMoves(dataType, foeInfo, field) {
	var pokemonB = foeInfo["a"];
	var pokemonA = dataType.side.pokemon[0].details;
	if (pokemonA.indexOf(",") !== -1) pokemonA = dataType.side.pokemon[0].details.substr(0, dataType.side.pokemon[0].details.indexOf(","));
	var pokedex = require('./pokedex.js').BattlePokedex;
	var movedex = require('./moves.js').BattleMovedex;
	var data1 = pokedex[toId(pokemonA)];
	var data2 = pokedex[toId(pokemonB)];
	if (!data1 || !data2) {
		console.log("algo va mal: " + toId(dataType.side.pokemon[0].details.substr(0, dataType.side.pokemon[0].details.indexOf(","))) + "/" + pokemonB);
		return [];
	}
	var dataMove;
	var moves_V = [];
	for (var i = 0; i < dataType.active[0].moves.length; i++) {
		dataMove = movedex[toId(dataType.active[0].moves[i].move)];
		if (!dataMove || dataType.active[0].moves[i].disabled) continue;
		if (dataMove.category === "Physical" && field && field.boosts && field.boosts["atk"] && field.boosts["atk"] < -1) continue;
		if (dataMove.category === "Special" && field && field.boosts && field.boosts["spa"] && field.boosts["spa"] < -1) continue;
		if (dataMove.isViable && (dataMove.category in {"Physical": 1, "Special": 1})) {
			if (inmune(dataMove, pokemonB)) continue;
			if (dataMove.name === "Stored Power" && (!field || !field.boosts ||  ((!field.boosts["spa"] || field.boosts["spa"] < 2) && (!field.boosts["spd"] || field.boosts["spd"] < 2)))) continue;
			if (dataMove.type === "Ground" && foeInfo.items && foeInfo.items["a"] && foeInfo.items["a"] === "Air Ballon") continue;
			if (gen6_get_mux(dataMove.type, data2.types) > 1 || (gen6_get_mux(dataMove.type, data2.types) === 1 && (dataMove.type === data1.types[0] ||(data1.types[1] && dataMove.type === data1.types[1])))) moves_V.push(dataMove.name);
		}
	}
	if (moves_V.length) return moves_V.randomize();
	return [];
}

function gen6_getNotUnviableMoves(dataType, foeInfo, field) {
	var pokemonB = foeInfo["a"];
	var pokemonA = dataType.side.pokemon[0].details;
	if (pokemonA.indexOf(",") !== -1) pokemonA = dataType.side.pokemon[0].details.substr(0, dataType.side.pokemon[0].details.indexOf(","));
	var pokedex = require('./pokedex.js').BattlePokedex;
	var movedex = require('./moves.js').BattleMovedex;
	var data1 = pokedex[toId(pokemonA)];
	var data2 = pokedex[toId(pokemonB)];
	if (!data1 || !data2) return [];
	var dataMove;
	var moves_V = [];
	for (var i = 0; i < dataType.active[0].moves.length; i++) {
		dataMove = movedex[toId(dataType.active[0].moves[i].move)];
		if (!dataMove || dataType.active[0].moves[i].disabled) continue;
		if (dataMove.category === "Status" && has_ability(foeInfo["a"], ["Magic Bounce"])) continue;
		if (dataMove.category === "Status" && foeInfo.substitute && dataMove.target !== "self" && dataMove.target !== "allySide" && dataMove.target !== "foeSide") continue;
		if (dataMove.name === "Light Screen" && field && field.lightScreen) continue;
		if (dataMove.name === "Reflect" && field && field.reflect) continue;
		if (dataMove.name === "Sticky Web" && foeInfo.sticky) continue;
		if (dataMove.name === "Stealth Rock" && foeInfo.sr) continue;
		if (dataMove.name === "Spikes" && foeInfo.spikes && foeInfo.spikes > 2) continue;
		if (dataMove.name === "Toxic Spikes" && foeInfo.tSpikes && foeInfo.tSpikes > 1) continue;
		if (dataMove.name === "Defog" && (!field || (!field.sr && !field.spikes))) continue;
		if (dataMove.name === "Disable" && foeInfo.disable) continue;
		if (dataMove.name === "Leech Seed" && (foeInfo.leech || (data2.types[0] === "Grass" || (data2.types[1] && (data2.types[1] === "Grass"))))) continue;
		if (dataMove.name === "Wish" && field && field.lastMove && field.lastMove === "Wish") continue;
		if (dataMove.name in {"Refresh": 1, "Heal Bell": 1, "Aromatherapy": 1} && dataType.side.pokemon[0].condition.indexOf(" ") === -1) continue;
		if (dataMove.weather && field && field.weather && toId(field.weather) in {'desolateland': 1, 'primordialsea': 1, 'deltastream': 1}) continue;
		if (dataMove.weather && field && field.weather && toId(field.weather) === toId(dataMove.weather)) continue;
		if (dataMove.name in {"Taunt": 1, "Fake Out": 1, "Endeavor": 1, "Trick Room": 1, "Encore": 1}) continue; //dificult moves (too much information required)
		if (dataMove.target === "self" && dataMove.category === "Status") {
			if (dataMove.volatileStatus && dataMove.volatileStatus === "protect" && (!field || !field.lastMove || field.lastMove in {"Protect": 1, "Detect": 1})) continue;
			if ((dataMove.name === "Rest" || dataMove.name === "Pain Split" || dataMove.heal) && parseInt(dataType.side.pokemon[0].condition.substr(0, dataType.side.pokemon[0].condition.indexOf("/"))) === parseInt(dataType.side.pokemon[0].condition.substr(dataType.side.pokemon[0].condition.indexOf("/") + 1))) continue;
			if (dataMove.boosts && ((parseInt(dataType.side.pokemon[0].condition.substr(0, dataType.side.pokemon[0].condition.indexOf("/"))) / parseInt(dataType.side.pokemon[0].condition.substr(dataType.side.pokemon[0].condition.indexOf("/") + 1)) < 0.7) || gen6_getDisadvantage(toId(dataType.side.pokemon[0].details.substr(0, dataType.side.pokemon[0].details.indexOf(","))) ,foeInfo["a"]) > 2)) continue;
			if (dataMove.name === "Substitute" && ((parseInt(dataType.side.pokemon[0].condition.substr(0, dataType.side.pokemon[0].condition.indexOf("/"))) / parseInt(dataType.side.pokemon[0].condition.substr(dataType.side.pokemon[0].condition.indexOf("/") + 1)) <= 0.25) || (field && field.substitute))) continue;
		}
		if (dataMove.status) {
			if (dataMove.status && ((foeInfo.status && foeInfo.status["a"]) || foeInfo.substitute || has_ability(foeInfo["a"], ["Magic Bounce"]))) continue;
			if ((dataMove.status === "tox" || dataMove.status === "psn") && (data2.types[0] === "Poison" || data2.types[0] === "Steel" || (data2.types[1] && (data2.types[1] === "Poison" || data2.types[1] === "Steel")))) continue;
			if ((dataMove.status === "par") && (data2.types[0] === "Electric" || (data2.types[1] && (data2.types[1] === "Electric")))) continue;
			if ((dataMove.status === "brn") && (data2.types[0] === "Fire" || (data2.types[1] && (data2.types[1] === "Fire")))) continue;
		}
		if (dataMove.target !== "self" && dataMove.target !== "allySide" && dataMove.target !== "foeSide") {
			if (gen6_get_mux(dataMove.type, data2.types) === 0) continue;
			if (dataMove.type === "Ground" && foeInfo.items && foeInfo.items["a"] && foeInfo.items["a"] === "Air Ballon") continue;
			if (inmune(dataMove, foeInfo["a"]) && dataType.active[0].baseAbility !== "Mold Breaker") continue;
		}
		moves_V.push(dataMove.name);
	}
	if (moves_V.length) return moves_V.randomize();
	return [];
}

/* Battle Response Methods*/

exports.getBattleResponse = function(battleData, foeInfo, field, format) {
	if (!battleData || !format || !format.gametype || !format.gen || !format.tier) return;
	try {
		var pokedex = require('./pokedex.js').BattlePokedex;
		var movedex = require('./moves.js').BattleMovedex;
	} catch (e) {
		error('failed to load pokemon data: ' + sys.inspect(e));
		return "/leave";
	}
	if (format.gametype === "singles" && format.gen === "6" && toId(format.tier).indexOf("metron") === -1) return exports.gen6SinglesBattleResponse(battleData, foeInfo, field);
	if (format.gametype === "singles") {
		return exports.randomBattleResponse(battleData);
	} else if (format.gametype === "doubles") {
		return exports.randomDoublesBattleResponse(battleData, 2);
	} else if (format.gametype === "triples") {
		return exports.randomDoublesBattleResponse(battleData, 3);
	}
};

exports.gen6SinglesBattleResponse = function(battleData, foeInfo, field) {
	var dataType = battleData;
	if (dataType.active) {
		//decision
		if (!foeInfo || !foeInfo["a"] || !battleData.side) return exports.randomBattleResponse(battleData);
		var dis = gen6_getDisadvantage(dataType.side.pokemon[0].details.substr(0, dataType.side.pokemon[0].details.indexOf(",")), foeInfo["a"]);
		var chosen = can_switch(battleData, dis, foeInfo, field);
		var good_moves = gen6_getGoodMoves(battleData, foeInfo, field);
		var viable_moves = gen6_getNotUnviableMoves(battleData, foeInfo, field);
		if (chosen && !good_moves.length && !dataType.active[0].trapped) {
			return '/sw ' + chosen;
		}
		if (!good_moves.length && !viable_moves.length && !dataType.active[0].trapped) {
			var pokeL = 0, chosen = -1;
			var disaux, disAdvantage = -1;
			var posibbles = [];
			for (var j = 0; j < dataType.side.pokemon.length; j++ ) {
				if (dataType.side.pokemon[j].condition !== '0 fnt' && !dataType.side.pokemon[j].active) {
					disaux = gen6_getDisadvantage(dataType.side.pokemon[j].details.substr(0, dataType.side.pokemon[j].details.indexOf(",")), foeInfo["a"]);
					if (disAdvantage === -1 || disAdvantage > disaux) {
						chosen = j + 1;
						disAdvantage = disaux;
					}
					pokeL++;
				}
			}
			for (var j = 0; j < dataType.side.pokemon.length; j++ ) {
				if (dataType.side.pokemon[j].condition !== '0 fnt' && !dataType.side.pokemon[j].active) {
					disaux = gen6_getDisadvantage(dataType.side.pokemon[j].details.substr(0, dataType.side.pokemon[j].details.indexOf(",")), foeInfo["a"]);
					if (disAdvantage === disaux) {
						posibbles.push(j + 1);
					}
				}
			}
			if (posibbles.length) {
				posibbles = posibbles.randomize();
				for (var i = 0; i < posibbles.length; i++) {
					if (viableMoves(dataType, foeInfo, field, posibbles[i]).length) return '/sw ' + posibbles[i]; 
				}
				return '/sw ' + posibbles[0];
			}
		}
		var moveData;
		var movedex = require('./moves.js').BattleMovedex;
		for (var i = 0; i < viable_moves.length; i++) {
			moveData = movedex[toId(viable_moves[i])];
			if (moveData && moveData.category === "Status") good_moves.push(viable_moves[i]);
		}
		var dt = Math.floor(dataType.active[0].moves.length * Math.random());
		var breakLoop = 0;
		while (!dataType.active[0].moves[dt] || dataType.active[0].moves[dt].disabled) {
			if (breakLoop > 10) {
				dt = 1;
				break;
			}
			dt = Math.floor(dataType.active[0].moves.length * Math.random());
			breakLoop++;
		}
		dt = dataType.active[0].moves[dt].move;
		if (good_moves.length) {
			dt = Math.floor(good_moves.length * Math.random());
			dt = good_moves[dt];
		}
		if (dataType.side.pokemon[0].canMegaEvo) {
			dt += " mega";	//megaEvo
		}
		return '/move ' + dt;
	} else if (dataType.forceSwitch) {
		if (!foeInfo || !foeInfo["a"]) {
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
				return '/sw ' + posibbles[Math.floor(pokeL * Math.random())];
			}
		} else {
			var pokeL = 0, chosen = -1;
			var disaux, disAdvantage = -1;
			var posibbles = [];
			for (var j = 0; j < dataType.side.pokemon.length; j++ ) {
				if (dataType.side.pokemon[j].condition !== '0 fnt' && !dataType.side.pokemon[j].active) {
					disaux = gen6_getDisadvantage(dataType.side.pokemon[j].details.substr(0, dataType.side.pokemon[j].details.indexOf(",")), foeInfo["a"]);
					if (disAdvantage === -1 || disAdvantage > disaux) {
						chosen = j + 1;
						disAdvantage = disaux;
					}
					pokeL++;
				}
			}
			for (var j = 0; j < dataType.side.pokemon.length; j++ ) {
				if (dataType.side.pokemon[j].condition !== '0 fnt' && !dataType.side.pokemon[j].active) {
					disaux = gen6_getDisadvantage(dataType.side.pokemon[j].details.substr(0, dataType.side.pokemon[j].details.indexOf(",")), foeInfo["a"]);
					if (disAdvantage === disaux) {
						posibbles.push(j + 1);
					}
				}
			}
			if (posibbles.length) {
				posibbles = posibbles.randomize();
				for (var i = 0; i < posibbles.length; i++) {
					if (goodMoves(dataType, foeInfo, field, posibbles[i]).length) return '/sw ' + posibbles[i]; 
				}
				for (var i = 0; i < posibbles.length; i++) {
					if (viableMoves(dataType, foeInfo, field, posibbles[i]).length) return '/sw ' + posibbles[i]; 
				}
				return '/sw ' + posibbles[0];
			}
		}
	} else if (dataType.nTPV || dataType.teamPreview) {
		var teamPreData = [];
		var dt3 = "";
		for (var i = 1; i < 7; i++) teamPreData.push(i);
		return '/team ' + teamPreData.randomize().join("") + "|1";
	}
};

exports.randomBattleResponse = function(battleData) {
	var dataType = battleData;
	if (dataType.active) {
		//decision
		var dt = Math.floor(dataType.active[0].moves.length * Math.random());
		var breakLoop = 0;
		while (!dataType.active[0].moves[dt] || dataType.active[0].moves[dt].disabled) {
			dt = Math.floor(dataType.active[0].moves.length * Math.random());
			breakLoop++;
			if (breakLoop > 10) {
				dt = 1;
				break;
			}
		}
		dt = dataType.active[0].moves[dt].move;
		if (dataType.side.pokemon[0].canMegaEvo) {
			dt += " mega";	//megaEvo
		}
		return '/move ' + dt;
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
				return '/sw ' + posibbles[Math.floor(pokeL * Math.random())];
			}
	} else if (dataType.nTPV || dataType.teamPreview) {
		var teamPreData = [];
		var dt3 = "";
		for (var i = 1; i < 7; i++) teamPreData.push(i);
		return '/team ' + teamPreData.randomize().join("") + "|1";
	}
};

exports.randomDoublesBattleResponse = function(battleData, numPokes) {
	var dataType = battleData;
	if (dataType.active) {
		//decision
		var des = "";
		var breakLoop = 0;
		for (var i = 0; i < dataType.active.length; i++) {
			var dt = Math.floor(dataType.active[i].moves.length * Math.random());
			breakLoop = 0
			while (!dataType.active[i].moves[dt] || dataType.active[i].moves[dt].disabled) {
				if (breakLoop > 10) {
					dt = 1;
					break;
				}
				dt = Math.floor(dataType.active[i].moves.length * Math.random());
				breakLoop++;
			}
			dt = dataType.active[i].moves[dt].move;
			if (dataType.side.pokemon[i].canMegaEvo) {
				dt += " mega";	//megaEvo
			}
			dt += " " + (Math.floor(numPokes * Math.random()) + 1);
			if (i > 0) {
				des += ",move " + dt;
			} else {
				des += "move " + dt;
			}
		}
		return '/choose ' + des;
	} else if (dataType.forceSwitch) {
		var chosen = "";
		var des = "";
		for (var i = 0; i < dataType.forceSwitch.length; i++) {
			if (!dataType.forceSwitch[i]) {
				chosen = "pass";
			} else {
				var pokeL = 0;
				var posibbles = [];
				for (var j = 0; j < dataType.side.pokemon.length; j++ ) {
					if (dataType.side.pokemon[j].condition !== '0 fnt' && !dataType.side.pokemon[j].active) {
						posibbles.push(j + 1);
						pokeL++;
					}
				}
				posibbles.randomize();
				if (pokeL) {
					chosen = "switch " +  posibbles[Math.floor(pokeL * Math.random())];
				}
			}
			if (i > 0) {
				des += "," + chosen;
			} else {
				des += chosen;
			}
		}
		return '/choose ' + des;
	} else if (dataType.nTPV || dataType.teamPreview) {
		var teamPreData = [];
		var dt3 = "";
		for (var i = 1; i < 7; i++) teamPreData.push(i);
		return '/team ' + teamPreData.randomize().join("") + "|1";
	}
};

/*Other Data*/

exports.TypeChartGen6 = {
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
};
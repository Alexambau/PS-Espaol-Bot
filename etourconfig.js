/* Configuracion de torneos automáticos por puntos*/

exports.toursRoom = 'eventos';
exports.announceRoom = 'espaol';

exports.onwin = 2; 
exports.onroundwin = 1;

/* Regular point system */

exports.pointsWinner = 5;
exports.pointsSubWinner = 3;
exports.pointsSemiFinals = 2;
exports.pointsQuarterFinals = 1;

/* Example

{hour: 0, minute: 0, tier:'OU', name:'Torneo por Puntos Ladderbroad', isRated: true, signups: 3, autodq: 2}, //Day 1

*/

exports.calendar = [
	false,
	{hour: 20, minute: 0, tier:'OU', name:'Torneo Leaderboards - ORAS OU', isRated: true, signups: 3, autodq: 2}, //Day 1
	{hour: 19, minute: 0, tier:'[Gen 5] OU', name:'Torneo Leaderboards - BW OU', isRated: true, signups: 3, autodq: 2}, //Day 2
	{hour: 21, minute: 0, tier:'UU', name:'Torneo Leaderboards - ORAS UU', isRated: true, signups: 3, autodq: 2}, //Day 3
	{hour: 18, minute: 30, tier:'OU', name:'Torneo Leaderboards - ORAS OU', isRated: true, signups: 3, autodq: 2}, //Day 4
	{hour: 21, minute: 0, tier:'LC', name:'Torneo Leaderboards - ORAS LC', isRated: true, signups: 3, autodq: 2}, //Day 5
	{hour: 20, minute: 0, tier:'Random Battle', name:'Torneo Leaderboards - Random Battle', isRated: true, signups: 3, autodq: 2}, //Day 6
	{hour: 19, minute: 0, tier:'Ubers', name:'Torneo Leaderboards - ORAS Ubers', isRated: true, signups: 3, autodq: 2}, //Day 7
	{hour: 19, minute: 30, tier:'UU', name:'Torneo Leaderboards - ORAS UU', isRated: true, signups: 3, autodq: 2}, //Day 8
	{hour: 20, minute: 0, tier:'RU', name:'Torneo Leaderboards - ORAS RU', isRated: true, signups: 3, autodq: 2}, //Day 9
	{hour: 22, minute: 0, tier:'Battle Spot Doubles (VGC 2015)', name:'Torneo Leaderboards - VGC 2015', isRated: true, signups: 3, autodq: 2}, //Day 10
	{hour: 21, minute: 0, tier:'NU', name:'Torneo Leaderboards - ORAS NU', isRated: true, signups: 3, autodq: 2}, //Day 11
	{hour: 20, minute: 0, tier:'OU', name:'Torneo Leaderboards - ORAS OU', isRated: true, signups: 3, autodq: 2}, //Day 12
	{hour: 20, minute: 0, tier:'Challenge Cup 1-vs-1', name:'Torneo Leaderboards - Challenge Cup 1-vs-1', isRated: true, signups: 3, autodq: 2}, //Day 13
	{hour: 18, minute: 30, tier:'Ubers', name:'Torneo Leaderboards - ORAS Ubers', isRated: true, signups: 3, autodq: 2}, //Day 14
	{hour: 21, minute: 0, tier:'LC', name:'Torneo Leaderboards - ORAS LC', isRated: true, signups: 3, autodq: 2}, //Day 15
	{hour: 19, minute: 30, tier:'OU', name:'Torneo Leaderboards - ORAS OU', isRated: true, signups: 3, autodq: 2}, //Day 16
	{hour: 21, minute: 0, tier:'[Gen 4] OU', name:'Torneo Leaderboards - DPP OU', isRated: true, signups: 3, autodq: 2}, //Day 17
	{hour: 20, minute: 30, tier:'[Gen 5] OU', name:'Torneo Leaderboards - BW OU', isRated: true, signups: 3, autodq: 2}, //Day 18
	{hour: 22, minute: 0, tier:'Random Battle', name:'Torneo Leaderboards - Random Battle', isRated: true, signups: 3, autodq: 2}, //Day 19
	{hour: 20, minute: 0, tier:'RU', name:'Torneo Leaderboards - ORAS RU', isRated: true, signups: 3, autodq: 2}, //Day 20
	{hour: 19, minute: 0, tier:'LC', name:'Torneo Leaderboards - ORAS LC', isRated: true, signups: 3, autodq: 2}, //Day 21
	{hour: 22, minute: 0, tier:'OU', name:'Torneo Leaderboards - ORAS OU', isRated: true, signups: 3, autodq: 2}, //Day 22
	{hour: 21, minute: 0, tier:'Battle Spot Doubles (VGC 2015)', name:'Torneo Leaderboards - VGC 2015', isRated: true, signups: 3, autodq: 2}, //Day 23
	{hour: 19, minute: 0, tier:'PU', name:'Torneo Leaderboards - PU', isRated: true, signups: 3, autodq: 2}, //Day 24
	{hour: 18, minute: 30, tier:'NU', name:'Torneo Leaderboards - ORAS NU', isRated: true, signups: 3, autodq: 2}, //Day 25
	{hour: 20, minute: 0, tier:'[Gen 5] OU', name:'Torneo Leaderboards - BW OU', isRated: true, signups: 3, autodq: 2}, //Day 26
	{hour: 22, minute: 30, tier:'Monotype', name:'Torneo Leaderboards - Monotype', isRated: true, signups: 3, autodq: 2}, //Day 27
	{hour: 21, minute: 0, tier:'OU', name:'Torneo Leaderboards - ORAS OU', isRated: true, signups: 3, autodq: 2}, //Day 28
	{hour: 19, minute: 0, tier:'Random Battle', name:'Torneo Leaderboards - Random Battle', isRated: true, signups: 3, autodq: 2}, //Day 29
	{hour: 22, minute: 0, tier:'[Gen 5] OU', name:'Torneo Leaderboards - BW OU', isRated: true, signups: 3, autodq: 2}, //Day 30
	false //Day 31
];

var BotGMT = -4;
var selfGMT = +2;

for (var i = 0; i < exports.calendar.length; i++) {
	if (exports.calendar[i]) {
		exports.calendar[i].hour += (BotGMT - selfGMT);
	}
}

/* Data
Miércoles 1: Torneo ORAS OU - 20:00h GMT+1
Jueves 2: Torneo BW OU - 19:00h GMT+1
Viernes 3: Torneo ORAS UU - 21:00h GMT+1
Sábado 4: Torneo ORAS OU - 18:30h GMT+1
Domingo 5: Torneo ORAS LC - 21:00h GMT+1

Lunes 6: Torneo Random Battle - 20:00h GMT+1
Martes 7: Torneo ORAS Ubers - 19:00h GMT+1
Miércoles 8: Torneo ORAS UU - 19:30h GMT+1
Jueves 9: Torneo ORAS RU - 20:00h GMT+1
Viernes 10: Torneo VGC 2015 - 22:00h GMT+1
Sábado 11: Torneo ORAS NU - 21:00h GMT+1
Domingo 12: Torneo ORAS OU - 20:00h GMT+1

Lunes 13: Torneo Challenge Cup 1v1 - 20:00h GMT+1
Martes 14: Torneo ORAS Ubers - 18:30 GMT+1
Miércoles 15: Torneo ORAS LC - 21:00 GMT+1
Jueves 16: Torneo ORAS OU - 19:30 GMT+1
Viernes 17: Torneo DPP OU - 21:00 GMT+1
Sábado 18: Torneo BW OU - 20:30 GMT+1
Domingo 19: Torneo Random Battle - 22:00 GMT+1

Lunes 20: Torneo ORAS RU - 20:00h GMT+1
Martes 21: Torneo ORAS LC - 19:00h GMT+1
Miércoles 22: Torneo ORAS OU - 22:00h GMT+1
Jueves 23: Torneo VGC 2015 - 21:00h GMT+1
Viernes 24: Torneo PU - 19:00 GMT+1
Sábado 25: Torneo ORAS NU - 18:30 GMT+1
Domingo 26: Torneo BW OU - 20:00h GMT+1

Lunes 27: Torneo Monotype - 22:30 GMT+1
Martes 28: Torneo ORAS OU - 21:00h GMT+1
Miércoles 29: Torneo Random Battle - 19:00h GMT+1
Jueves 30: Torneo BW OU - 22:00h GMT+1
*/


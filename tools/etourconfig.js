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
	false, //Day 1
	false, //Day 2
	false, //Day 3
	false, //Day 4
	false, //Day 5
	false, //Day 6
	false, //Day 7
	false, //Day 8
	false, //Day 9
	false, //Day 10
	false, //Day 11
	false, //Day 12
	false, //Day 13
	false, //Day 14
	false, //Day 15
	false, //Day 16
	false, //Day 17
	false, //Day 18
	false, //Day 19
	false, //Day 20
	false, //Day 21
	false, //Day 22
	false, //Day 23
	false, //Day 24
	false, //Day 25
	false, //Day 26
	false, //Day 27
	false, //Day 28
	false, //Day 29
	false, //Day 30
	false //Day 31
];

var BotGMT = -4;
var selfGMT = +2;

for (var i = 0; i < exports.calendar.length; i++) {
	if (exports.calendar[i]) {
		exports.calendar[i].hour += (BotGMT - selfGMT);
	}
}

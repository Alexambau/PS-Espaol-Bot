/* Bot Teams 

------------------ Format example --------------------
	
	exports.teams = {
		"tier1": [
				  'packed team',
				  [unpacked team],
				  {random team}
				  ],
		"tier2": [
				  ]
	};

	->String (packed team) -> 'text'
	->Array (unpacked team) -> [{poke1}, {poke2}]
	->Object (random team) -> {maxPokemon: 6, pokemon: [{poke1}, {poke2}]}
	
	->Unpacked Pokemon example: 
		
		{name: "", species: "", item: "", ability: "", moves: ['', '', '', ''], nature: '', evs: {'hp': 0, 'atk': 0, 'def': 0, 'spa': 0, 'spd': 0, 'spe': 0}, gender: '', ivs: {}, shiny: false, level: 100, happiness: 255}
		
*/

exports.teams = {
	"ou": [		
		 'Bisharp||leftovers||ironhead,knockoff,suckerpunch,swordsdance|Adamant|232,252,,,4,20|||||]Chansey||eviolite||healbell,seismictoss,softboiled,thunderwave|Bold|248,,252,,8,|||||]Venusaur-Mega||venusaurite||gigadrain,hiddenpowerfire,leechseed,synthesis|Bold|240,,224,44,,||,30,,30,,30|||]Heatran||airballoon||stealthrock,fireblast,toxic,taunt|undefined|224,,,16,48,220|||||]Skarmory||rockyhelmet|1|roost,defog,spikes,bravebird|Impish|248,,232,,,28|||||]Keldeo||leftovers||scald,secretsword,substitute,calmmind|Timid|,,,252,4,252|||||',
		'Lopunny||lopunnite|H|return,highjumpkick,icepunch,fakeout|Jolly|,252,4,,,252|||||]Gengar||lifeorb||shadowball,sludgewave,focusblast,taunt|Timid|4,,,252,,252|||||]Garchomp||focussash|H|stealthrock,earthquake,outrage,fireblast|Naive|,252,,4,,252|||||]Starmie||leftovers|1|scald,reflecttype,recover,rapidspin|Timid|232,,24,4,,248||,0,,,,|||]Bisharp||blackglasses||knockoff,ironhead,suckerpunch,swordsdance|Adamant|4,252,,,,252|||||]Thundurus||leftovers||focusblast,thunderbolt,hiddenpowerice,thunderwave|Timid|,,4,252,,252||,30,30,,,|||', 
		'Charizard||charizarditex||dragondance,flareblitz,roost,dragonclaw|Jolly|96,220,,,8,184|M||||]Breloom||focussash|H|spore,rocktomb,bulletseed,machpunch|Jolly|4,252,,,,252|||||]Rotom-Wash||leftovers||voltswitch,hydropump,willowisp,painsplit|Bold|252,,212,,,44|||||]Landorus-Therian||choicescarf||knockoff,earthquake,stoneedge,uturn|Jolly|,252,4,,,252|||||]Jirachi||leftovers||ironhead,wish,stealthrock,thunderwave|Jolly|252,,,,4,252|||||]Latios||lifeorb||dracometeor,earthquake,hiddenpowerfire,defog|Naive|,,16,240,,252||,30,,30,,30|||',
		'Sylveon||choicespecs|H|hypervoice,hiddenpowerfire,psyshock,batonpass|Modest|236,,,252,,20||,30,,30,,30|||]Manaphy||leftovers||scald,psychic,tailglow,raindance|Timid|96,,,252,,160|||||]Cobalion||leftovers||ironhead,closecombat,voltswitch,stealthrock|Jolly|140,116,,,,252|||||]Landorus-Therian||softsand||earthquake,stoneedge,knockoff,uturn|Adamant|,252,4,,,252|||||]Mega-Manectric|manectric|manectite|1|thunderbolt,voltswitch,flamethrower,hiddenpowerice|Timid|,,4,252,,252||,30,30,,,|||]Hydreigon||choicescarf||dracometeor,darkpulse,earthpower,uturn|Modest|,4,,252,,252|||||',
		'Dragonite||choiceband|H|outrage,extremespeed,firepunch,earthquake|Adamant|40,252,,,,216|||||]Charizard-Mega-Y||charizarditey||fireblast,roost,solarbeam,earthquake|Mild|,4,,252,,252|||||]Tyranitar||choicescarf||stoneedge,pursuit,crunch,earthquake|Jolly|,252,4,,,252|||||]Keldeo-Resolute||choicespecs||hydropump,scald,secretsword,hiddenpowerelectric|Timid|,,,252,4,252||,,,30,,|||]Landorus-Therian||leftovers||earthquake,stealthrock,stoneedge,uturn|Impish|240,,232,,16,20|||||]Mew||leftovers||defog,softboiled,knockoff,willowisp|Careful|248,,,,204,56|||||',
		'Metagross||metagrossite||meteormash,icepunch,earthquake,zenheadbutt|Jolly|,252,4,,,252|||||]Ferrothorn||leftovers||spikes,leechseed,protect,powerwhip|Impish|248,,88,,168,4|||||]Landorus-Therian||leftovers||uturn,earthquake,stoneedge,knockoff|Impish|252,,240,,8,8|||||]Manaphy||leftovers||raindance,surf,tailglow,energyball|Modest|96,,,252,,160|||||]Latias||lifeorb||dracometeor,defog,psyshock,roost|Timid|,,4,252,,252|||||]Heatran||choicescarf||overheat,flashcannon,ancientpower,earthpower|Timid|,,,252,4,252||,,30,,30,30|||',
		'Vaporeon||leftovers||wish,protect,scald,healbell|Calm|200,,252,,56,|||||]Sableye||sablenite|H|willowisp,foulplay,knockoff,recover|Bold|252,,252,,4,|||||]Tentacruel||blacksludge|1|scald,rapidspin,toxicspikes,knockoff|Bold|224,,252,,,32|||||]Clefable||leftovers|H|moonblast,wish,protect,healbell|Bold|252,,252,,4,|||||]Heatran||leftovers||lavaplume,toxic,stealthrock,taunt|Calm|248,,,,192,68|||||]Chesnaught||leftovers|H|spikyshield,leechseed,drainpunch,spikes|Impish|252,,252,,4,|||||',
		'Daiquiri|politoed|damprock|H|scald,raindance,encore,perishsong|Bold|252,,252,4,,|||||]THE TRUE LORD|pikachu|lightball|H|thunder,agility,hiddenpowerice,grassknot|Hasty|,4,,252,,252||,30,30,,,|||]LORD HELIX|omastar|focussash||shellsmash,hydropump,icebeam,ancientpower|Modest|,,,252,4,252||,30,30,,,|||]BASED GOD|ludicolo|assaultvest||hydropump,gigadrain,icebeam,surf|Modest|,,,252,4,252|||||]ayy|hitmontop|assaultvest||rapidspin,closecombat,suckerpunch,stoneedge|Adamant|252,252,,,4,|||||]2Broken4U|druddigon|rockyhelmet||stealthrock,roar,glare,dragonclaw|Careful|252,4,,,252,|||||'
	],
	"ubers": [
		 'Latios||souldew||dracometeor,psyshock,recover,defog|Timid|,,,252,4,252||,0,,,,|||]Groudon-Primal||redorb||precipiceblades,firepunch,stoneedge,stealthrock|Adamant|252,252,,,,4|||||]Xerneas||powerherb||geomancy,moonblast,thunder,hiddenpowerfire|Modest|184,,,252,4,68||,30,,30,,30|||]Mewtwo-Mega-Y||mewtwonitey||psystrike,aurasphere,flamethrower,icebeam|Timid|4,,,252,,252|||||]Yveltal||leftovers||toxic,roost,foulplay,suckerpunch|Bold|224,,252,4,28,|||||]Scizor||choiceband|1|bulletpunch,uturn,superpower,knockoff|Adamant|,252,,,4,252|||||',
		 'Deathless Parade|deoxysspeed|rockyhelmet||stealthrock,spikes,skillswap,taunt|Timid|252,,4,,,252||,0,,,,|||]Your Last Breath|groudonprimal|redorb||rockpolish,precipiceblades,stoneedge,swordsdance|Adamant|92,252,,,,164|||||]Revenge|salamence|salamencite||dragondance,return,refresh,roost|Jolly|,252,4,,,252|||||]Winner Mind|arceus|lifeorb||swordsdance,extremespeed,shadowclaw,earthquake|Jolly|,252,4,,,252|||||]No Time For Losers|xerneas|powerherb||geomancy,moonblast,focusblast,aromatherapy|Modest|,,200,252,,56|||||]Kiss of Death|darkrai|focussash||darkvoid,nastyplot,darkpulse,sludgebomb|Timid|,,4,252,,252|||||'
	],
	"anythinggoes": [
		'Latios||souldew||dracometeor,psyshock,recover,defog|Timid|,,,252,4,252||,0,,,,|||]Groudon-Primal||redorb||precipiceblades,firepunch,stoneedge,stealthrock|Adamant|252,252,,,,4|||||]Xerneas||powerherb||geomancy,moonblast,thunder,hiddenpowerfire|Modest|184,,,252,4,68||,30,,30,,30|||]Mewtwo-Mega-Y||mewtwonitey||psystrike,aurasphere,flamethrower,icebeam|Timid|4,,,252,,252|||||]Yveltal||leftovers||toxic,roost,foulplay,suckerpunch|Bold|224,,252,4,28,|||||]Scizor||choiceband|1|bulletpunch,uturn,superpower,knockoff|Adamant|,252,,,4,252|||||',
		'Deoxys-Attack||focussash||psychoboost,icebeam,superpower,stealthrock|Hasty|,4,,252,,252|||||]Rayquaza-Mega||leftovers||dragondance,dragonascent,earthquake,extremespeed|Jolly|,252,,,4,252|||||]Arceus||lumberry||swordsdance,extremespeed,shadowforce,recover|Adamant|252,252,,,4,|||||]Groudon-Primal||redorb||precipiceblades,firepunch,thunderwave,dragontail|Impish|252,,216,,40,|||||]Arceus-Ghost||spookyplate||judgment,calmmind,willowisp,recover|Timid|252,,,4,,252|||||]Groudon-Primal||redorb||precipiceblades,firepunch,dragonclaw,rockpolish|Adamant|4,252,,,,252|||||',
		'Deoxys-Attack||focussash||psychoboost,icebeam,superpower,stealthrock|Hasty|,4,,252,,252|||||]Groudon-Primal||redorb||precipiceblades,firepunch,dragonclaw,rockpolish|Adamant|4,252,,,,252|||||]Rayquaza-Mega||lumberry||dragondance,dragonascent,earthquake,extremespeed|Jolly|,252,,,4,252|||||]Arceus||lumberry||swordsdance,extremespeed,shadowforce,recover|Adamant|252,252,,,4,|||||]Groudon-Primal||redorb||precipiceblades,firepunch,thunderwave,dragontail|Impish|252,,216,,40,|||||]Xerneas||powerherb||geomancy,moonblast,thunder,hiddenpowerfire|Modest|184,,,252,4,68||,30,,30,,30|||'
	],
	"1v1": [
		//Random generated team
		{
			maxPokemon: 3,
			pokemon: [
				{"name":"Dragonite","species":"Dragonite","item":"Choice Band","nature":"Adamant","evs":{"atk":252,"hp":248,"spe":0,"spd":8},"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"moves":["Outrage","Earthquake","Extreme Speed","Fire Punch"],"ability":"Multiscale","level":100},
				{"name":"Niggazard","species":"Charizard-Mega-X","item":"Charizardite X","nature":"Adamant","evs":{"spe":252,"atk":252,"spd":4},"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"moves":["Dragon Dance","Flare Blitz","Outrage","Earthquake"],"ability":"Tough Claws","level":100},
				{"name":"Incineration","species":"Charizard-Mega-Y","item":"Charizardite Y","nature":"Timid","evs":{"spe":252,"spa":252,"spd":4},"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"moves":["Fire Blast","Solar Beam","Focus Blast","Air Slash"],"ability":"Drought","level":100},
				{"name":"Kyurem-Black","species":"Kyurem-Black","item":"Choice Scarf","nature":"Naive","evs":{"spe":252,"atk":140,"spa":116},"ivs":{"atk":30,"spa":30,"spe":30,"hp":31,"def":31,"spd":31},"moves":["Outrage","Ice Beam","Fusion Bolt","Hidden Power Fire"],"ability":"Teravolt","level":100},
				{"name":"Greninja","species":"Greninja","item":"Life Orb","nature":"Hasty","evs":{"spe":252,"spa":252,"atk":4},"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"moves":["Hydro Cannon","Ice Beam","Dark Pulse","Gunk Shot"],"ability":"Protean","level":100},
				{"name":"Victini","species":"Victini","item":"Choice Scarf","nature":"Jolly","evs":{"spe":252,"atk":252,"spd":4},"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"moves":["V-create","Bolt Strike","Zen Headbutt","Brick Break"],"ability":"Victory Star","level":100},
				{"name":"Garchomp","species":"Garchomp","gender":"","item":"Choice Scarf","ability":"Rough Skin","evs":{"hp":0,"atk":252,"def":0,"spa":4,"spd":0,"spe":252},"nature":"Naive","moves":["Earthquake","Outrage","Fire Blast","Stone Edge"],"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"level":100},
				{"name":"Outrage I win lol","species":"Kyurem-Black","gender":"","item":"Choice Band","ability":"Teravolt","shiny":true,"evs":{"hp":248,"atk":252,"def":0,"spa":8,"spd":0,"spe":0},"nature":"Naughty","moves":["Outrage","Fusion Bolt","Ice Beam","Iron Head"],"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"level":100},
				{"name":"V-Create I Win lol","species":"Victini","gender":"","item":"Choice Band","ability":"Victory Star","evs":{"hp":0,"atk":252,"def":0,"spa":0,"spd":4,"spe":252},"nature":"Jolly","moves":["V-create","Brick Break","Bolt Strike","Zen Headbutt"],"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"level":100},
				{"name":"Jirachi","species":"Jirachi","gender":"","item":"Choice Scarf","ability":"Serene Grace","evs":{"hp":0,"atk":252,"def":0,"spa":0,"spd":4,"spe":252},"nature":"Jolly","moves":["Iron Head","Zen Headbutt","Fire Punch","Ice Punch"],"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"level":100},
				{"name":"Genesect","species":"Genesect","gender":"","item":"Choice Scarf","ability":"Download","evs":{"hp":0,"atk":0,"def":0,"spa":252,"spd":4,"spe":252},"nature":"Timid","moves":["Bug Buzz","Flamethrower","Ice Beam","Thunderbolt"],"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"level":100},
				{"name":"Techno Blast","species":"Genesect","item":"Choice Band","nature":"Hasty","evs":{"spe":252,"atk":252,"spd":4},"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"moves":["ExtremeSpeed","U-turn","Iron Head","Gunk Shot"],"ability":"Download","level":100,"shiny":true}
				
			]
		}
	],
	"inversebattle": [
		'Cacalugg|avalugg|leftovers|H|rapidspin,recover,avalanche,earthquake|Impish|248,8,252,,,|||||]GoGoatGo|gogoat|leftovers||bulkup,earthquake,hornleech,wildcharge|Adamant|252,252,,,4,|||||]The God|zangoose|toxicorb|H|facade,closecombat,knockoff,protect|Jolly|4,252,,,,252|M||S||]AMNco|ninetales|leftovers|H|calmmind,fireblast,protect,solarbeam|Timid|,,,252,4,252|||||]Sableye||sablenite|H|recover,calmmind,darkpulse,willowisp|Calm|248,,,8,252,|||||]Rotom-Mov|rotommow|choicescarf||leafstorm,voltswitch,thunderbolt,trick|Timid|,,4,252,,252|||||'
	]
};

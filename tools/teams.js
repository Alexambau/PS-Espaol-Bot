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
		'Vaporeon||leftovers||wish,protect,scald,healbell|Calm|200,,252,,56,|||||]Sableye||sablenite|H|willowisp,foulplay,knockoff,recover|Bold|252,,252,,4,|||||]Tentacruel||blacksludge|1|scald,rapidspin,toxicspikes,knockoff|Bold|224,,252,,,32|||||]Clefable||leftovers|H|moonblast,wish,protect,healbell|Bold|252,,252,,4,|||||]Heatran||leftovers||lavaplume,toxic,stealthrock,taunt|Calm|248,,,,192,68|||||]Chesnaught||leftovers|H|spikyshield,leechseed,drainpunch,spikes|Impish|252,,252,,4,|||||'
	],
	"ubers": [
		 'Latios||souldew||dracometeor,psyshock,recover,defog|Timid|,,,252,4,252||,0,,,,|||]Groudon-Primal||redorb||precipiceblades,firepunch,stoneedge,stealthrock|Adamant|252,252,,,,4|||||]Xerneas||powerherb||geomancy,moonblast,thunder,hiddenpowerfire|Modest|184,,,252,4,68||,30,,30,,30|||]Mewtwo-Mega-Y||mewtwonitey||psystrike,aurasphere,flamethrower,icebeam|Timid|4,,,252,,252|||||]Yveltal||leftovers||toxic,roost,foulplay,suckerpunch|Bold|224,,252,4,28,|||||]Scizor||choiceband|1|bulletpunch,uturn,superpower,knockoff|Adamant|,252,,,4,252|||||'
	],
	"uu": [
		'Blastoise||blastoisinite||rapidspin,darkpulse,icebeam,scald|Modest|248,,,252,8,|||||]Amoonguss||blacksludge|H|gigadrain,spore,clearsmog,foulplay|Bold|252,,136,,120,||,0,,,,|||]Chandelure||choicescarf||trick,fireblast,shadowball,energyball|Timid|,,,252,4,252|||||]Krookodile||blackglasses||earthquake,knockoff,taunt,stealthrock|Adamant|248,252,,,8,|||||]Snorlax||leftovers|1|curse,bodyslam,rest,sleeptalk|Careful|232,4,20,,252,|||||]Salamence||choicescarf|H|outrage,earthquake,fireblast,tailwind|Naive|,252,,4,,252|||||'
	],
	"ru": [
		'Alomomola||leftovers|H|scald,toxic,wish,protect|Bold|232,,252,4,20,|||||]Drapion||blacksludge||knockoff,toxicspikes,taunt,crosspoison|Adamant|252,252,,,4,|||||]Steelix||steelixite|1|heavyslam,earthquake,stealthrock,rest|Adamant|248,252,,,8,|||||]Doublade||eviolite||ironhead,shadowsneak,swordsdance,sacredsword|Adamant|248,252,,,8,|||||]Lickilicky||leftovers|1|healbell,bodyslam,wish,toxic|Careful|252,4,,,252,|||||]Golbat||eviolite|H|defog,roost,bravebird,taunt|Careful|252,4,,,252,|||||'
	],
	"lc": [
		'Zebra Bird|vullaby|eviolite|1|roost,defog,uturn,knockoff|Impish|,,236,,236,36||||5|]Smogonweasel|mienfoo|eviolite|1|drainpunch,uturn,knockoff,acrobatics|Jolly|,,36,,196,236||||5|]Chin Chang Chou|chinchou|eviolite||scald,voltswitch,sleeptalk,rest|Bold|76,,212,68,148,||,0,,,,||5|]Assaultvesta|larvesta|eviolite||morningsun,flareblitz,uturn,willowisp|Adamant|76,76,156,,156,36||||5|]Corporal|foongus|eviolite|H|spore,sludgebomb,gigadrain,hiddenpowerfighting|Bold|124,,160,,160,||,1,30,30,30,30||5|]Rainbows|archen|berryjuice||stealthrock,acrobatics,stoneedge,uturn|Jolly|76,180,,,,196||||5|',
		'Ole|chinchou|berryjuice||scald,voltswitch,healbell,thunderwave|Bold|76,,212,152,,60||||5|]Ole2|mienfoo|choicescarf|1|highjumpkick,uturn,knockoff,drainpunch|Jolly|,236,36,,,236||||5|]Ole3|ponyta|eviolite|H|flareblitz,morningsun,toxic,willowisp|Jolly|,76,236,,,196||||5|]Ole4|vullaby|eviolite|1|bravebird,knockoff,roost,defog|Impish|116,76,236,,76,||||5|]Ole5|diglett|focussash|1|earthquake,rockslide,suckerpunch,stealthrock|Jolly|,236,,,36,236||||5|]Y Ole|abra|lifeorb|H|psychic,hiddenpowerfighting,substitute,dazzlinggleam|Timid|,,,240,68,200||,,30,30,30,30||5|',
		'Vulpix||lifeorb|H|overheat,fireblast,energyball,extrasensory|Timid|,,36,196,,236||23,,,,,||5|]Bellsprout||lifeorb||solarbeam,suckerpunch,weatherball,sludgebomb|Modest|36,,76,196,,196||||5|]Timburr||eviolite||drainpunch,knockoff,machpunch,bulkup|Impish|76,196,76,,156,||||5|]Archen||berryjuice||defog,rockslide,acrobatics,earthquake|Jolly|76,,156,,76,196||||5|]Bunnelby||choicescarf|H|return,uturn,earthquake,wildcharge|Jolly|,188,52,,,220||||5|]Slowpoke||eviolite|H|scald,slackoff,thunderwave,psychic|Bold|116,,236,36,116,||||5|'
	],
	"anythinggoes": [
		'Latios||souldew||dracometeor,psyshock,recover,defog|Timid|,,,252,4,252||,0,,,,|||]Groudon-Primal||redorb||precipiceblades,firepunch,stoneedge,stealthrock|Adamant|252,252,,,,4|||||]Xerneas||powerherb||geomancy,moonblast,thunder,hiddenpowerfire|Modest|184,,,252,4,68||,30,,30,,30|||]Mewtwo-Mega-Y||mewtwonitey||psystrike,aurasphere,flamethrower,icebeam|Timid|4,,,252,,252|||||]Yveltal||leftovers||toxic,roost,foulplay,suckerpunch|Bold|224,,252,4,28,|||||]Scizor||choiceband|1|bulletpunch,uturn,superpower,knockoff|Adamant|,252,,,4,252|||||',
		'Deoxys-Attack||focussash||psychoboost,icebeam,superpower,stealthrock|Hasty|,4,,252,,252|||||]Rayquaza-Mega||leftovers||dragondance,dragonascent,earthquake,extremespeed|Jolly|,252,,,4,252|||||]Arceus||lumberry||swordsdance,extremespeed,shadowforce,recover|Adamant|252,252,,,4,|||||]Groudon-Primal||redorb||precipiceblades,firepunch,thunderwave,dragontail|Impish|252,,216,,40,|||||]Arceus-Ghost||spookyplate||judgment,calmmind,willowisp,recover|Timid|252,,,4,,252|||||]Groudon-Primal||redorb||precipiceblades,firepunch,dragonclaw,rockpolish|Adamant|4,252,,,,252|||||',
		'Deoxys-Attack||focussash||psychoboost,icebeam,superpower,stealthrock|Hasty|,4,,252,,252|||||]Groudon-Primal||redorb||precipiceblades,firepunch,dragonclaw,rockpolish|Adamant|4,252,,,,252|||||]Rayquaza-Mega||lumberry||dragondance,dragonascent,earthquake,extremespeed|Jolly|,252,,,4,252|||||]Arceus||lumberry||swordsdance,extremespeed,shadowforce,recover|Adamant|252,252,,,4,|||||]Groudon-Primal||redorb||precipiceblades,firepunch,thunderwave,dragontail|Impish|252,,216,,40,|||||]Xerneas||powerherb||geomancy,moonblast,thunder,hiddenpowerfire|Modest|184,,,252,4,68||,30,,30,,30|||'
	],
	"customgame": [
		'Zapdos||leftovers|wonderguard|thunder,raindance,hurricane,recover,leechseed,calmmind,willowisp,toxic,refresh|Modest|252,252,252,252,252,252||||9999|]Altaria-Mega||leftovers|magicbounce|rapidspin,quiverdance,lightofruin,spacialrend,recover,minimize,gigadrain,originpulse|Timid|252,252,252,252,252,252|F|||9999|]Gengar-Mega||brightpowder|noguard|fissure,sheercold,entrainment,darkvoid,recover,hyperspacefury,thousandarrows,shadowball|Timid|252,252,252,252,252,252|F|||9999|]Seismitoad||toxicorb|poisonheal|stealthrock,spikes,toxicspikes,stickyweb,recover,sludgebomb,earthpower,healbell,steameruption|Sassy|252,252,252,252,252,252|M|||9999|]Typhlosion||powerherb|moldbreaker|geomancy,recover,blueflare,earthpower,aurasphere,seedflare,searingshot,steameruption|Timid|252,252,252,252,252,252|M|||9999|]Garchomp||yacheberry|moldbreaker|earthquake,honeclaws,dragonrush,stoneedge,recover,substitute,extremespeed,dragondance,highjumpkick|Jolly|252,252,252,252,252,252||||9999|'
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
	]
};

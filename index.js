const { savePoke } = require('./savePoke.js');
const { saveMove } = require('./saveMove.js');
const { stat_calc } = require('./stat_calc.js');
const { battle } = require('./newBattle.js');
const { pokeCreate } = require('./pokeCreate.js');

const { question } = require('readline-sync');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('pokemon.json');
const db = low(adapter);

function Random(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

db.get('ids').value();



//savePoke('pidgeot');
//saveMove('gust');



let vaporeon = pokeCreate('vaporeon', ['ice-beam', 'quick-attack', 'toxic']);
let charmander = pokeCreate('charmander', ['scratch']);
let bulbasaur = pokeCreate('bulbasaur', ['growl']);
let squirtle = pokeCreate('squirtle', ['tail-whip']);
let vulpix = pokeCreate('vulpix', ['ember', 'confuse-ray']);
let rhydon = pokeCreate('rhydon', ['earthquake', 'dig']);
let pidgeot = pokeCreate('pidgeot', ['growl']);
let dragonite = pokeCreate('dragonite', ['hyper-beam', 'bide', 'thrash', 'rage']);



let player = {
	name: 'Glace', 
	party: [dragonite, vulpix, vaporeon, rhydon], 
	knocked_out: false, 
	is_switching: false, 
}

let rival = {
	name: 'Gary', 
	party: [charmander, squirtle, bulbasaur, pidgeot], 
	knocked_out: false, 
	is_switching: false, 
}

//console.log(charmander)

let x = true;

if(x){
	try{
		battle(player, rival);
	}catch(error){
		console.log(error);
	}
}

''
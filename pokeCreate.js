const { stat_calc } = require('./stat_calc.js');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('pokemon.json');
const db = low(adapter);

function Random(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function pokeCreate(poke_name, move_array){
	let poke = db.get('pokemon').find({name: poke_name}).value();

	poke = stat_calc(poke);

	poke.moves = move_array;

	return poke;
}


module.exports = {
	pokeCreate
}
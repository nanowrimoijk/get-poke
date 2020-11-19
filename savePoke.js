let Pokedex = require('pokedex-promise-v2');
let P = new Pokedex();

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('pokemon.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ pokemon: [], ids: [] }).write();

// Add a post
//db.get('posts').push({ id: 1, title: 'lowdb is awesome'}).write();

function savePoke(poke_name) {
	console.clear();

	P.getPokemonByName(poke_name).then(function(response) {
		console.log(response.stats);
		let h = response.stats[0].base_stat;
		let a = response.stats[1].base_stat;
		let d = response.stats[2].base_stat;
		let s = response.stats[5].base_stat;
		let t = response.types;
		console.log(response);

		db.get('pokemon').push({ name: poke_name, type1: t[0], type2: t[1], hp: h, attack: a, defense: d, special: null, speed: s}).write();

	}).catch(function(error) {
		console.log('There was an ERROR: ', error);
	});
}


module.exports = {
	savePoke, 
}
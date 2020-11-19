let Pokedex = require('pokedex-promise-v2');
let P = new Pokedex();

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('moves.json');
const db = low(adapter);

db.defaults({ moves: []}).write();


function saveMove(move_name){
	let move;

	P.getMoveByName(move_name).then(function(response) {
    console.log(response);

		move = {
			name: response.name, 
			power: response.power, 
			pp: response.pp, 
			priority: response.priority, 
			stat_changes: response.stat_changes, 
			type: response.type.name, 
			accuracy: Math.ceil((255 / 100) * response.accuracy), 
			damage_class: response.damage_class.name, 
			effect_chance: response.effect_chance, 
			meta: {
				ailment: response.meta.ailment.name, 
				ailment_chance: response.meta.ailment_chance, 
				category: response.meta.category.name, 
				crit_rate: response.meta.crit_rate, 
				drain: response.meta.drain, 
				flinch_chance: response.meta.flinch_chance, 
				healing: response.meta.healing, 
				max_hits: response.meta.max_hits, 
				max_turns: response.meta.max_turns, 
				min_hits: response.meta.min_hits, 
				min_turns: response.meta.min_turns, 
				stat_chance: response.meta.stat_chance, 
			}, 
		}

		db.get('moves').push(move).write();

  }).catch(function(error) {
    console.log('There was an ERROR: ', error);
  });
}

module.exports = {
	saveMove
}
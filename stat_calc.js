
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('pokemon.json');
const db = low(adapter);

function Random(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

let ids = [];

function stat_calc(poke) {
	let pokemon = {
		name: poke.name,
		nickname: undefined, 
		id: null, 
		type1: poke.type1, 
		type2: poke.type2, 
		level: 10,
		stats: {
			hp: {
				base_stat: poke.hp,
				iv: 0,
				value: null,
				current: null, 
			},
			attack: {
				base_stat: poke.attack,
				iv: Random(15),
				value: null, 
				current: null, 
				mod: 0, 
			},
			defense: {
				base_stat: poke.defense,
				iv: Random(15),
				value: null, 
				current: null, 
				mod: 0, 
			},
			special: {
				base_stat: poke.special,
				iv: Random(15),
				value: null, 
				current: null, 
				mod: 0, 
			},
			speed: {
				base_stat: poke.speed,
				iv: Random(15),
				value: null, 
				current: null, 
				mod: 0, 
			},
			accuracy: {
				mod: 0, 
			}, 
			evasion: {
				mod: 0, 
			}, 
		},
		status: false, 
		volatile_status: false, 
		disabled: false, 
		confused: false, 
		flinched: false, 
		seeded: false, 
		charging: false, 
		invulnerability: false, 
		move_trap: false, 
		last_move: undefined, 
		last_damage: null, 
		toxicCounter: null, 
		counter: 0, 
		reflect: 0, 
		lightS: 0, 
		mist: 0, 
		substitute: false, 
		moves: [], 
	};

	pokemon.stats.attack.value = Math.floor(Math.floor((2 * pokemon.stats.attack.base_stat + (pokemon.stats.attack.iv * 2) + 0) * (pokemon.level + 1) / 100 + 5) * 1);
	pokemon.stats.defense.value = Math.floor(Math.floor((2 * pokemon.stats.defense.base_stat + (pokemon.stats.defense.iv * 2) + 0) * (pokemon.level + 1) / 100 + 5) * 1);
	pokemon.stats.special.value = Math.floor(Math.floor((2 * pokemon.stats.special.base_stat + (pokemon.stats.special.iv * 2) + 0) * (pokemon.level + 1) / 100 + 5) * 1);
	pokemon.stats.speed.value = Math.floor(Math.floor((2 * pokemon.stats.speed.base_stat + (pokemon.stats.speed.iv * 2) + 0) * (pokemon.level + 1) / 100 + 5) * 1);

	if (pokemon.stats.attack.iv % 2 != 0) {
		pokemon.stats.hp.iv += 8;
	}
	if (pokemon.stats.defense.iv % 2 != 0) {
		pokemon.stats.hp.iv += 4;
	}
	if (pokemon.stats.speed.iv % 2 != 0) {
		pokemon.stats.hp.iv += 2;
	}
	if (pokemon.stats.special.iv % 2 != 0) {
		pokemon.stats.hp.iv += 1;
	}

	pokemon.stats.hp.value = Math.floor(Math.floor((2 * pokemon.stats.hp.base_stat + (pokemon.stats.hp.iv * 2) + 0) * (pokemon.level + 1) / 100 + 5) * 1);

	pokemon.stats.hp.current = pokemon.stats.hp.value;
	pokemon.stats.attack.current = pokemon.stats.attack.value;
	pokemon.stats.defense.current = pokemon.stats.defense.value;
	pokemon.stats.special.current = pokemon.stats.special.value;
	pokemon.stats.speed.current = pokemon.stats.speed.value;

	pokemon.id = getId();

	//console.log(pokemon);

	return pokemon;
}

function getId(){
	//let ids = db.get('ids').value();
	let id = '';
	for(let i = 20; i > 0; i--){
		id = id.concat('', Random(9));
	}

	if(ids.includes(id)){
		getId();
	}
	
	//db.get('ids').push(id).write();
	ids.push(id);

	//console.log(ids);

	return id;
}



module.exports = {
	stat_calc
}
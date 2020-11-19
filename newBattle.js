
const { question } = require('readline-sync');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('pokemon.json');
const pokemon = low(adapter);
const adapter0 = new FileSync('moves.json');
const moves = low(adapter0);


const { calculate } = require('@smogon/calc');
const { Generations } = require('@smogon/calc');
const { Pokemon } = require('@smogon/calc');
const { Move } = require('@smogon/calc');
const gen = Generations.get(1);
let result;

function Random(max) {
	return Math.floor(Math.random() * Math.floor(max));
}


let gust;

let player;
let enemy;
let poke1;
let poke2;
let attack1;
let attack2;
let self_hit = false;

let pokeChanged = false;
let battleType;

let menu;


function battle(p, e){
	gust = moves.get('moves').find({ name: 'gust' }).value();

	player = p;
	enemy = e;
	//type of battle
	if (enemy.party != undefined) {
		battleType = 'trainer';
	}
	else {
		battleType = 'wild';
	}

	//start battle
	poke1 = sendPoke(player.party[0], player);
	poke2;
	if (battleType == 'trainer') {
		poke2 = sendPoke(enemy.party[0], enemy);
	}
	else {
		poke2 = enemy;
		console.log(`Wild ${poke2.name} attacked!`);
		question('press enter');
		enemy.knocked_out = false;
	}

	while (player.knocked_out == false && (battleType == 'trainer' ? enemy.knocked_out == false : enemy.stats.hp.current > 0)) {
		if(attack1 == undefined){
			turnloop();
		}
		attack1 = undefined;
		attack2 = undefined;
	}

	if (player.knocked_out) {
		console.log(`${player.name} has run out of pokemon!`);
		console.log(`Enemy ${enemy.name} wins!`);
	}

	if (battleType == 'trainer' && enemy.knocked_out) {
		console.log(`Enemy ${enemy.name} has run out of pokemon!`);
		console.log(`${player.name} wins!`);
	}
	else{
		console.log(`Enemy ${enemy.name} has fainted!`);
		console.log(`${player.name} wins!`);
	}

}

function turnloop(){
	console.clear();
	if(menu == undefined){
		menu = 'Pchoose';
	}

	switch(menu){
		case 'Pchoose':
			Pchoose();
			break;
		case 'Pattack':
			Pattack();
			break;
		case 'Pswitch':
			Pswitch();
			break;
		case 'Pitems': 
			Pitems();
			break;
		case 'Pchange':
			Pchange();
			break;
	}

	if(attack1 != undefined){
		let F1 = false;
		let F2 = false;
		while (attack2 == undefined) {
			attack2 = enemyChoice(poke2);
		}

		let order = turnOrder(attack1, attack2);

		battleTime(order);

		statusDamage(poke1);
		statusDamage(poke2);

		//console.log(poke1);
		//question('iowenvjkerbiwbvwbu');

		//reset trap status
		if (poke1.move_trap) {
			if (poke1.counter == 0) {
				poke1.volatile_status = false;
				poke1.move_trap = false;
			}

			poke1.counter-= 1;
		}
		if (poke2.move_trap) {
			if (poke2.counter == 0) {
				poke2.volatile_status = false;
				poke2.move_trap = false;
			}
			
			poke2.counter-= 1;
		}

		if(player.knocked_out == false && enemy.knocked_out == false){
			console.log(`${poke1.name}: ` + poke1.stats.hp.current);
			console.log(`Enemy ${poke2.name}: ` + poke2.stats.hp.current);
			question('press enter');
		}

		menu = 'Pchoose';
		attack1 = undefined;
		attack2 = undefined;
		pokeChanged = false;
		player.is_switching = false;
		enemy.is_switching = false;
	}
}

function battleTime(order){
	let c;
	if (!player.is_switching && order[0].id == poke1.id && poke1.status != 'sleep' && poke1.flinched != true && poke1.status != 'frozen') {
		
		if(enemy.is_switching){
			console.log(`${poke2.name} was sent out!`);
			question('press enter\n');
		}

		if(poke1.volatile_status == 'confusion'){
			console.log(`${poke1.name} is confused!`);
			c = Random(99);
			if(c > 50){
				if(poke2.status == 'paralysis'){
					c = Random(99);
					if(c + 1 > 25){
						pokeAttack(poke1, poke2, attack1, self_hit);
					}
					else{
						console.log(`${poke1.name} is fully paralyzed!\n`);
					}
				}
				else{
					pokeAttack(poke1, poke2, attack1, self_hit);
				}
			}
			else{
				console.log(`${poke1.name} hit it's self in it's confusion!`);
				self_hit = true;
				pokeAttack(poke1, poke1, gust, self_hit);
				self_hit = false;
			}
		}
		else if(poke1.status == 'paralysis'){
			c = Random(99);
			if(c + 1 > 25){
				pokeAttack(poke1, poke2, attack1, self_hit);
			}
			else{
				console.log(`${poke1.name} is fully paralyzed!\n`);
			}
		}
		else if(poke2.volatile_status == 'trap'){
			console.log(`${poke1.name} couldn't move!\n`);
		}
		else{
			pokeAttack(poke1, poke2, attack1, self_hit);
		}

		F1 = faintCheck(poke2);
		if (F1) {
			pokeChanged = true;
			F2 = faintCheck(poke1);
			if (F2) {
				while(poke1 == undefined){ 
					Pchange(); 
				}
				if (poke1 == 'KO') {
					player.knocked_out = true;
					return;
				}
				else {
					poke1 = sendPoke(poke1, player);
				}
			}

			poke2 = enemyChange();
			if (poke2 == 'KO') {
				enemy.knocked_out = true;
				return;
			}
			else {
				poke2 = sendPoke(poke2, enemy);
			}
		}

		if (!pokeChanged && poke2.status != 'sleep' && poke2.flinched != true && poke2.status != 'freeze') {
			
			if(poke2.volatile_status == 'confusion'){
				console.log(`${poke2.name} is confused!`);
				c = Random(99);
				if(c > 50){
					if(poke2.status == 'paralysis'){
						c = Random(99);
						if(c + 1 > 25){
							pokeAttack(poke2, poke1, attack2, self_hit);
						}
						else{
							console.log(`${poke2.name} is fully paralyzed!\n`);
						}
					}
					else{
						pokeAttack(poke2, poke1, attack2, self_hit);
					}
				}
				else{
					console.log(`${poke2.name} hit it's self in it's confusion!`);
					self_hit = true;
					pokeAttack(poke2, poke2, gust, self_hit);
					self_hit = false;
				}
			}
			else if(poke2.status == 'paralysis'){
				c = Random(99);
				if(c + 1 > 25){
					pokeAttack(poke2, poke1, attack2, self_hit);
				}
				else{
					console.log(`${poke2.name} is fully paralyzed!\n`);
				}
			}
			else if(poke1.volatile_status == 'trap'){
			console.log(`${poke2.name} couldn't move!\n`);
		}
			else{
				pokeAttack(poke2, poke1, attack2, self_hit);
			}
		}

		F2 = faintCheck(poke1);
		if (F2) {
			F1 = faintCheck(poke2);
			if (F1) {
				poke2 = enemyChange
				if (poke2 == 'KO') {
					enemy.knocked_out = true;
					return;
				}
				else {
					poke2 = sendPoke(poke1, enemy);
				}
			}

			while(poke1 == undefined){ 
					Pchange(); 
				}
			if (poke1 == 'KO') {
				player.knocked_out = true;
				return;
			}
			else {
				poke1 = sendPoke(poke2, player);
			}
		}
	}
	else if (!enemy.is_switching && order[0].id == poke2.id && poke2.status != 'sleep' && poke2.status != 'freeze') {

		if(player.is_switching){
			console.log(`${poke1.name} was sent out!`);
			question('press enter\n');
		}

		if(poke2.volatile_status == 'confusion'){
			console.log(`${poke2.name} is confused!`);
			c = Random(99);
			if(c > 50){
				if(poke1.status == 'paralysis'){
					c = Random(99);
					if(c + 1 > 25){
						pokeAttack(poke2, poke1, attack2, self_hit);
					}
					else{
						console.log(`${poke2.name} is fully paralyzed!\n`);
					}
				}
				else{
					pokeAttack(poke2, poke1, attack2, self_hit);
				}
			}
			else{
				console.log(`${poke2.name} hit it's self in it's confusion!`);
				self_hit = true;
				pokeAttack(poke2, poke2, gust, self_hit);
				self_hit = false;
			}
		}
		else if(poke2.status == 'paralysis'){
			c = Random(99);
			if(c + 1 > 25){
				pokeAttack(poke2, poke1, attack2, self_hit);
			}
			else{
				console.log(`${poke2.name} is fully paralyzed!\n`);
			}
		}
		else if(poke1.volatile_status == 'trap'){
			console.log(`${poke2.name} couldn't move!\n`);
		}
		else{
			pokeAttack(poke2, poke1, attack2, self_hit);
		}

		F1 = faintCheck(poke1);
		if (F1) {
			pokeChanged = true;
			F2 = faintCheck(poke2);
			if (F2) {
				poke2 = enemyChange();
				if (poke2 == 'KO') {
					enemy.knocked_out = true;
					return;
				}
				else {
					poke2 = sendPoke(poke2, enemy);
				}
			}

			while(poke1 == undefined){ 
				Pchange(); 
			}
			if (poke1 == 'KO') {
				player.knocked_out = true;
				return;
			}
			else {
				poke1 = sendPoke(poke1, player);
			}
		}

		if (!pokeChanged && poke1.status != 'sleep' && poke1.flinched != true && poke1.status != 'freeze') {
			
			if(poke1.volatile_status == 'confusion'){
				console.log(`${poke1.name} is confused!`);
				c = Random(99);
				if(c > 50){
					if(poke1.status == 'paralysis'){
						c = Random(99);
						if(c + 1 > 25){
							pokeAttack(poke1, poke2, attack1, self_hit);
						}
						else{
							console.log(`${poke1.name} is fully paralyzed!\n`);
						}
					}
					else{
						pokeAttack(poke1, poke2, attack1, self_hit);
					}
				}
				else{
					console.log(`${poke1.name} hit it's self in it's confusion!`);
					self_hit = true;
					pokeAttack(poke1, poke1, gust, self_hit);
					self_hit = false;
				}
			}
			else if(poke1.status == 'paralysis'){
				c = Random(99);
				if(c + 1 > 25){
					pokeAttack(poke1, poke2, attack1, self_hit);
				}
				else{
					console.log(`${poke1.name} is fully paralyzed!\n`);
				}
			}
			else if(poke2.volatile_status == 'trap'){
				console.log(`${poke1.name} couldn't move!\n`);
			}
			else{
				pokeAttack(poke1, poke2, attack1, self_hit);
			}
		}

		F2 = faintCheck(poke2);
		if (F2) {
			F1 = faintCheck(poke1);
			if (F1) {
				while(poke1 == undefined){ 
					Pchange(); 
				}
				if (poke1 == 'KO') {
					player.knocked_out = true;
					return;
				}
				else {
					poke1 = sendPoke(poke1, player);
				}
			}

			poke2 = enemyChange();
			if (poke2 == 'KO') {
				enemy.knocked_out = true;
				return;
			}
			else {
				poke2 = sendPoke(poke2, enemy);
			}
		}
	}
}

function pokeAttack(user, target, move) {
	//console.log('>>>');
	//console.log(move);
	//console.log()
	result = calculate(
		gen,
		new Pokemon(gen, user.name, {
			level: 5,
			ivs: {
				hp: user.stats.hp.iv,
				atk: user.stats.attack.iv,
				def: user.stats.defense.iv,
				spa: user.stats.special.iv,
				spd: user.stats.special.iv,
				spe: user.stats.speed.iv, 
			},
			evs: {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0,
			},
			boosts: {
				hp: user.stats.hp.mods,
				atk: user.stats.attack.mods,
				def: user.stats.defense.mods,
				spc: user.stats.special.mods,
				spe: user.stats.speed.mods, 
			},
			status: user.status,
		}),
		new Pokemon(gen, target.name, {
			level: 5,
			ivs: {
				hp: target.stats.hp.iv,
				atk: target.stats.attack.iv,
				def: target.stats.defense.iv,
				spc: target.stats.special.iv,
				spe: target.stats.speed.iv, 
			},
			evs: {
				hp: 0,
				atk: 0,
				def: 0,
				spa: 0,
				spd: 0,
				spe: 0,
			},
			boosts: {
				hp: target.stats.hp.mods,
				atk: target.stats.attack.mods,
				def: target.stats.defense.mods,
				spc: target.stats.special.mods,
				spe: target.stats.speed.mods, 
			},
			status: target.status,
		}),
		new Move(gen, move.name),
	);

	let accuracy = accuracyCalc(user, move, target);
	//console.log(result);

	if(target.invulnerability){
		accuracy = false;
	}

	if(self_hit || user.move_trap == true){
		accuracy = true;
	}

	if (accuracy) {
		let stat_changed = false;

		if (move.power != null && result.damage != 0) {
			if(move.name == 'fly' || move.name == 'dig'){
				user.last_move = move;
				if(user.charging == false){
					user.charging = true;
				}
				else if(user.charging == true){
					user.move_trap = false;
					user.invulnerability = false;
					user.charging = false;
				}
			}

			if(move.name == 'solar-beam'){
				user.last_move = move;
				if(user.charging == false){
					user.charging = true;
				}
				else if(user.charging == true){
					user.move_trap = false;
					user.charging = false;
				}
			}

			if(!user.charging){
				let rdmn = result.damage[Random(result.damage.length)];
				target.stats.hp.current -= rdmn;
				target.last_damage = rdmn;
			}

			//console.log(user);

			if(self_hit == false && user.move_trap == false && user.charging == false){
				console.log(`${user.name} used ${move.name}.`);

				if(move.name == 'hyper-beam'){
					user.charging = true;
				}
			}
			else if(move.name == 'wrap' && user.move_trap == true){
				console.log(`${user.name}'s attack continues!`);
			}
			else if(move.name == 'fly' && user.move_trap == false){
				console.log(`${user.name} flew up into the sky!`);
				user.move_trap = true;
				user.invulnerability = true;
				user.counter = 1;
			}
			else if(move.name == 'dig' && user.move_trap == false){
				console.log(`${user.name} dug under the ground!`);
				user.move_trap = true;
				user.invulnerability = true;
				user.counter = 1;
			}
			else if(move.name == 'solar-beam' && user.move_trap == false){
				console.log(`${user.name} took in sunlight!`);
				user.move_trap = true;
				user.counter = 1;
			}
			else if(move.name == 'hyper-beam' && user.move_trap == true){
				console.log(`${user.name} has to recharge!`);
				user.charging = false;
			}

			question('press enter\n');


			if(move.name == 'wrap' && user.move_trap == false){
				user.counter = 2 + Random(3);
				user.move_trap = true;
				user.volatile_status = 'trap';
			}

			if(move.name == 'hyper-beam' && user.move_trap == false){
				user.move_trap = true;
				user.counter = 1;
			}

			//console.log(user);

		}
		else if(result.damage == 0 && move.damage_class != 'status'){
			if(self_hit == false){
				console.log(`${user.name} used ${move.name}.`);
				console.log(`${target.name} was unaffected!`);
				question('press enter\n');
			}
		}


		let x;
		if (move.damage_class == 'status') {
			console.log(`${user.name} used ${move.name}.`);
			for (let i = 0; move.stat_changes[i] != undefined; i++) {
				x = parseInt(move.stat_changes[i].change);
				z = eval(`target.stats.${move.stat_changes[i].stat}.mod`);
				y = eval(`user.stats.${move.stat_changes[i].stat}.mod`);
				if (x < 0) {
					if(z < 6 && z > -6){
						eval(`target.stats.${move.stat_changes[i].stat}.mod += ${x};`);
						stat_changed = true;
					}
				}
				else {
					if(y < 6 && y > -6){
						eval(`user.stats.${move.stat_changes[i].stat}.mod += ${x};`);
						stat_changed = true;
					}
				}
				if(stat_changed){
					switch (move.stat_changes[i].change) {
						case -2:
							console.log(`${target.name}'s ${move.stat_changes[i].stat} was greatly lowered!`);
							break;
						case -1:
							console.log(`${target.name}'s ${move.stat_changes[i].stat} was lowered!`);
							break;
						case 1:
							console.log(`${user.name}'s ${move.stat_changes[i].stat} was raised!`);
							break;
						case 2:
							console.log(`${target.name}'s ${move.stat_changes[i].stat} was greatly raised!`);
							break;
					}
				}
				else{
					console.log('nothing happened!');
				}
				//console.log(z);
			}
			question('press enter\n');

		if(move.meta.category == 'ailment'){
			let words;
			switch(move.meta.ailment){
				case 'poison':
					if(move.name == 'toxic'){
						words = 'badly poisoned';
					}else{
						words = 'poisoned';
					}
					break;

				case 'paralysis':
					words = 'paralyzed';
					break;

				case 'burn':
					words = 'burned';
					break;

				case 'sleep':
					words = 'put to sleep';
					break;

				case 'freeze':
					words = 'frozen solid';
					break;
				case 'confusion':
					words = 'confused';
					break;
			}

			if(move.meta.ailment == 'paralysis' && target.status != 'paralysis'){
				target.stats.speed.current = Math.floor(target.stats.speed.current * 0.25);
			}
			if(move.meta.ailment == 'burn' && target.status != 'burn'){
				target.stats.attack.current = Math.floor(target.stats.attack.current * 0.5);
			}
			if(move.meta.ailment == 'sleep' && target.status != 'sleep'){
				target.counter = Random(5) + 1;
			}

			if(move.meta.ailment != 'confusion'){
				target.status = move.meta.ailment;
			}
			else if(move.meta.ailment == 'confusion'){
				target.volatile_status = move.meta.ailment;
			}

			if(move.name == 'toxic' && target.status != 'toxic'){
				target.status = 'toxic';
				target.toxicCounter = 0;
			}

			console.log(`${target.name} was ${words}!`);
			question('press enter\n');
		}
		}
		
		ailmentCheck(user, target, move);

	}
	else {
		console.log(`${user.name} missed!`);
		question('press enter\n');

		user.move_trap = false;
		user.invulnerability = false;
		user.charging = false;
		if(user.volatile_status == 'trap'){
			user.volatile_status = false;
		}
	}

	user.last_move = move;
}

function Pchange(){
	console.clear();
	poke1 = undefined;

	let found = false;
	for (let i = 0; player.party[i] != undefined; i++) {
		//console.log(player.party[i]);
		if (player.party[i].stats.hp.current > 0) {
			found = true;
		}
	}

	if (found) {
		let p;
		for (let i = 0; player.party[i] != undefined; i++) {
			p = player.party[i];
			console.log(`[${i + 1}]${p.name} - ${p.stats.hp.current}/${p.stats.hp.value}`);
		}

		let pokeSend = question('>');
		console.log();
		let pokemon;

		switch (pokeSend) {
			case '1':
				pokemon = player.party[0];
				break;
			case '2':
				pokemon = player.party[1];
				break;
			case '3':
				pokemon = player.party[2];
				break;
			case '4':
				pokemon = player.party[3];
				break;
			case '5':
				pokemon = player.party[4];
				break;
			case '6':
				pokemon = player.party[5];
				break;
			default:
				console.log(`${pokeSend} is not a valid party id.`);
				question('press enter');
				break;
		}

		if (pokemon == undefined || pokemon.stats.hp.current <= 0) {
			console.log(`There is either no pokemon in party slot ${pokeSend}, or that pokemon has already fainted.`);
			question('press enter');
		}
		else{
			poke1 = pokemon;
		}
	}
	else {
		poke1 = 'KO';
		player.knocked_out = true;
	}
}

function Pchoose(){
	console.log();
	console.log('[1]attack');
	console.log('[2]pkmn');
	console.log('[3]items');
	console.log('[4]run');
	console.log();
	//console.log(poke);
	let turn = question('> ');

	switch (turn) {
		case '1':
			menu = 'Pattack';
			break;
		case '2':
			menu = 'Pswitch';
			break;
		case '3':
			menu = 'Pitems'
			break;
		case '4':
			if (battleType == 'trainer') {
				console.log("\nThere is no running from a trainer battle!");
				question('press enter');
			}
			break;
		default:
			console.log(`\n${turn} is not a valid option, please input a listed number.`);
			question('press enter');
			break;
	}
}

function Pattack(){
	if(poke1.move_trap == false && poke1.counter <= 0){
		console.log();
		console.log("[1]" + poke1.moves[0]);
		console.log("[2]" + poke1.moves[1]);
		console.log("[3]" + poke1.moves[2]);
		console.log("[4]" + poke1.moves[3]);
		console.log("[5]back\n")
		//console.log(poke1);
		let attackChoice = question('> ');
		console.log();

		switch (attackChoice) {
			case '1':
				attack1 = moves.get('moves').find({ name: poke1.moves[0] }).value();
				break;
			case '2':
				attack1 = moves.get('moves').find({ name: poke1.moves[1] }).value();
				break;
			case '3':
				attack1 = moves.get('moves').find({ name: poke1.moves[2] }).value();
				break;
			case '4':
				attack1 = moves.get('moves').find({ name: poke1.moves[3] }).value();
				break;
			case '5':
				menu = 'Pchoose';
				break;
			default:
				console.log(`${attackChoice} is not a valid option, please input a listed number.`);
				question('press enter');
				break;
		}
	}
	else{
		attack1 = poke1.last_move;
	}
}

function faintCheck(poke) {
	//console.log(poke);
	if(poke != 'KO'){
		if (poke.stats.hp.current != undefined && poke.stats.hp.current <= 0) {
			poke.stats.hp.current = 0;
			if(battleType != 'wild'){
				console.log(`${poke.name} has fainted!`);
				question('press enter\n');
			}

			if(poke.id == poke1.id){
				poke1 = undefined;
			}

			if(attack1.name == 'wrap'){
				poke1.move_trap = false;
				poke1.counter = 0;
				poke1.volatile_status = false;
			}
			if(attack2.name == 'wrap'){
				poke2.move_trap = false;
				poke2.counter = 0;
				poke2.volatile_status = false;
			}

			return true;
		}
		else return false;
	}
	else{
		return true;
	}
}

function turnOrder() {
	let first;
	let second;

	let priority_move = false;

	if (!player.is_switching && !enemy.is_switching) {
		if (attack1.name == 'quick-attack' && attack2.name != 'quick-attack') {
			first = poke1;
			second = poke2;
			priority_move = true;
		}
		else if (attack2.name == 'quick-attack' && attack1.name != 'quick-attack') {
			first = poke2;
			second = poke1;
			priority_move = true;
		}

		if (attack1.name == 'counter' && attack2.name != 'counter') {
			first = poke2;
			second = poke1;
			priority_move = true;
		}
		else if (attack2.name == 'counter' && attack1.name != 'counter') {
			first = poke1;
			second = poke2;
			priority_move = true;
		}

		if (attack1.name != attack2.name && priority_move) {
			if (first != undefined && first.id == poke1.id) {
				second = poke2;
			}
			else if (first != undefined && first.id == poke2.id) {
				second = poke1;
			}
			else if (second != undefined && second.id == poke1.id) {
				first = poke2;
			}
			else if (second != undefined && second.id == poke2.id) {
				first = poke1;
			}
		}
	}
	else if (player.is_switching) {
		first = poke2;
		second = poke1;
	}
	else {
		if (enemy.is_switching) {
			first = poke1;
			second = poke2;
		}
	}


	if (first == undefined && second == undefined) {
		if (poke1.stats.speed.current > poke2.stats.speed.current) {
			first = poke1;
			second = poke2;
		}
		else if (poke2.stats.speed.current > poke1.stats.speed.current) {
			first = poke2;
			second = poke1;
		}
		else if (poke1.stats.speed.current == poke2.stats.speed.current) {
			let int = Random(1);
			if (int == 0) {
				first = poke1;
				second = poke2;
			}
			else {
				first = poke2;
				second = poke1;
			}
		}
	}

	return [first, second];
}

function enemyChange() {
	let found = false;
	if(battleType == 'trainer'){
		for (let i = 0; enemy.party[i] != undefined; i++) {
			//console.log(enemy.party[i].stats.hp.current);
			if (enemy.party[i].stats.hp.current > 0) {
				found = true;
			}
		}

		if (found == true) {
			for (let i = 0; enemy.party[i] != undefined; i++) {
				//console.log(enemy.party[i]);
				if (enemy.party[i].stats.hp.current != 0) {
					return enemy.party[i];
				}
			}
		}
		else {
			return 'KO';
		}
	}
	else if(battleType == 'wild'){
		return 'KO';
	}
}

function Pswitch(){
	console.log();
	let p;
	for(let i = 0; player.party[i] != undefined; i++){
		p = player.party[i];
		console.log(`[${i + 1}]${p.name} - ${p.stats.hp.current}/${p.stats.hp.value}`);
	}
	console.log(`[7]back\n`);

	let choice = question('> ');
	console.log();
	let pokemon;

	switch(choice){
		case '1':
			pokemon = player.party[0];
			break;
		case '2':
			pokemon = player.party[1];
			break;
		case '3':
			pokemon = player.party[2];
			break;
		case '4':
			pokemon = player.party[3];
			break;
		case '5':
			pokemon = player.party[4];
			break;
		case '6':
			pokemon = player.party[5];
			break;
		case '7':
			menu = 'Pchoose';
			break;
		default:
			console.log(`${choice} is not a valid party id.`);
			question('press enter');
			break;
	}

	if(pokemon != undefined && pokemon.id == poke1.id){
		console.log(`${pokemon.name} is already out!`);
		question('press enter');
	}
	else if(pokemon != undefined){
		poke1 = pokemon;
		player.is_switching = true;
		pokeChanged = true;
		attack1 = 'switching';
	}
}

function statusDamage(poke){
	//console.log(poke.status);
	if(poke.status == 'freeze'){
		let c = Random(99);
		if(c + 1 <= 10){
			poke.status = undefined;
			console.log(`${poke.name} thawed out!`);
			question('press enter\n');
		}
		else{
			console.log(`${poke.name} is frozen solid!`);
			question('press enter\n');
		}
	}
	if(poke.status == 'burn'){
		poke.stats.hp.current -= Math.floor(poke.stats.hp.value / 16);
		console.log(`${poke.name} was hurt by the burn!`);
		question('press enter\n');
	}
	if(poke.status == 'poison'){
		poke.stats.hp.current -= Math.floor(poke.stats.hp.value / 16);
		console.log(`${poke.name} was hurt by the poison!`);
		question('press enter\n');
	}
	if(poke.status == 'toxic'){
		poke.toxicCounter++;
		if(poke.toxicCounter > 15){
			poke.toxicCounter = 15;
		}
		
		//console.log(poke.stats.hp.current - (poke.toxicCounter * Math.floor(poke.stats.hp.value / 16)));
		//console.log(poke.toxicCounter);

		poke.stats.hp.current -= (poke.toxicCounter * Math.floor(poke.stats.hp.value / 16));
		console.log(`${poke.name} was hurt by the poison!`);
		question('press enter\n');
	}
	if(poke.status == 'sleep'){
		poke.counter--;
		if(poke.counter == 0){
			poke.status = undefined;
			console.log(`${poke.name} woke up!`);
			question('press enter\n');
		}
		else{
			console.log(`${poke.name} is fast asleep!`);
			question('press enter\n');
		}
	}
}

function sendPoke(poke, sender) {
	poke.stats.hp.current = poke.stats.hp.value;
	poke.stats.attack.current = poke.stats.attack.value;
	poke.stats.defense.current = poke.stats.defense.value;
	poke.stats.special.current = poke.stats.special.value;
	poke.stats.speed.current = poke.stats.speed.value;
	paralyzeCheckS(poke);
	burnCheckS(poke);
	poke.stats.hp.mod = 0;
	poke.stats.attack.mod = 0;
	poke.stats.defense.mod = 0;
	poke.stats.special.mod = 0;
	poke.stats.speed.mod = 0;
	poke.stats.accuracy.mod = 0;
	poke.stats.evasion.mod = 0;
	poke.volatile_status = false;
	poke.disabled = false;
	poke.flinched = false;
	poke.seeded = false;

	console.log(`${sender.name} sent out ${poke.name}.`);
	question('press enter\n');

	return poke;
}

function paralyzeCheckS(poke) {
	if (poke.status == 'paralyzed') {
		poke.stats.speed.current = Math.floor(poke.stats.speed.current * 0.25);
	}
}

function burnCheckS(poke) {
	if (poke.status == 'burn') {
		poke.stats.attack.current = Math.floor(poke.stats.attack.current * 0.5);
	}
}

function enemyChoice(poke) {
	let attackE;
	let num = Random(3);
	//attackE = poke.moves[num];
	attackE = moves.get('moves').find({ name: poke.moves[num] }).value();
	return attackE;
}

function ailmentCheck(user, target, move){
	if(move.meta.category == 'damage+ailment'){
		let chance = Random(99) + 1;

		if(chance < move.meta.ailment_chance){

			let words;
			switch(move.meta.ailment){
				case 'poison':
					if(move.name == 'toxic'){
						words = 'badly poisoned';
					}else{
						words = 'poisoned';
					}
					break;
				case 'paralysis':
					words = 'paralyzed';
					break;
				case 'burn':
					words = 'burned';
					break;
				case 'sleep':
					words = 'put to sleep';
					break;
				case 'freeze':
					words = 'frozen solid';
					break;
				case 'confusion':
					words = 'confused';
					break;
				case 'trap':
					words = 'trapped';
					break;
			}

			if(move.meta.ailment == 'paralysis' && target.status != 'paralysis'){
				target.stats.speed.current = Math.floor(target.stats.speed.current * 0.25);
			}
			if(move.meta.ailment == 'burn' && target.status != 'burn'){
				target.stats.attack.current = Math.floor(target.stats.attack.current * 0.5);
			}

			if(move.meta.ailment != 'confusion' && move.meta.ailment != 'trap'){
				target.status = move.meta.ailment;
			}
			else if(move.meta.ailment == 'confusion'){
				target.volatile_status = move.meta.ailment;
			}
			else if(move.meta.ailment == 'trap'){
				user.volatile_status = 'trap';
			}

			if(move.name == 'toxic'){
				target.status = 'toxic';
				target.toxicCounter = 0;
			}

			console.log(`${target.name} was ${words}!`);
			question('press enter\n');
		}
	}
}

function accuracyCalc(user, move, target) {

	let accuracy;

	if (move.name == 'dream-eater' && target.status != 'sleep') {
		return false;
	}
	if (move.name == 'swift') {
		return true;
	}
	if (target.volatile_status == 'fly' || target.volatile_status == 'underground') {
		return false;
	}
	if (target.mist != 0 && move.damage_class == 'status') {
		return false;
	}
	let mod;
	switch (user.stats.accuracy.mod) {
		case -6:
			mod = 0.25;
			break;
		case -5:
			mod = 0.28;
			break;
		case -4:
			mod = 0.33;
			break;
		case -3:
			mod = 0.4;
			break;
		case -2:
			mod = 0.5;
			break;
		case -1:
			mod = 0.66;
			break;
		case 0:
			mod = 1;
			break;
		case 1:
			mod = 1.5;
			break;
		case 2:
			mod = 2;
			break;
		case 3:
			mod = 2.5;
			break;
		case 4:
			mod = 3;
			break;
		case 5:
			mod = 3.5;
			break;
		case 6:
			mod = 4;
			break;
	}
	accuracy = move.accuracy * mod;
	switch (target.stats.evasion.mod) {
		case 6:
			mod = 0.25;
			break;
		case 5:
			mod = 0.28;
			break;
		case 4:
			mod = 0.33;
			break;
		case 3:
			mod = 0.4;
			break;
		case 2:
			mod = 0.5;
			break;
		case 1:
			mod = 0.66;
			break;
		case 0:
			mod = 1;
			break;
		case -1:
			mod = 1.5;
			break;
		case -2:
			mod = 2;
			break;
		case -3:
			mod = 2.5;
			break;
		case -4:
			mod = 3;
			break;
		case -5:
			mod = 3.5;
			break;
		case -6:
			mod = 4;
			break;
	}
	accuracy = accuracy * mod;
	//console.log(accuracy);

	if (accuracy > 255) {
		accuracy = 255;
	}
	if (accuracy < 1) {
		accuracy = 1;
	}

	let i = Random(255);
	if (i >= accuracy) {
		return false;
	}

	return true;
}







module.exports = {
	battle
}

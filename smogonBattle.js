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


let player;
let enemy;
let poke1;
let poke2;
let attack1;
let attack2;

let pokeChanged = false;
let battleType;

function battle(p, e) {
	console.clear();
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
		enemy.knocked_out = false;
	}

	while (player.knocked_out == false && enemy.knocked_out == false) {
		turnloop();
	}

	if (player.knocked_out) {
		console.log(`${player.name} has run out of pokemon!`);
		console.log(`Enemy ${enemy.name} wins!`);
	}

	if (enemy.knocked_out) {
		console.log(`Enemy ${enemy.name} has run out of pokemon!`);
		console.log(`${player.name} wins!`);
	}

}

function turnloop() {
	//console.log(player.knocked_out, enemy.knocked_out);
	//question('<><><><>');
	if (player.knocked_out || enemy.knocked_out) {
		return;
	}

	attack1 = undefined;
	attack2 = undefined;
	let F1;
	let F2;
	pokeChanged = false;
	while (attack1 == undefined) {
		attack1 = choiceloop(poke1);
	}
	//attack2;
	while (attack2 == undefined) {
		attack2 = enemyChoice(poke2);
	}

	let order = turnOrder(attack1, attack2);

	if (!player.switching && order[0].id == poke1.id && poke2.volatile_status.type != 'trap move' && poke1.status != 'sleep' && poke1.flinched != true && poke1.status != 'frozen') {

		pokeAttack(poke1, poke2, attack1);
		F2 = faintCheck(poke2);
		if (F2) {
			pokeChanged = true;
			F1 = faintCheck(poke1);
			if (F1) {
				poke1 = playerChange();
				if (poke1 == 'KO') {
					player.knocked_out = true;
					return;
				}
				else {
					poke1 = sendPoke(poke1, player);
				}
			}

			poke2 = enemyChange();
			//console.log(poke2);
			//question('<><><>1');
			if (poke2 == 'KO') {
				enemy.knocked_out = true;
				return;
			}
			else {
				poke2 = sendPoke(poke2, enemy);
			}
		}

		if (!pokeChanged) {
			pokeAttack(poke2, poke1, attack2);
		}
		F1 = faintCheck(poke1);
		if (F1) {
			F2 = faintCheck(poke2);
			if (F2) {
				poke2 = enemyChange();
				//console.log(poke2);
				//question('<><><>2');
				if (poke2 == 'KO') {
					enemy.knocked_out = true;
					return;
				}
				else {
					poke2 = sendPoke(poke2, enemy);
				}
			}

			poke1 = playerChange();
			if (poke1 == 'KO') {
				player.knocked_out = true;
				return;
			}
			else {
				poke1 = sendPoke(poke1, player);
			}

		}

	}
	else if (!enemy.is_switching && order[0].id == poke2.id && poke1.volatile_status.type != 'trap move' && poke2.last_move == undefined && poke2.status != 'sleep' && poke2.flinched != true && poke2.status != 'frozen') {

		pokeAttack(poke2, poke1, attack2);
		F1 = faintCheck(poke1);
		if (F1) {
			pokeChanged = true;
			F2 = faintCheck(poke2);
			if (F2) {
				poke2 = enemyChange();
				//console.log(poke2);
				//question('<><><>3');
				if (poke2 == 'KO') {
					enemy.knocked_out = true;
					return;
				}
				else {
					poke2 = sendPoke(poke2, enemy);
				}
			}

			poke1 = playerChange();
			if (poke1 == 'KO') {
				player.knocked_out = true;
				return;
			}
			else {
				poke1 = sendPoke(poke1, player);
			}
		}

		if (!pokeChanged) {
			pokeAttack(poke1, poke2, attack1);
		}
		F2 = faintCheck(poke2);
		if (F2) {
			F1 = faintCheck(poke1);
			if (F1) {
				poke1 = playerChange();
				if (poke1 == 'KO') {
					player.knocked_out = true;
					return;
				}
				else {
					poke1 = sendPoke(poke1, player);
				}

			}

			poke2 = enemyChange();
			//console.log(poke2);
			//question('<><><>4');
			if (poke2 == 'KO') {
				enemy.knocked_out = true;
				return;
			}
			else {
				poke2 = sendPoke(poke2, enemy);
			}
		}

	}

	player.is_switching = false;
	enemy.is_switching = false;

	//reset trap move status
	if (poke1.volatile_status != undefined && poke1.volatile_status.type == 'trap move') {
		if (poke1.volatile_status.increment == 0) {
			poke1.volatile_status = undefined;
		}
		else {
			poke1.volatile_status.increment--;
		}
	}
	if (poke2.volatile_status != undefined && poke2.volatile_status.type == 'trap move') {
		if (poke2.volatile_status.increment == 0) {
			poke2.volatile_status = undefined;
		}
		else {
			poke2.volatile_status.increment--;
		}
	}

	console.log(`${poke1.name}: ` + poke1.stats.hp.current);
	console.log(`Enemy ${poke2.name}: ` + poke2.stats.hp.current);
	question('press enter');

	turnloop();
}

function pokeAttack(user, target, move) {
	//console.log('>>>' + move.name);
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
				spe: user.stats.speed.iv
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
				spe: user.stats.speed.mods
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
				spe: target.stats.speed.iv
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
				spe: target.stats.speed.mods
			},
			status: target.status,
		}),
		new Move(gen, move.name),
	);

	let accuracy = accuracyCalc(user, move, target);
	//console.log(result);

	if (accuracy) {
		if (move.power != null) {
			target.stats.hp.current -= result.damage[Random(result.damage.length)];
			console.log(`${user.name} used ${move.name}.`);
			question('press enter\n');

		}
		if (move.damage_class == 'status') {
			console.log(`${user.name} used ${move.name}.`);
			for (let i = 0; move.stat_changes[i] != undefined; i++) {
				if (move.stat_changes[i].mod < 0) {
					eval(`target.stats.${move.stat_changes[i].stat}.mod = ${move.stat_changes[i].change};`);
				}
				else {
					eval(`user.stats.${move.stat_changes[i].stat}.mod = ${move.stat_changes[i].change};`);
				}

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
			question('press enter\n');
		}
	}
	else {
		console.log(`${user.name} missed!`);
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
	poke.volatile_status = false;
	poke.disabled = false;
	poke.flinched = false;
	poke.seeded = false;
	poke.confused = false;

	console.log(`${sender.name} sent out ${poke.name}.`);
	question('press enter\n');

	return poke;
}

function choiceloop() {
	console.clear();
	let attack;

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
			attackC();
			break;

		case '2':
			ps = switchC();
			poke1 = ps;
			player.switching = true;
			pokeChanged = true;
			return;
			break;

		case '3':
			itemsC();
			break;

		case '4':
			if (battleType == 'trainer') {
				console.log("\nThere is no running from a trainer battle!");
				question('press enter');
				choiceloop();
			}
			break;

		default:
			console.log(`\n${turn} is not a valid option, please input a listed number.`);
			question('press enter');
			choiceloop();
			break;

	}

	function attackC() {
		console.clear();
		console.log();
		console.log("[1]" + poke1.moves[0]);
		console.log("[2]" + poke1.moves[1]);
		console.log("[3]" + poke1.moves[2]);
		console.log("[4]" + poke1.moves[3]);
		console.log("[5]back")
		//console.log(poke1);
		let attackChoice = question('> ');

		switch (attackChoice) {
			case '1':
				attack = moves.get('moves').find({ name: poke1.moves[0] }).value();
				break;
			case '2':
				attack = moves.get('moves').find({ name: poke1.moves[1] }).value();
				break;
			case '3':
				attack = moves.get('moves').find({ name: poke1.moves[2] }).value();
				break;
			case '4':
				attack = moves.get('moves').find({ name: poke1.moves[3] }).value();
				break;
			case '5':
				choiceloop();
				//return;
				break;
			default:
				console.log(`\n${turn} is not a valid option, please input a listed number.`);
				question('press enter');
				attackC();
				break;
		}

		if (attack == undefined) {
			attackC();
			return;
		}
	}

	return attack;
}

function enemyChoice(poke) {
	let attackE;
	let num = Random(3);
	//attackE = poke.moves[num];
	attackE = moves.get('moves').find({ name: poke.moves[num] }).value();
	return attackE;
}

function turnOrder() {
	let first;
	let second;

	let priority_move = false;

	if (!player.is_switching && !enemy.is_switching) {
		if (attack1.name == 'quick attack' && attack2.name != 'quick attack') {
			first = poke1;
			second = poke2;
			priority_move = true;
		}
		else if (attack2.name == 'quick attack' && attack1.name != 'quick attack') {
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
		first = poke1;
		second = poke2;
	}
	else {
		if (enemy.is_switching) {
			first = poke2;
			second = poke1
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
		case 0:
			mod = 1;
			break;
	}
	accuracy = move.accuracy * mod;
	switch (target.stats.evasion.mod) {
		case 0:
			mod = -1;
			break;
	}
	accuracy = accuracy * (mod * -1);
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

function faintCheck(poke) {
	if (poke.stats.hp.current <= 0) {
		poke.stats.hp.current = 0;
		console.log(`${poke.name} has fainted!`);
		question('press enter');
		return true;
	}
	else return false;
}

function playerChange() {
	console.clear();
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
				playerChange();
				break;
		}

		if (pokemon == undefined || pokemon.stats.hp.current <= 0) {
			console.log(`There is either no pokemon in party slot ${pokeSend}, or that pokemon has already fainted.`);
			question('press enter');
			playerChange();
		}

		return pokemon;
	}
	else {
		return 'KO';
	}
}

function switchC() {
	let p;
	for (let i = 0; player.party[i] != undefined; i++) {
		p = player.party[i];
		console.log(`[${i + 1}]${p.name} - ${p.stats.hp.current}/${p.stats.hp.value}`);
	}

	console.log('[7]back');

	let pokeSendC = question('>');
	let pokemon = poke1;

	switch (pokeSendC) {
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
			choiceloop();
			break;
		default:
			console.log(`${pokeSendC} is not a valid party id.`);
			question('press enter');
			switchC();
			break;
	}

	return pokemon;
}

function enemyChange() {
	let found = false;
	for (let i = 0; enemy.party[i] != undefined; i++) {
		//console.log(enemy.party[i].stats.hp.current);
		if (enemy.party[i].stats.hp.current > 0) {
			found = true;
		}
	}
	//question('<<<<<<<<')

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



module.exports = {
	battle
}
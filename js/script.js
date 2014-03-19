/*!
 * Whitechapel
 * Letters to Whitechapel (by Gabriele Mari and Gianluca Santopietro) board game simulation.
 * by David Apple
 * @davidappleremix
 */

/* Start
   ----- */

console.log('Choose a start map ID for Jack. jack = start(3) for example.');

function start(mapID) {
	var character = new Array();
	character.route = new Array();
	character.route.push([mapID]);
	console.log('Start position chosen. Create list of possible routes, type jack = route.extensive(jack, ID)');
	return character;
}

/* Game
   ---- */

var game = {
	config: {
		// base: ?,
		state: 0,
		remainingMoves: 19,
		lanterns: 3,
		carriages: 3,
	},
	init: function(state) {
		if (state == 0) {
			// Unbind the map
			// Perform Jack's actions
			// Instruct users to click the map
			// Bind map to recieve desired data
		}
	}
}

/* Move
   ---- */

var move = {
	id: function(r) {
		var newRoutes = new Array();
		var counter = 0;
		for (a = 0; a < r.length; a++) { // For every route
			var lastOne = r[a][r[a].length - 1] // Find the last position
			for (b = 0; b < map[lastOne].adjacent.length; b++) { // For every place adjacent to the last one
				var p = true; // Assume it's a new place until you check
				amnesia:
				for (c = (r[a].length - 1); c >= 0; c--) { // For every place traveled so far in reverse
					if (map[lastOne].adjacent[b] == r[a][c]) { // If the next move is the same as a previous one
						p = false; // Remember that it's not a new place
					}
					if (route.config.amnesia && map[r[a][c]].number != undefined) break amnesia; // Forget everything before the previous number
				}
				if (p) { // If the adjacent place is brand new
					newRoutes[counter] = new Array(); // Create a new route starting from zero
					for (c = 0; c < r[a].length; c++) { // For every place travelled so far
						newRoutes[counter].push(r[a][c]); // Add that to the new route sequentially
					}
					newRoutes[counter].push(map[lastOne].adjacent[b]); // Append the adjacent places to the end
					counter++;
				}
			}
		}
		return newRoutes;
	},
	number: function(r) {
		var newRoutes = new Array();
		newRoutes.route = new Array();
		while (r.route[0] != undefined) {
			r.route = move.id(r.route);
			var totalRoutes = r.route.length;
			var spliceList = new Array();
			for (a = 0; a < totalRoutes; a++) { // For every route
				if (map[r.route[a][r.route[a].length - 1]].number != undefined) { // If the last position contains a number
					newRoutes.route.push(r.route[a]); // Add the route to a list of possible next moves
					spliceList.push(a);
				}
			}
			var counter = 0;
			for (a = 0; a < spliceList.length; a++) { // For every route to splice
				r.route.splice(spliceList[a] - counter, 1); // Destroy this route
				counter++;
			}
		}
		return newRoutes;
	},
	lantern: function(r) {
		var newRoutes = new Array(); // Create a new route array
		// Return all possible routes via lanterns
	},
}

/* Route
   ----- */

var route = {
	config: {
		amnesia: true, // Can Jack double back on himself, visit the same space multiple times?
		canPassBase: true, // Can Jack travel past his base?
	},
	shortest: function(r, base) {
		var newRoutes = new Array();
		search:
		while (true) {
			r = move.number(r);
			for (a = 0; a < r.route.length; a++) { // For every route
				if (r.route[a][r.route[a].length - 1] == base) { // If the last position is the base
					newRoutes.push(r.route[a]);
					break search;
				}
			}
		}
		return newRoutes;
	},
}

 /* Draw
   ----- */

for (a = 0; a < map.length; a++) {
	if (map[a].position != undefined) {
		if (map[a].number != undefined) {
			$('<span></span>', {
				class: 'label label-primary location-number location-' + a,
				text: a,
				style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
			}).prependTo('.map');
		} else {
			$('<span></span>', {
				class: 'label label-default location location-' + a,
				text: a,
				style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
			}).prependTo('.map');
		}
	}
}
$('<h1></h1>', {
	text: state[game.config.state].title,
}).prependTo('.container');
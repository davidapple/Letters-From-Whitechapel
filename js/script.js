console.log('Choose a start map ID for Jack. start(jack, 3) for example.');

var jack = new Array();
jack.route = new Array();

function start(character, mapID) {
	character.route.push([mapID]);
	console.log('Start position chosen. Create list of possible routes, type jack.route = route.id(jack.route, ID)');
}

var move = {
	id: function(r) {
		var newRoutes = new Array(); // Create a new route array
		var counter = 0; // Start counting from zero
		for (a = 0; a < r.length; a++) { // For every route
			var lastOne = r[a][r[a].length - 1] // Find the last position
			for (b = 0; b < map[lastOne].adjacent.length; b++) { // For every place adjacent to the last one
				var p = true; // Assume it's a new place until you check
				for (c = 0; c < r[a].length; c++) { // For every place traveled so far
					if (map[lastOne].adjacent[b] == r[a][c]) { // If the next move is the same as a previous one
						p = false; // Remember that it's not a new place
					}
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
		var newRoutes = new Array(); // Create a new route array
		var numberList = new Array();
		while (r[0] != undefined) {
			r = move.id(r);
			var totalRoutes = r.length;
			var spliceList = new Array();
			for (a = 0; a < totalRoutes; a++) { // For every route
				if (r[a] != undefined) { // If it exists
					if (map[r[a][r[a].length - 1]].number != undefined) { // If the last position contains a number
						var newNumber = true;
						for (c = 0; c < numberList.length; c++) { // For every number recorded
							if (numberList[c] == map[r[a][r[a].length - 1]]) { // If the number has been recorded already
								newNumber = false;
							}
						}
						if (newNumber) {
							numberList.push(map[r[a][r[a].length - 1]]);
							newRoutes.push(r[a]); // Add the route to a list of possible next moves
						}
						spliceList.push(a);
					}
				}
			}
			var counter = 0;
			for (a = 0; a < spliceList.length; a++) { // For every route to splice
				r.splice(spliceList[a] - counter, 1); // Destroy this route
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

var route = {
	config: {
		amnesia: false, // Can Jack double back on himself, visit the same space multiple times?
		canPassBase: true, // Can Jack travel past his base?
		remainingMoves: 19,
		lanterns: 3,
		carriages: 3
	},
	extensive: function(r, base) {
		var newRoutes = new Array(); // Create a new route array
		var counter = 0; // Start counting from zero
		var spliceList = new Array();
		var isComplete = false;
		while (!isComplete) {
			counter++;
			r.route = move.number(r.route);
			for (a = 0; a < r.route.length; a++) { // For every route
				if (r.route[a] != undefined) { // If it exists
					if (r.route[a][r.route[a].length - 1] == base) { // If the last position is the base
						console.log('Number of numbers passed = ' + counter); console.log(r.route[a]);
						newRoutes.push(r.route[a]);
						if (counter >= route.config.remainingMoves) {
							isComplete = true;
						}
						spliceList.push(a);
					}
				}
			}
			var spliceCounter = 0;
			for (a = 0; a < spliceList.length; a++) { // For every route to splice
				r.route.splice(spliceList[a] - spliceCounter, 1); // Destroy this route
				spliceCounter++;
			}
		}
		return newRoutes;
	},
}
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
	character.alley = new Array(); // Used to enduce route amnesia
	character.alley.push([mapID]);
	console.log('Start position chosen. Create list of possible routes, type jack = route.extensive(jack, ID)');
	return character;
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
	number: {
		explore: function(r) {
			var newRoutes = new Array();
			newRoutes.route = new Array();
			var numberList = new Array();
			while (r.route[0] != undefined) {
				r.route = move.id(r.route);
				var totalRoutes = r.route.length;
				var spliceList = new Array();
				for (a = 0; a < totalRoutes; a++) { // For every route
					if (map[r.route[a][r.route[a].length - 1]].number != undefined) { // If the last position contains a number
						var newNumber = true;
						for (c = 0; c < numberList.length; c++) { // For every number recorded
							if (numberList[c] == r.route[a][r.route[a].length - 1]) { // If the number has been recorded already
								newNumber = false;
							}
						}
						if (newNumber) {
							numberList.push(r.route[a][r.route[a].length - 1]);
							newRoutes.route.push(r.route[a]); // Add the route to a list of possible next moves
						}
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
		/* No no no
		exhaust: function(r) {
			var newRoutes = new Array();
			newRoutes.alley = new Array();
			var numberList = new Array();
			while (r.alley[0] != undefined) {
				r.alley = move.id(r.alley);
				var totalalleys = r.alley.length;
				var spliceList = new Array();
				for (a = 0; a < totalalleys; a++) { // For every alley
					if (map[r.alley[a][r.alley[a].length - 1]].number != undefined) { // If the last position contains a number
						var newNumber = true;
						for (c = 0; c < numberList.length; c++) { // For every number recorded
							if (numberList[c] == r.alley[a][r.alley[a].length - 1]) { // If the number has been recorded already
								newNumber = false;
							}
						}
						if (newNumber) {
							numberList.push(r.alley[a][r.alley[a].length - 1]);
							newRoutes.alley.push(r.alley[a]); // Add the alley to a list of possible next moves
						}
						spliceList.push(a);
					}
				}
				var counter = 0;
				for (a = 0; a < spliceList.length; a++) { // For every alley to splice
					r.alley.splice(spliceList[a] - counter, 1); // Destroy this alley
					counter++;
				}
			}
			return newRoutes;
		},
		*/
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
		amnesia: false, // Can Jack double back on himself, visit the same space multiple times?
		canPassBase: true, // Can Jack travel past his base?
		remainingMoves: 19,
		lanterns: 3,
		carriages: 3
	},
	shortest: function(r, base) {
		var newRoutes = new Array();
		var counter = 0;
		var isComplete = false;
		while (!isComplete) {
			counter++;
			r = move.number.explore(r);
			for (a = 0; a < r.route.length; a++) { // For every route
				if (r.route[a][r.route[a].length - 1] == base) { // If the last position is the base
					console.log('Number of numbers passed = ' + counter); console.log(r.route[a]);
					newRoutes.push(r.route[a]);
					isComplete = true;
				}
			}
		}
		return newRoutes;
	},
	extensive: function(r, base) {
		var newRoutes = new Array();
		var counter = 0;
		var isComplete = false;
		while (!isComplete) {
			counter++;
			if (route.config.amnesia) {
				/* This is seriously doing my head in
				for (a = 0; a < r.route.length; a++) { // For every route
					var numberedIDPositions = new Array();
					for (b = 0; b < r.route[a].length; b++) { // For every position
						if (map[r.route[a][b]].number != undefined) { // If the ID is numbered
							numberedIDPositions.push(b); // List all of the numbers
						}
					}
					var dummyCharacter = new Array();
					dummyCharacter.route = new Array();
					dummyCharacter.route.push(r.route[a].slice(numberedIDPositions[numberedIDPositions.length - 1])); // Crop the end off the route
					dummyCharacter = move.number.explore(dummyCharacter); // Advance this alley
					for (b = 0; b < dummyCharacter.route.length; b++) { // For every route
						dummyCharacter.route[b].splice(0, 0, r.route[a]); // Push the alleys back onto the routes
					}
					r.route = dummyCharacter.route;
					console.log(dummyCharacter);
					*/
				}
			} else {
				r = move.number.explore(r);
			}
			for (a = 0; a < r.route.length; a++) { // For every route
				if (r.route[a][r.route[a].length - 1] == base) { // If the last position is the base
					console.log('Number of numbers passed = ' + counter); console.log(r.route[a]);
					newRoutes.push(r.route[a]);
				}
			}
			if (counter >= route.config.remainingMoves) {
				isComplete = true;
			}
		}
		return newRoutes;
	},
}
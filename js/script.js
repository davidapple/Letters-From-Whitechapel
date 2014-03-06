console.log('Choose a start map ID for Jack. start(character[0], 3) for example.');

var character = new Array();
character[0] = new Array();
// charater[0].position is a single number set later on
character[0].routes = new Array();

function start(character, mapID) {
	character.position = mapID;
	character.routes.push([mapID]);
	console.log('Start position chosen. Create list of possible move IDs, type possibleMovesByID(true)');
}

function adjacentIDs() {
	var counter = 0; // Start counting from zero
	var newRoutes = new Array(); // Create a new route array
	for (a = 0; a < character[0].routes.length; a++) { // For every route
		var lastOne = character[0].routes[a][character[0].routes[a].length - 1] // Find the last position
		for (b = 0; b < map[lastOne].adjacent.length; b++) { // For every place adjacent to the last one
			if (isNewID(a, b, lastOne)) { // If the adjacent place is brand new
				newRoutes[counter] = new Array(); // Create a new route starting from zero
				for (c = 0; c < character[0].routes[a].length; c++) { // For every place travelled so far
					newRoutes[counter].push(character[0].routes[a][c]); // Add that to the new route sequentially
				}
				newRoutes[counter].push(map[lastOne].adjacent[b]); // Append the adjacent places to the end
				counter++;
			}
		}
	}
	return newRoutes;
};

function isNewID(a, b, lastOne) { // Test if the next place has been visited already, return true or false
	var p = true; // Assume it's a new place until you check
	for (c = 0; c < character[0].routes[a].length; c++) { // For every place traveled so far
		if (map[lastOne].adjacent[b] == character[0].routes[a][c]) { // If the next move is the same as a previous one
			p = false; // Remember that it's not a new place
		}
	}
	return p;
}

function destroyShortRoutes(r) {
	var counter = 0; // Start counting from zero (how many routes are too short)
	var longestRoute = r[r.length - 1].length; // Find the length of the last (and therefore longest) route

	for (a = 0; a < r.length; a++) { // For each route
		if (r[a].length < longestRoute) { // If it's shorter than the longest
			counter++; // Add one to the counter
			// r = r.shift() // Annoyingly, this doesn't work
		}
	}
	var desiredRoutes = r.length - counter; // Total routes minus routes that are too short equals number of desired routes
	var recompileRoutes = new Array(); // Annoyingly, the desired routes need to me recompiled into a new array, shift() doesn't work
	for (b = 0; b < desiredRoutes; b++) { // For all desired routes
		recompileRoutes[b] = r.pop(); // Get the last route of the routes array and save it to the start of the recompiled routes array
	}
	recompileRoutes.reverse(); // Reverse the routes back into the correct order
	return recompileRoutes;
}

function possibleMovesByID() {
	var tempRoutes = new Array(); // Create a temporary array
	tempRoutes = adjacentIDs(); // Save new routes to temporary array
	for (a = 0; a < tempRoutes.length; a++) { // For every new route
		character[0].routes.push(tempRoutes[a]); // Append it to the master routes list
	}
	if (character[0].routes[0] != undefined) { // If routes still exist (added because of error caused by possibleMovesByNumber)
		character[0].routes = destroyShortRoutes(character[0].routes);
		console.log('List of possible routes updated: character[0].routes');
	}
}

function possibleMovesByNumber() {
	var numberList = new Array();
	var adjacentNumbers = new Array();
	while (character[0].routes[0] != undefined) {
		possibleMovesByID();
		var totalRoutes = character[0].routes.length;
		var spliceList = new Array();
		for (a = 0; a < totalRoutes; a++) { // For every route
			if (character[0].routes[a] != undefined) { // If it exists
				for (b = 1; b < character[0].routes[a].length; b++) { // For every position (ignoring the first one)
					if (map[character[0].routes[a][b]].number != undefined) { // If it contains a number
						var newNumber = true;
						for (c = 0; c < numberList.length; c++) { // For every number recorded
							if (numberList[c] == map[character[0].routes[a][b]]) { // If the number has been recorded already
								newNumber = false;
							}
						}
						if (newNumber) {
							numberList.push(map[character[0].routes[a][b]]);
							console.log(map[character[0].routes[a][b]].number);
							adjacentNumbers.push(character[0].routes[a]); // Add the route to a list of possible next moves
						}
						spliceList.push(a);
					}
				}
			}
		}
		var spliceCounter = 0;
		for (a = 0; a < spliceList.length; a++) { // For every route to splice
			character[0].routes.splice(spliceList[a] - spliceCounter, 1); // Destroy this route
			spliceCounter++;
		}
	}
	character[0].routes = adjacentNumbers;
	return adjacentNumbers;
}
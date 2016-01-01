/*!
 * w
 * by David Apple
 * @davidappleremix
 */

/* Jack
   ---- */

var jack = new Array();

/* Police
   ------ */

var police = new Array();

/* Game
   ---- */
var game = {
	config: {
		state: 0,
		totalMoves: 20,
		remainingMoves: 15,
		lanterns: 3,
		carriages: 3,
		women: 8,
		wretched: 4,
		police: 5,
		fakePolice: 2,
		womenMarked: new Array(),
		womenUnmarked: new Array(),
	},
	nextState: function(x) {
		if (x) {
			game.config.state = x;
		}
		$('.state').hide();
		draw.updateTitle();
		switch(game.config.state) {
			case 0:
				game.preparingTheScene();
			break;
			case 1:
				game.theTargetsAreIdentified();
			break;
			case 2:
				game.patrollingTheStreets();
			break;
			case 4:
				game.bloodOnTheStreets();
			break;
			case 5:
				game.suspenseGrows();
			break;
			case 8:
				game.alarmWhistles();
			break;
			case 9:
				game.escapeTheNight();
			break;
			case 10:
				game.huntingTheMonster();
			break;
			case 11:
				game.cluesAndSuspicion();
			break;
		}
	},
	preparingTheScene: function () {
		// TODO: Update carrages and lanterns
		$('<p></p>', {
			text: 'Jack collects the special movement tokens (' + game.config.carriages + ' carriages and ' + game.config.lanterns + ' lanterns).'
		}).prependTo('.preparing-the-scene');
		jack[jack.length] = { // New night
			route: new Array(),
			murder: new Array(),
			murderMove: new Array()
		}
		police[police.length] = {
			fake: new Array(),
			start: new Array(),
			revealed: new Array(),
			route: new Array(),
			now: new Array(),
			search: new Array(), // How many adjacent numbers are searchable (or arrestable)
			clue: new Array()
		}
		game.nextState(1);
	},
	theTargetsAreIdentified: function () {
		var mapMurders = map.key('murder');
		while (game.config.womenMarked.length < game.config.wretched) { 
			var index = game.randomInt(0, mapMurders.length);
			game.config.womenMarked.push(mapMurders[index]); // Randomly select wreched
			mapMurders.splice(index, 1); // Prevent possibility of choosing duplicate locations
		}
		while (game.config.womenUnmarked.length < (game.config.women - game.config.wretched)) {
			var index = game.randomInt(0, mapMurders.length);
			game.config.womenUnmarked.push(mapMurders[index]); // Randomly select unmarked women
			mapMurders.splice(index, 1); // Prevent possibility of choosing duplicate locations
		}
		game.nextState(2);
	},
	patrollingTheStreets: function () {
		$('.patrolling-the-streets').show();
		$('.patrolling-the-streets .next-state').hide();
		$('<p></p>', {
			text: 'The head of the investigation places ' + game.config.police + ' police patrol tokens and ' + game.config.fakePolice + ' fake police tokens on the map.'
		}).prependTo('.state.patrolling-the-streets');
		for (a = 0; a < map.length; a++) {
			if (($.inArray(a, game.config.womenMarked) !== -1) || ($.inArray(a, game.config.womenUnmarked) !== -1)) {
				var classes = 'label label-info token token-woman token-woman-' + a;
				draw.createElement(a, 'woman', classes).appendTo('.map');
			}
			if (map[a].station) {
				var classes = 'label label-info selectable token token-police marked token-police-' + a;
				draw.createElement(a, 'police', classes).appendTo('.map');
				classes = 'label label-info selectable token token-police unmarked token-police-' + a;
				draw.createElement(a, 'not police', classes).appendTo('.map');
			}
		}
		$('.token-police').click(function(){
			var mapid = $(this).data('mapid');
			if ($(this).hasClass('marked')) {
				if ($(this).hasClass('selected')) {
					$(this).removeClass('selected');
					_.last(police).start = _.without(_.last(police).start, mapid); // Splice the mapid
				} else {
					if (_.last(police).start.length < game.config.police) {
						$(this).addClass('selected');
						_.last(police).start.push(mapid);
						if ($(this).next().hasClass('selected')) {
							$(this).next().removeClass('selected');
							_.last(police).fake = _.without(_.last(police).fake, mapid);
						}
					}
				}
			}
			if ($(this).hasClass('unmarked')) {
				if ($(this).hasClass('selected')) {
					$(this).removeClass('selected');
					_.last(police).fake = _.without(_.last(police).fake, mapid);
				} else {
					if (_.last(police).fake.length < game.config.fakePolice) {
						$(this).addClass('selected');
						_.last(police).fake.push(mapid);
						if ($(this).prev().hasClass('selected')) {
							$(this).prev().removeClass('selected');
							_.last(police).start = _.without(_.last(police).start, mapid);
						}
					}
				}
			}
			if (_.last(police).start.length >= game.config.police && _.last(police).fake.length >= game.config.fakePolice) {
				$('.token-woman').remove();
				$('.token-police').remove();
				game.nextState(4);
			}
		});
	},
	bloodOnTheStreets: function () {
		$('<p></p>', {
			text: 'Jack chooses between killing or waiting.'
		}).prependTo('state.blood-on-the-streets');

		if (jack[jack.length - 1].route.length == 0) {
			if (game.config.totalMoves > game.config.remainingMoves) { // If Jack has enough moves to reveal a police token
				var randomIndex = Math.random(); // Jack chooses between killing or waiting based on the toss of a coin
				if (randomIndex > 0.5) {
					game.config.remainingMoves++;
					game.revealPolice();
					game.nextState(5);
				} else {
					game.murder();
					game.config.remainingMoves--;
					$('.token-police').remove();
					game.nextState(8);
				}
			} else { // Forced to murder
				game.murder();
				game.config.remainingMoves--;
				$('.token-police').remove();
				game.nextState(8);
			}
		} else {
			console.log('Error: Multiple murders attempted.');
		}
	},
	suspenseGrows: function() {
		$('.suspense-grows').show();
		if ($.inArray(_.last(_.last(police).revealed), _.last(police).fake) !== -1) {
			$('<p></p>', {
				text: 'Jack has discovered that a police token is not real.'
			}).prependTo('.state.suspense-grows');
		}

		var movedWretched = 0;

		// Move the time of crime token back
		var availableMoves = game.config.totalMoves - game.config.remainingMoves + 1;
		$('.move-tracker p span').removeClass('active');
		$('.move-tracker p span:nth-child(' + availableMoves + ')').addClass('active');

		for (a = 0; a < map.length; a++) {
			if ($.inArray(a, game.config.womenMarked) !== -1) {
				var classes = 'label label-info selectable token token-wretched token-wretched-' + a;
				draw.createElement(a, 'wretched', classes).appendTo('.map');
			}
			if ($.inArray(a, _.last(police).revealed) !== -1) {
				if ($.inArray(a, _.last(police).start) !== -1) {
					var classes = 'label label-info revealed token token-police token-police-' + a;
					draw.createElement(a, 'real police', classes).appendTo('.map');
				}
			} else {
				if (($.inArray(a, _.last(police).start) !== -1) || ($.inArray(a, _.last(police).fake) !== -1)) {
					var classes = 'label label-info token token-police token-police-' + a;
					draw.createElement(a, 'police', classes).appendTo('.map');
				}
			}
		}
		$('.token-wretched').click(function(){
			var mapid = $(this).data('mapid');

			// Cannot move wretched adjacent to a police token
			var allPolice = _.union(_.last(police).start, _.last(police).fake);
			var illegalMoves = _.map(allPolice, function(num, key) {
				// But revealed police that are unmarked are fine
				if (!(_.contains(_.intersection(_.last(police).revealed, _.last(police).fake), num))) {
					return map[num].adjacent;
				}
			});
			// Also cannot move wretched on top of another wretched
			illegalMoves.push(game.config.womenMarked);

			// TODO: Wretched tokens cannot move past police tokens or on crime scene markers

			illegalMoves = _.flatten(illegalMoves);

			for (b = 0; b < map[mapid].adjacentNumber.length; b++) {
				if ($.inArray(map[mapid].adjacentNumber[b], illegalMoves) == -1) {
					var classes = 'label label-info selectable token token-move-wretched token-wretched-' + map[mapid].adjacentNumber[b];
					draw.createElement(map[mapid].adjacentNumber[b], 'move here', classes).data('mapidPrev', mapid).click(function(){
						var index = game.config.womenMarked.indexOf(mapid); // Find previous map id in array
						if (index !== -1) {
							game.config.womenMarked[index] = $(this).data('mapid'); // Replace map id in array with new location
						}
						$(this).removeClass('selectable token-move-wretched').addClass('token-wretched').text('wretched').unbind('click');
						$('.token-move-wretched').remove();
						movedWretched++;
						if (movedWretched >= game.config.wretched) {
							$('.token-wretched').remove();
							game.nextState(4);
						}
					}).appendTo('.map');
				}
			}
			$('.token-wretched-' + mapid).remove();
		});
	},
	alarmWhistles: function () {
		_.last(police).route = _.map(_.last(police).start, function (mapid) { // Setup police to move
			_.last(police).now.push(mapid);
			return [mapid];
		});
		game.nextState(9);
	},
	escapeTheNight: function () {
		jack[jack.length - 1].route.push(jack.move()); // Jack's first move
		
		// Announce the end of the night (but not too early)
		if (_.last(jack).route.length > 5) {
			if (_.last(_.last(jack).route) == game.config.base) {
				console.log('Jack has reached his base.')
			}
		}
		
		$('.move-tracker p span:nth-child(' + _.last(jack).murderMove[_.last(jack).murderMove.length - 1] + ')').addClass('murder');
		var availableMoves = game.config.totalMoves - game.config.remainingMoves + 1;
		$('.move-tracker p span').removeClass('active');
		$('.move-tracker p span:nth-child(' + availableMoves + ')').addClass('active');
		game.nextState(10);
	},
	huntingTheMonster: function () {
		$('.hunting-the-monster').show();
		$('.hunting-the-monster .next-state').hide();
		$('<p></p>', {
			text: 'Each policeman pawn moves.'
		}).prependTo('.state.hunting-the-monster');

		var movedPolice = 0;
		var policeCounter = 0;
		for (a = 0; a < map.length; a++) {
			if ($.inArray(a, _.last(police).now) !== -1) {
				var classes = 'label label-info selectable revealed token token-police police-' + policeCounter + ' token-police-' + a;
				draw.createElement(a, 'police', classes).appendTo('.map');
				policeCounter++;
			}
			if (a == _.last(jack).murder[_.last(jack).murder.length - 1]) {
				var classes = 'label label-info token token-murder token-murder-' + a;
				draw.createElement(a, 'murder', classes).appendTo('.map');
			}
		}
		$('.token-police').click(function(){
			var mapid = $(this).data('mapid');
			var twoSteps = game.twoSteps(mapid);

			for (b = 0; b < twoSteps.length; b++) {
				if ($.inArray(twoSteps[b], _.last(police).now) == -1) {
					var classes = 'label label-info selectable token token-move-police token-police-' + twoSteps[b];
					draw.createElement(twoSteps[b], 'move here', classes).data('mapidPrev', mapid).click(function(){
						var index = _.last(police).now.indexOf($(this).data('mapidPrev')); // Find previous map id in array
						var mapid = $(this).data('mapid');
						if (index !== -1) {
							police[police.length - 1].route[index].push(mapid);
							police[police.length - 1].now[index] = mapid;
						}
						$(this).removeClass('selectable token-move-police').addClass('token-police').text('real police').unbind('click');
						$('.token-move-police').remove();
						movedPolice++;
						if (movedPolice >= _.last(police).now.length) {
							$('.token-police').remove();
							game.nextState(11);
						}
					}).appendTo('.map');
				}
			}
			$('.token-police-' + mapid).remove();

			var classes = 'label label-info selectable token token-move-police token-police-' + mapid;
			draw.createElement(mapid, 'don\'t move', classes).data('mapidPrev', mapid).click(function(){
				var index = _.last(police).now.indexOf(mapid); // Find previous map id in array
				if (index !== -1) {
					police[police.length - 1].route[index].push($(this).data('mapid'));
				}
				$(this).removeClass('selectable token-move-police').addClass('token-police').text('real police').unbind('click');
				$('.token-move-police').remove();
				movedPolice++;
				if (movedPolice >= _.last(police).now.length) {
					$('.token-police').remove();
					game.nextState(11);
				}
			}).appendTo('.map');
		});
	},
	cluesAndSuspicion: function () {
		$('.clues-and-suspicion').show();
		$('.clues-and-suspicion .next-state').hide();

		$('<p></p>', {
			text: 'Each policeman pawn either looks for clues or executes an arrest.'
		}).prependTo('.clues-and-suspicion');

		var movedPolice = 0;
		var completePolice = 0;

		_.last(police).search = _.map(_.last(police).now, function (mapid) {
			return game.searchable(mapid);
		});

		for (a = 0; a < map.length; a++) {
			if ($.inArray(a, _.last(police).now) !== -1) {
				var classes = 'label label-info selectable token token-search-adjacent token-search-adjacent-' + a;
				draw.createElement(a, 'search', classes).appendTo('.map');
				classes = 'label label-info selectable token token-arrest-adjacent token-arrest-adjacent-' + a;
				draw.createElement(a, 'arrest', classes).appendTo('.map');

			}
			if ($.inArray(a, _.last(jack).murder[_.last(jack).murder.length - 1]) !== -1) {
				var classes = 'label label-info token token-murder token-murder-' + a;
				draw.createElement(a, 'murder', classes).appendTo('.map');
			}
		}
		$('.token-arrest-adjacent').click(function(){
			var mapid = $(this).data('mapid');
			var index = _.indexOf(_.last(police).now, mapid);

			for (b = 0; b < _.last(police).search[index].length; b++) {
				var classes = 'label label-info selectable token token-arrest';
				draw.createElement(_.last(police).search[index][b], 'arrest', classes).click(function(){
					var mapid = $(this).data('mapid');
					if (mapid == _.last(jack).route[_.last(jack).route.length - 1]) {
						console.log('Jack has been arrested.');
					} else {
						console.log('Jack has not been arrested.');
					}
					$('.token-arrest').remove();
					_.last(police).search[index] = undefined;
					if (_.isEmpty(_.compact(_.flatten(_.last(police).search)))) {
						$('.token.selectable').remove();
						game.config.remainingMoves--;
						game.nextState(9);
					}
				}).appendTo('.map');
			}
			$(this).prev().remove();
			$(this).remove();
		});
		$('.token-search-adjacent').click(function(){
			var mapid = $(this).data('mapid');
			var index = _.indexOf(_.last(police).now, mapid);

			for (b = 0; b < _.last(police).search[index].length; b++) {
				var classes = 'label label-info selectable token token-search token-search-' + a;
				draw.createElement(_.last(police).search[index][b], 'search', classes).click(function(){
					var mapidAdjacent = $(this).data('mapid');
					if ($.inArray(mapidAdjacent, _.last(jack).route) !== -1) {
						console.log('Clue found at ' + map[mapidAdjacent].number + '.');
						$('.token-search').remove();
						_.last(police).search[index] = undefined;
						_.last(police).clue.push(mapidAdjacent);
						map[mapidAdjacent].clue = true;
						draw.map();
					} else {
						console.log('No clue found.');
						$(this).remove();
						_.last(police).search[index][_.indexOf(_.last(police).search[index], mapidAdjacent)] = undefined;
					}
					if (_.isEmpty(_.compact(_.flatten(_.last(police).search)))) {
						$('.token.selectable').remove();
						game.config.remainingMoves--;
						game.nextState(9);
					}
				}).appendTo('.map');
			}
			$(this).next().remove();
			$(this).remove();
		});
	},
	selectBase: function () {
		var mapNumbers = map.key('number');
		game.config.base = mapNumbers[ game.randomInt(1, mapNumbers.length) ];
	},
	randomFloat: function (highest) {
		return Math.random() * highest;
	},
	randomLog: function () {
		var randomLog = Math.log(Math.random() * 22026.4657948066);
		if (randomLog < 0) { // Prevent the very rare occassions when this is negative
			randomLog = 0;
		}
		return randomLog; // Returns a float between 0 and 9.9999999999
	},
	randomInt: function (lowest, highest) {
		return Math.floor(game.randomFloat(highest)) + lowest;
	},
	randomSafe: function (percentage) { // For example game.randomSafe(0.5) would be 50% safe
		var randomFloat = game.randomFloat(10) * (1 - percentage);
		var randomLog = game.randomLog() * percentage;
		return randomFloat + randomLog;
	},
	revealPolice: function() {
		var randomIndex = Math.floor(Math.random() * (_.last(police).start.length + _.last(police).fake.length)) + 1; // Randomly select a police (marked or unmarked)
		if (randomIndex <= _.last(police).start.length) {
			var mapid = _.last(police).start[randomIndex - 1];
		} else {
			var mapid = _.last(police).fake[randomIndex - _.last(police).start.length - 1];
		}
		_.last(police).revealed.push(mapid);
	},
	murder: function() {
		var baseX = map[game.config.base].position[0];
		var baseY = map[game.config.base].position[1];
		
		// Sort by closest to base
		game.config.womenMarked = _.sortBy(game.config.womenMarked, function (num) {
			return Math.hypot(Math.abs(map[num].position[0] - baseX), Math.abs(map[num].position[1] - baseY));
		});

		// Randomly select a murder victim (slightly less likely to select a far away murder)
		var randomIndex = Math.round(Math.abs((game.randomSafe(0.2) / 10) - 1) * game.config.womenMarked.length);
		
		var mapid = game.config.womenMarked[randomIndex];
		jack[jack.length - 1].route.push(mapid); // Put Jack at the scene of the crime
		jack[jack.length - 1].murder.push(mapid);
		jack[jack.length - 1].murderMove.push(game.config.totalMoves - game.config.remainingMoves + 1);
	},
	twoSteps: function(mapid) {
		// Show all possible police movements
		var addNonNumber = function(array, id) {
			if (!map[id].number) {
				array.push(id);
				return array;
			} else {
				return _.union(withoutNumbers(_.filter(map[id].adjacent, function (mapid) {
					return !map[mapid].number;
				})), array);
			}
		}
		var withoutNumbers = function(current) {
			return _.reduce(current, function(memo, item) {
				return addNonNumber(memo, item);
			}, []);
		}
		return _.union(_.flatten(_.map(withoutNumbers(map[mapid].adjacent), function(a, i) {
				return withoutNumbers(map[a].adjacent);
			})
		))
	},
	searchable: function (mapid) {
		// Show all searchable (or arrestable) numbered map ids given a police location
		return _.compact(_.map(map[mapid].adjacent, function (adj) {
			if (_.has(map[adj], 'number')) {
				return adj;
			}
		}));
	},
	searchable: function (mapid) {
		// Show all searchable (or arrestable) numbered map ids given a police location
		return _.compact(_.map(map[mapid].adjacent, function (adj) {
			if (_.has(map[adj], 'number')) {
				return adj;
			}
		}));
	},
	sort: function (array) {
		return _.sortBy(array, function (num) {
			return num;
		});
	}
}

jack.move = function () {

	// TODO: Prevent moving through police
	// TODO: If adjacent to base and nearly end of game; move to base and announce
	// TODO: If close to base but too early in the night; avoid base

	var adjacentNumber = map[jack[jack.length - 1].route[jack[jack.length - 1].route.length - 1]].adjacentNumber;
	var adjacent = new Array();
	var baseX = map[game.config.base].position[0];
	var baseY = map[game.config.base].position[1];

	// Everywhere police could be
	policeMoves = _.flatten(_.map(_.flatten(_.last(police).route), function (mapid) {
		return game.twoSteps(mapid);
	}));

	// Everywhere police could arrest
	arrestable = new Array();
	arrestable = game.sort(
		_.flatten(_.map(policeMoves, function (mapid) {
			return game.searchable(mapid);
		}))
	);

	// Everywhere police could arrest (and angles from which it can be arrested)
	arrestable = _.countBy(arrestable, function (num) {
		return num;
	});

	var randomIndex;

	for (a = 0; a < adjacentNumber.length; a++) { // For each position adjacent to Jack
		var baseDistance = Math.hypot(Math.abs(map[adjacentNumber[a]].position[0] - baseX), Math.abs(map[adjacentNumber[a]].position[1] - baseY));
		adjacent[a] = new Array(); // Create a lovely array of options listing pros and cons
		adjacent[a].number = adjacentNumber[a];
		adjacent[a].distance = baseDistance;
		adjacent[a].arrestable = _.has(arrestable, adjacentNumber[a]) ? true : false;
		adjacent[a].arrestableAngles = arrestable[adjacentNumber[a]];
	}

	switch (_.last(jack).route.length) {
		case 1: // Jack's first move
			adjacent = _.sortBy(adjacent, 'distance');
			adjacent = _.sortBy(adjacent, 'arrestableAngles');
			adjacent = _.sortBy(adjacent, 'arrestable');
			var unarrestableCount = _.without(_.map(adjacent, function (obj) { return obj.arrestable; }), true).length
			if (unarrestableCount > 0) {
				adjacent.splice(unarrestableCount, (adjacent.length - unarrestableCount)); // Splice arrestable locations
				randomIndex = Math.floor(Math.abs((game.randomSafe(0.99) / 10) - 1) * (adjacent.length + 1));
			} else {
				randomIndex = Math.floor(Math.abs((game.randomSafe(0.99) / 10) - 1) * (adjacentNumber.length + 1));
			}
		break;
		case 2: // Jack's second move
			adjacent = _.sortBy(adjacent, 'distance');
			adjacent = _.sortBy(adjacent, 'arrestableAngles');
			adjacent = _.sortBy(adjacent, 'arrestable');
			randomIndex = Math.floor(Math.abs((game.randomSafe(0.99) / 10) - 1) * (adjacentNumber.length + 1));
		break;
		// TODO: If less than (three) moves from base; move away from base
		default:
			adjacent = _.sortBy(adjacent, 'distance');
			randomIndex = Math.floor(Math.abs((game.randomSafe(0.9) / 10) - 1) * (adjacentNumber.length + 1));
		break;
	}

	_.last(jack).adjacent = adjacent; // Save this info to jack for console reference

	return adjacent[randomIndex].number;
}

/* Draw
   ----- */
var draw = {
	map: function() {
		for (a = 0; a < map.length; a++) {
			if (map[a].position != undefined) {
				if (map[a].number != undefined) {
					var murder = (map[a].murder ? ' location-murder' : '');
					var classes = 'label label-primary location-number location-' + a + murder;
					draw.createElement(a, map[a].number, classes).prependTo('.map');
				} else {
					if (map[a].station) {
						var station = ' location-station';
						var classes = 'label label-default location location-' + a + station;
						draw.createElement(a, 's', classes).prependTo('.map');
					} else {
						var classes = 'label label-default location location-' + a;
						draw.createElement(a, ' ', classes).prependTo('.map');
					}
				}
				if (map[a].clue != undefined) {
					var clue = (map[a].clue ? ' location-clue' : '');
					var classes = 'label label-info token token-clue token-clue-' + a + clue;
					draw.createElement(a, 'clue', classes).prependTo('.map');
				}
			}
		}
	},
	createElement: function (mapid, labelText, classes) {
		return $('<span></span>', {
			'data-mapid': mapid,
			class: classes,
			text: labelText,
			style: 'left:' + map[mapid].position[0] + ';' + 'top:' + map[mapid].position[1] + ';'
		});
	},
	updateTitle: function() {
		$('h1').remove();
		$('<h1></h1>', {
			text: state[game.config.state].title,
		}).prependTo('.container');
	}
}

/* Start
   ----- */
draw.map();
draw.updateTitle();
game.selectBase();
game.nextState();
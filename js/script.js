/*!
 * w
 * by David Apple
 * @davidappleremix
 */

/* Jack
   ---- */

var jack = new Array();

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
		police: 7,
		fakePolice: 2,
		womenMarked: new Array(),
		womenUnmarked: new Array(),
		policeMarked: new Array(),
		policeUnmarked: new Array(),
		policeRevealed: new Array(),
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
					game.config.policeMarked.splice($.inArray(mapid, game.config.policeMarked), 1);
				} else {
					if (game.config.policeMarked.length < (game.config.police - game.config.fakePolice)) {
						$(this).addClass('selected');
						game.config.policeMarked.push(mapid);
						if ($(this).next().hasClass('selected')) {
							$(this).next().removeClass('selected');
							game.config.policeUnmarked.splice($.inArray(mapid, game.config.policeUnmarked), 1);
						}
					}
				}
			}
			if ($(this).hasClass('unmarked')) {
				if ($(this).hasClass('selected')) {
					$(this).removeClass('selected');
					game.config.policeUnmarked.splice($.inArray(mapid, game.config.policeUnmarked), 1);
				} else {
					if (game.config.policeUnmarked.length < game.config.fakePolice) {
						$(this).addClass('selected');
						game.config.policeUnmarked.push(mapid);
						if ($(this).prev().hasClass('selected')) {
							$(this).prev().removeClass('selected');
							game.config.policeMarked.splice($.inArray(mapid, game.config.policeMarked), 1);
						}
					}
				}
			}
			if (game.config.policeMarked.length >= (game.config.police - game.config.fakePolice) && game.config.policeUnmarked.length >= game.config.fakePolice) {
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
		if ($.inArray(game.config.policeRevealed[game.config.policeRevealed.length - 1], game.config.policeUnmarked) !== -1) {
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
			if ($.inArray(a, game.config.policeRevealed) !== -1) {
				if ($.inArray(a, game.config.policeMarked) !== -1) {
					var classes = 'label label-info revealed token token-police token-police-' + a;
					draw.createElement(a, 'real police', classes).appendTo('.map');
				}
			} else {
				if (($.inArray(a, game.config.policeMarked) !== -1) || ($.inArray(a, game.config.policeUnmarked) !== -1)) {
					var classes = 'label label-info token token-police token-police-' + a;
					draw.createElement(a, 'police', classes).appendTo('.map');
				}
			}
		}
		$('.token-wretched').click(function(){
			var mapid = $(this).data('mapid');

			// Cannot move wretched adjacent to a police token
			var police = _.union(game.config.policeMarked, game.config.policeUnmarked);
			var illegalMoves = _.map(police, function(num, key) {
				// But revealed police that are unmarked are fine
				if (!(_.contains(_.intersection(game.config.policeRevealed, game.config.policeUnmarked), num))) {
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
		jack[jack.length - 1].route.push(jack.move()); // Jack's first move
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
		for (a = 0; a < map.length; a++) {
			if ($.inArray(a, game.config.policeMarked) !== -1) {
				var classes = 'label label-info selectable revealed token token-police token-police-' + a;
				draw.createElement(a, 'real police', classes).appendTo('.map');
			}
			if (a == _.last(jack).murder[_.last(jack).murder.length - 1]) {
				var classes = 'label label-info token token-murder token-murder-' + a;
				draw.createElement(a, 'murder', classes).appendTo('.map');
			}
		}
		$('.token-police').click(function(){
			var mapid = $(this).data('mapid');

			// Show all possible police movements
			var addNonNumber = function(array, id) {
				if (!map[id].number) {
					array.push(id);
					return array;
				} else {
					return _.union(withoutNumbers(map[id].adjacent), array);
				}
			}
			var withoutNumbers = function(current) {
				return _.reduce(current, function(memo, item) {
					return addNonNumber(memo, item);
				}, []);
			}
			var twoSteps = function(current) {
				return _.union(_.flatten(_.map(withoutNumbers(current), function(a, i) {
						return withoutNumbers(map[a].adjacent);
					})
				))
			}
			
			var twoSteps = twoSteps(map[mapid].adjacent);

			for (b = 0; b < twoSteps.length; b++) {
				if ($.inArray(twoSteps[b], game.config.policeMarked) == -1) {
					var classes = 'label label-info selectable token token-move-police token-police-' + twoSteps[b];
					draw.createElement(twoSteps[b], 'move here', classes).data('mapidPrev', mapid).click(function(){
						var index = game.config.policeMarked.indexOf(mapid); // Find previous map id in array
						if (index !== -1) {
							game.config.policeMarked[index] = $(this).data('mapid'); // Replace map id in array with new location
						}
						$(this).removeClass('selectable token-move-police').addClass('token-police').text('real police').unbind('click');
						$('.token-move-police').remove();
						movedPolice++;
						if (movedPolice >= game.config.policeMarked.length) {
							$('.token-police').remove();
							game.nextState(11);
						}
					}).appendTo('.map');
				}
			}
			$('.token-police-' + mapid).remove();

			var classes = 'label label-info selectable token token-move-police token-police-' + mapid;
			draw.createElement(mapid, 'don\'t move', classes).data('mapidPrev', mapid).click(function(){
				var index = game.config.policeMarked.indexOf(mapid); // Find previous map id in array
				if (index !== -1) {
					game.config.policeMarked[index] = $(this).data('mapid'); // Replace map id in array with new location
				}
				$(this).removeClass('selectable token-move-police').addClass('token-police').text('real police').unbind('click');
				$('.token-move-police').remove();
				movedPolice++;
				if (movedPolice >= game.config.policeMarked.length) {
					$('.token-police').remove();
					game.nextState(11);
				}
			}).appendTo('.map');
		});
	},
	cluesAndSuspicion: function () {
		var movedPolice = 0;
		$('.clues-and-suspicion').show();
		$('.clues-and-suspicion .next-state').hide();

		$('<p></p>', {
			text: 'Each policeman pawn either looks for clues or executes an arrest.'
		}).prependTo('.clues-and-suspicion');

		var completePolice = 0;
		for (a = 0; a < map.length; a++) {
			if ($.inArray(a, game.config.policeMarked) !== -1) {
				var classes = 'label label-info selectable token token-search token-search-' + a;
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
			for (b = 0; b < map[mapid].adjacent.length; b++) {
				if (_.has(map[map[mapid].adjacent[b]], 'number')) {
					var classes = 'label label-info selectable token token-arrest token-arrest-' + a;
					draw.createElement(map[mapid].adjacent[b], 'arrest', classes).click(function(){
						var mapid = $(this).data('mapid');
						if (mapid == _.last(jack).route[_.last(jack).route.length - 1]) {
							console.log('Jack has been arrested.');
						} else {
							console.log('Jack has not been arrested.');
						}
						$('.token-arrest').remove();
						movedPolice++;
						if (movedPolice >= (game.config.police - game.config.fakePolice)) {
							$('.token.selectable').remove();
							game.config.remainingMoves--;
							game.nextState(8);
						}
					}).appendTo('.map');
				}
			}
			$(this).prev().remove();
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
		var randomIndex = Math.floor(Math.random() * (game.config.policeMarked.length + game.config.policeUnmarked.length)) + 1; // Randomly select a police (marked or unmarked)
		if (randomIndex <= game.config.policeMarked.length) {
			var mapid = game.config.policeMarked[randomIndex - 1];
		} else {
			var mapid = game.config.policeUnmarked[randomIndex - game.config.policeMarked.length - 1];
		}
		game.config.policeRevealed.push(mapid);
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
	}
}

jack.move = function () {
	var adjacentNumber = map[jack[jack.length - 1].route[jack[jack.length - 1].route.length - 1]].adjacentNumber;
	var adjacent = new Array();
	var baseX = map[game.config.base].position[0];
	var baseY = map[game.config.base].position[1];

	// TODO: If it's the first move, move to a position where arrest is impossible.

	// Just choose the shortest distance to base for now
	var shortestDistance;
	var chosenPosition;

	for (a = 0; a < adjacentNumber.length; a++) { // For each position adjacent to Jack
		var baseDistance = Math.hypot(Math.abs(map[adjacentNumber[a]].position[0] - baseX), Math.abs(map[adjacentNumber[a]].position[1] - baseY));
		adjacent[a] = new Array(); // Create a lovely array of options listing pros and cons
		adjacent[a].number = adjacentNumber[a];
		adjacent[a].distance = baseDistance;

		// Just choose the shortest distance to base for now
		if (a == 0) {
			shortestDistance = baseDistance;
			chosenPosition = a;
		} else {
			if (baseDistance < shortestDistance) {
				shortestDistance = baseDistance;
				chosenPosition = a;
			}
		}
	}
	return adjacentNumber[chosenPosition];
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
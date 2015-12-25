/*!
 * w
 * by David Apple
 * @davidappleremix
 */

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
		jack: [new Array()],
		womenMarked: new Array(),
		womenUnmarked: new Array(),
		policeMarked: new Array(),
		policeUnmarked: new Array(),
		policeRevealed: new Array(),
		murder: [new Array()],
		murderMove: new Array()
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
				cluesAndSuspicion();
			break;
		}
	},
	preparingTheScene: function () {
		$('.preparing-the-scene').show().children('.next-state').click(function(){
			game.nextState(1);
		});
		$('<p></p>', {
			text: 'Jack chooses a base and collects the special movement tokens (' + game.config.carriages + ' carrages and ' + game.config.lanterns + ' lanterns).'
		}).prependTo('.preparing-the-scene');

		var mapNumbers = game.mapKey('number');
		game.config.base = mapNumbers[ game.randomInt(1, mapNumbers.length) ]; // Randomly select a base
	},
	theTargetsAreIdentified: function () {
		var mapMurders = game.mapKey('murder');
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
				$('<span></span>', {
					text: 'woman',
					'data-mapid': a,
					class: 'label label-info token token-woman token-woman-' + a,
					style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
				}).appendTo('.map');
			}
			if (map[a].station) {
				$('<span></span>', {
					text: a + ' police',
					'data-mapid': a,
					class: 'label label-info selectable token token-police marked token-police-' + a,
					style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
				}).appendTo('.map');
				$('<span></span>', {
					text: a + ' not police',
					'data-mapid': a,
					class: 'label label-info selectable token token-police unmarked token-police-' + a,
					style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
				}).appendTo('.map');
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
				$('.patrolling-the-streets .next-state').show().click(function(){
					$('.token-woman').remove();
					$('.token-police').remove();
					game.nextState(4);
				});
			} else {
				$('.patrolling-the-streets .next-state').hide();
			}
		});
	},
	bloodOnTheStreets: function () {
		$('<p></p>', {
			text: 'Jack chooses between killing or waiting.'
		}).prependTo('state.blood-on-the-streets');

		if (game.config.murder[game.config.murder.length - 1].length == game.config.jack[game.config.jack.length - 1].length && game.config.jack[game.config.jack.length - 1].length == 0) {
		
			if (game.config.totalMoves > game.config.remainingMoves) { // If Jack has enough moves to reveal a police token
				var randomIndex = Math.random(); // Jack chooses between killing or waiting based on the toss of a coin
				if (randomIndex > 0.5) {
					game.revealPolice();
					game.config.remainingMoves++;
					game.nextState(5);
				} else {
					game.murder();
					console.log('Murder commited at random. Number ' + randomIndex);
					game.config.remainingMoves--;
					$('.token-police').remove();
					game.nextState(8);
				}
			} else { // Forced to murder
				game.murder();
				console.log('Forced murder');
				game.config.remainingMoves--;
				$('.token-police').remove();
				game.nextState(8);
			}

		} else {
			console.log('Warning: Multiple "Blood on the Streets" attempted.');
		}
	},
	suspenseGrows: function() {
		$('.suspense-grows').show();
		$('.suspense-grows .next-state').hide();
		$('<p></p>', {
			text: 'The time of the crime token is moved, and each wreched pawn moves.'
		}).prependTo('.state.suspense-grows');
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
				$('<span></span>', {
					text: 'wretched',
					'data-mapid': a,
					class: 'label label-info selectable token token-wretched token-wretched-' + a,
					style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
				}).appendTo('.map');
			}
			if ($.inArray(a, game.config.policeRevealed) !== -1) {
				if ($.inArray(a, game.config.policeMarked) !== -1) {
					$('<span></span>', {
						text: 'real police',
						'data-mapid': a,
						class: 'label label-info revealed token token-police token-police-' + a,
						style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
					}).appendTo('.map');
				}
			} else {
				if (($.inArray(a, game.config.policeMarked) !== -1) || ($.inArray(a, game.config.policeUnmarked) !== -1)) {
					$('<span></span>', {
						text: 'police',
						'data-mapid': a,
						class: 'label label-info token token-police token-police-' + a,
						style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
					}).appendTo('.map');
				}
			}
		}
		$('.token-wretched').click(function(){
			var mapid = $(this).data('mapid');
			for (b = 0; b < map[mapid].adjacentNumber.length; b++) {
				if ($.inArray(map[mapid].adjacentNumber[b], game.config.womenMarked) == -1) {
					if (true) { // TODO: Wretched tokens cannot move next to police tokens, cannot move past police tokens or on crime scene markers
						$('<span></span>', {
							text: 'move here',
							'data-mapidPrev': mapid,
							'data-mapid': map[mapid].adjacentNumber[b],
							class: 'label label-info selectable token token-move-wretched token-wretched-' + map[mapid].adjacentNumber[b],
							style: 'left:' + map[map[mapid].adjacentNumber[b]].position[0] + ';' + 'top:' + map[map[mapid].adjacentNumber[b]].position[1] + ';'
						}).click(function(){
							var index = game.config.womenMarked.indexOf(mapid); // Find previous map id in array
							if (index !== -1) {
								game.config.womenMarked[index] = $(this).data('mapid'); // Replace map id in array with new location
							}
							$(this).removeClass('selectable token-move-wretched').addClass('token-wretched').text('wretched').unbind('click');
							$('.token-move-wretched').remove();
							movedWretched++;
							if (movedWretched >= game.config.wretched) {
								$('.suspense-grows .next-state').show().click(function(){
									$('.token-wretched').remove();
									game.nextState(4);
								});
							}
						}).appendTo('.map');
					}
				}
			}
			$('.token-wretched-' + mapid).remove();
		});
	},
	alarmWhistles: function () {
		game.config.jack[game.config.murder[game.config.murder.length - 1].length - 1] = new Array();
		game.config.jack[game.config.murder[game.config.murder.length - 1].length - 1].push(game.config.murder[game.config.murder.length - 1][game.config.murder.length - 1]);
		game.config.jack[game.config.murder[game.config.murder.length - 1].length - 1].push(game.moveJack()); // Jack's first move
		var murderMove = game.config.murderMove[game.config.murderMove.length - 1] + 1; // Move the time of crime token forward
		$('.move-tracker p span:nth-child(' + murderMove + ')').addClass('murder');
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
				$('<span></span>', {
					text: 'real police',
					'data-mapid': a,
					class: 'label label-info selectable revealed token token-police token-police-' + a,
					style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
				}).appendTo('.map');
			}
			if ($.inArray(a, game.config.murder[game.config.murder.length - 1]) !== -1) {
				$('<span></span>', {
					text: 'murder',
					'data-mapid': a,
					class: 'label label-info token token-murder token-murder-' + a,
					style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
				}).appendTo('.map');
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
					$('<span></span>', {
						text: 'move here',
						'data-mapidPrev': mapid,
						'data-mapid': twoSteps[b],
						class: 'label label-info selectable token token-move-police token-police-' + twoSteps[b],
						style: 'left:' + map[twoSteps[b]].position[0] + ';' + 'top:' + map[twoSteps[b]].position[1] + ';'
					}).click(function(){
						var index = game.config.policeMarked.indexOf(mapid); // Find previous map id in array
						if (index !== -1) {
							game.config.policeMarked[index] = $(this).data('mapid'); // Replace map id in array with new location
						}
						$(this).removeClass('selectable token-move-police').addClass('token-police').text('real police').unbind('click');
						$('.token-move-police').remove();
						movedPolice++;
						if (movedPolice >= game.config.policeMarked.length) {
							$('.hunting-the-monster .next-state').show().click(function(){
								$('.token-police').remove();
								game.nextState(11);
							});
						}
					}).appendTo('.map');
				}
			}
			$('.token-police-' + mapid).remove();
			$('<span></span>', {
				text: 'don\'t move',
				'data-mapidPrev': mapid,
				'data-mapid': mapid,
				class: 'label label-info selectable token token-move-police token-police-' + mapid,
				style: 'left:' + map[mapid].position[0] + ';' + 'top:' + map[mapid].position[1] + ';'
			}).click(function(){
				var index = game.config.policeMarked.indexOf(mapid); // Find previous map id in array
				if (index !== -1) {
					game.config.policeMarked[index] = $(this).data('mapid'); // Replace map id in array with new location
				}
				$(this).removeClass('selectable token-move-police').addClass('token-police').text('real police').unbind('click');
				$('.token-move-police').remove();
				movedPolice++;
				if (movedPolice >= game.config.policeMarked.length) {
					$('.hunting-the-monster .next-state').show().click(function(){
						$('.token-police').remove();
						game.nextState(11);
					});
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
				$('<span></span>', {
					text: 'real police',
					'data-mapid': a,
					class: 'label label-info selectable revealed token token-police token-police-' + a,
					style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
				}).appendTo('.map');
			}
			if ($.inArray(a, game.config.murder[game.config.murder.length - 1]) !== -1) {
				$('<span></span>', {
					text: 'murder',
					'data-mapid': a,
					class: 'label label-info token token-murder token-murder-' + a,
					style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
				}).appendTo('.map');
			}
		}
	},
	mapKey: function (key) {
		// Returns an array of ids that have a key,
		// for example game.mapKey('station') = [33, 56, 76, 190, 210, 312, 385]
		array = new Array();
		_.map(map, function(item, index) {
			if (_.has(item, key)) {
				array.push(index);
			}
		});
		return array;
	},
	randomInt: function (lowest, highest) {
		return Math.floor(Math.random() * highest) + lowest;
	},
	revealPolice: function() {
		// TODO: Prevent revealing the same police multiple times
		var randomIndex = Math.floor(Math.random() * (game.config.policeMarked.length + game.config.policeUnmarked.length)) + 1; // Randomly select a police (marked or unmarked)
		if (randomIndex <= game.config.policeMarked.length) {
			var mapid = game.config.policeMarked[randomIndex - 1];
		} else {
			var mapid = game.config.policeUnmarked[randomIndex - game.config.policeMarked.length - 1];
		}
		game.config.policeRevealed.push(mapid);
	},
	murder: function() {
		var randomIndex = Math.floor(Math.random() * game.config.womenMarked.length); // Randomly select a murder victim
		var mapid = game.config.womenMarked[randomIndex];
		game.config.murder[game.config.murder.length - 1].push(mapid);
		game.config.murderMove.push(game.config.totalMoves - game.config.remainingMoves);
	},
	moveJack: function() {
		var jackRoute = game.config.jack[game.config.murder[game.config.murder.length - 1].length - 1];
		var jack = game.config.jack[game.config.murder[game.config.murder.length - 1].length - 1][game.config.jack[game.config.murder[game.config.murder.length - 1].length - 1].length - 1];
		var adjacentNumber = map[jack].adjacentNumber;
		var adjacent = new Array();
		var baseX = map[game.config.base].position[0];
		var baseY = map[game.config.base].position[1];

		// Just choose the shortest distance to base for now
		var shortestDistance;
		var chosenPosition;
		// Ends

		for (a = 0; a < adjacentNumber.length; a++) { // For each position adjacent to Jack
			var baseDistance = Math.hypot(Math.abs(map[adjacentNumber[a]].position[0] - baseX), Math.abs(map[adjacentNumber[a]].position[1] - baseY));
			adjacent[a] = new Array(); // Create a lovely array of options listing pros and cons
			adjacent[a].number = adjacentNumber[a];
			adjacent[a].distance = baseDistance;

			// Random number float between 0 & 10 (much more likely to be high)
			// (Math.log((Math.random() * 22026) + 1) + 1) - 1;

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
			// Ends

		}

		return adjacentNumber[chosenPosition];
	}
}

/* Draw
   ----- */
var draw = {
	map: function() {
		for (a = 0; a < map.length; a++) {
			if (map[a].position != undefined) {
				if (map[a].number != undefined) {
					var murder = (map[a].murder ? ' location-murder' : '');
					$('<span></span>', {
						class: 'label label-primary location-number location-' + a + murder,
						text: map[a].number,
						style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
					}).prependTo('.map');
				} else {
					if (map[a].station) {
						var station = ' location-station';
						$('<span></span>', {
							class: 'label label-default location location-' + a + station,
							text: 's',
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
		}
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
game.nextState();
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
		jack: new Array(),
		womenMarked: new Array(),
		womenUnmarked: new Array(),
		policeMarked: new Array(),
		policeUnmarked: new Array(),
		policeRevealed: new Array(),
		murder: new Array(),
		murderMove: new Array()
	},
	nextState: function() {
		$('.state').hide();
		draw.updateTitle();
		if (game.config.state == 0) { /* Prepare the scene */
			$('.prepare-the-scene').show().children('.next-state').click(function(){
				game.config.state = 1;
				game.nextState();
			});
			$('<p></p>', {
				text: 'Jack chooses a base and collects the special movement tokens (' + game.config.carriages + ' carrages and ' + game.config.lanterns + ' lanterns).'
			}).prependTo('.prepare-the-scene');

			var numberedLocation = new Array();
			for (a = 1; a < map.length; a++) {
				if (map[a].number) {
					numberedLocation.push(a);
				}
			}
			game.config.base = numberedLocation[Math.floor(Math.random() * numberedLocation.length) + 1]; // Randomly select a base

		} else if (game.config.state == 1) { /* The targets are identified */

			var murderLocations = new Array(); // Create an array of murder spots on the map
			for (a = 0; a < map.length; a++) {
				if (map[a].murder) {
					murderLocations.push(a);
				}
			}

			while (game.config.womenMarked.length < game.config.wretched) { 
				var randomIndex = Math.floor(Math.random() * murderLocations.length);
				game.config.womenMarked.push(murderLocations[randomIndex]); // Randomly select wreched
				murderLocations.splice(randomIndex, 1); // Prevent possibility of choosing duplicate locations
			}
			while (game.config.womenUnmarked.length < (game.config.women - game.config.wretched)) {
				var randomIndex = Math.floor(Math.random() * murderLocations.length);
				game.config.womenUnmarked.push(murderLocations[randomIndex]); // Randomly select unmarked women
				murderLocations.splice(randomIndex, 1); // Prevent possibility of choosing duplicate locations
			}

			game.config.state = 2;
			game.nextState();
		} else if (game.config.state == 2) { /* Patrolling the streets */
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
						game.config.state = 4;
						game.nextState();
					});
				} else {
					$('.patrolling-the-streets .next-state').hide();
				}
			});
		} else if (game.config.state == 4) { /* Blood on the streets */

			$('<p></p>', {
				text: 'Jack chooses between killing or waiting.'
			}).prependTo('state.blood-on-the-streets');
			
			if (game.config.totalMoves > game.config.remainingMoves) { // If Jack has enough moves to reveal a police token
				var randomIndex = Math.random(); // Jack chooses between killing or waiting based on the toss of a coin
				if (randomIndex > 0.5) {
					game.revealPolice();
					game.config.remainingMoves++;
					game.config.state = 5;
					game.nextState();
				} else {
					game.murder();
					console.log('Murder commited at random. Number ' + randomIndex);
					game.config.remainingMoves--;
					$('.token-police').remove();
					game.config.state = 8;
					game.nextState();
				}
			} else { // Forced to murder
				game.murder();
				console.log('Forced murder');
				game.config.remainingMoves--;
				$('.token-police').remove();
				game.config.state = 8;
				game.nextState();
			}

		} else if (game.config.state == 5) { /* Suspense grows */
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
									game.config.state = 4;
									game.nextState();
								});
							}
						}).appendTo('.map');
					}
				}
				$('.token-wretched-' + mapid).remove();
			});
		} else if (game.config.state == 8) { /* Alarm whistles */
			game.config.jack[game.config.murder.length - 1] = new Array();
			game.config.jack[game.config.murder.length - 1].push(game.config.murder[game.config.murder.length - 1]);
			game.config.jack[game.config.murder.length - 1].push(game.moveJack()); // Jack's first move
			var murderMove = game.config.murderMove[game.config.murderMove.length - 1] + 1; // Move the time of crime token forward
			$('.move-tracker p span:nth-child(' + murderMove + ')').addClass('murder');
			var availableMoves = game.config.totalMoves - game.config.remainingMoves + 1;
			$('.move-tracker p span').removeClass('active');
			$('.move-tracker p span:nth-child(' + availableMoves + ')').addClass('active');
			game.config.state = 10;
			game.nextState();
		} else if (game.config.state == 10) { /* Hunting the monster */
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
				if ($.inArray(a, game.config.murder) !== -1) {
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
				for (b = 0; b < map[mapid].adjacent.length; b++) {
					if ($.inArray(map[mapid].adjacent[b], game.config.policeMarked) == -1) {
						$('<span></span>', {
							text: 'move here',
							'data-mapidPrev': mapid,
							'data-mapid': map[mapid].adjacent[b],
							class: 'label label-info selectable token token-move-police token-police-' + map[mapid].adjacent[b],
							style: 'left:' + map[map[mapid].adjacent[b]].position[0] + ';' + 'top:' + map[map[mapid].adjacent[b]].position[1] + ';'
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
									game.config.state = 11;
									game.nextState();
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
							game.config.state = 11;
							game.nextState();
						});
					}
				}).appendTo('.map');
			});
		} else if (game.config.state == 11) { /* Clues and suspicion */
			var movedPolice = 0;
			$('.clues-and-suspicion').show();
			$('.clues-and-suspicion .next-state').hide();

			$('<p></p>', {
				text: 'Each policeman pawn either looks for clues or executes an arrest.'
			}).prependTo('.clues-and-suspicion');
		}
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
		var randomIndex = Math.floor(Math.random() * game.config.womenMarked.length); // Randomly select a murder victim
		var mapid = game.config.womenMarked[randomIndex];
		game.config.murder.push(mapid);
		game.config.murderMove.push(game.config.totalMoves - game.config.remainingMoves);
	},
	moveJack: function() {
		var jackRoute = game.config.jack[game.config.murder.length - 1];
		var jack = game.config.jack[game.config.murder.length - 1][game.config.jack[game.config.murder.length - 1].length - 1];
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
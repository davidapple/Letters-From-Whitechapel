/*!
 * w
 * by David Apple
 * @davidappleremix
 */

/* Game
   ---- */
var game = {
	config: {
		base: 152, /* Preprogrammed. TODO: Makke this selection random */
		state: 0,
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
		policeRevealed: new Array()
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
				text: 'Jack collects the special movement tokens (' + game.config.carriages + ' carrages and ' + game.config.lanterns + ' lanterns).'
			}).prependTo('.prepare-the-scene');
		}
		if (game.config.state == 1) { /* The targets are identified */
			
			/* Preprogrammed. TODO: Makke this selection random */
			game.config.womenMarked = [232, 346, 148, 22];
			game.config.womenUnmarked = [8, 94, 182, 421];

			game.config.state = 2;
			game.nextState();
		}
		if (game.config.state == 2) { /* Patrolling the streets */
			$('.patrolling-the-streets').show();
			$('.patrolling-the-streets .next-state').hide();
			$('<p></p>', {
				text: 'The head of the investigation places' + game.config.police + 'police patrol tokens and ' + game.config.fakePolice + ' fake police tokens on the map.'
			}).prependTo('.the-targets-are-identified');
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
						game.config.state = 3;
						game.nextState();
					});
				} else {
					$('.patrolling-the-streets .next-state').hide();
				}
			});
		}
		if (game.config.state == 3) { /* Blood on the streets */
			
			/* Preprogrammed to reveal the policeman at 76. TODO: Makke this selection random */
			if (game.config.policeRevealed == 0) {
				var mapid = 76;
				if ($.inArray(mapid, game.config.policeUnmarked)) {
					game.config.policeRevealed.push(mapid);
					game.config.state = 4;
					game.nextState();
				}
			} else {
				/* Preprogrammed to murder at 22. TODO: Makke this selection random */
				var mapid = 22;
				game.config.murder = mapid;
				game.config.state = 5;
				game.nextState();
			}

		}
		if (game.config.state == 4) { /* Suspense grows */
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
					}).appendTo('.map');
				}
				$('.token-wretched-' + mapid).remove();
			});
		}
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
						text: a,
						style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
					}).prependTo('.map');
				} else {
					var station = (map[a].station ? ' location-station' : '');
					$('<span></span>', {
						class: 'label label-default location location-' + a + station,
						text: a,
						style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
					}).prependTo('.map');
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
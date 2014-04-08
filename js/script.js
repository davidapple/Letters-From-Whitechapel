/*!
 * w
 * by David Apple
 * @davidappleremix
 */

/* Game
   ---- */
var game = {
	config: {
		// base: ?,
		state: 0,
		remainingMoves: 15,
		lanterns: 3,
		carriages: 3,
		women: 8,
		wretched: 4,
		womenMarked: new Array(),
		womenUnmarked: new Array()
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
			game.config.womenMarked = new Array();
			$('.the-targets-are-identified').show();
			$('.the-targets-are-identified .next-state').hide();
			$('<p></p>', {
				text: 'Jack places ' + game.config.women + ' women tokens (' + game.config.wretched + ' of which are marked) facedown on red numbered circles.'
			}).prependTo('.the-targets-are-identified');
			for (a = 0; a < map.length; a++) {
				if (map[a].murder) {
					$('<span></span>', {
						text: a + ' marked',
						'data-mapid': a,
						class: 'label label-info selectable token-woman marked token-woman-' + a,
						style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
					}).appendTo('.map');
					$('<span></span>', {
						text: a + ' not marked',
						'data-mapid': a,
						class: 'label label-info selectable token-woman unmarked token-woman-' + a,
						style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
					}).appendTo('.map');
				}
			}
			$('.token-woman').click(function(){
				var mapid = $(this).data('mapid');
				if ($(this).hasClass('marked')) {
					if ($(this).hasClass('selected')) {
						$(this).removeClass('selected');
						game.config.womenMarked.splice($.inArray(mapid, game.config.womenMarked), 1);
					} else {
						if (game.config.womenMarked.length < (game.config.women - game.config.wretched)) {
							$(this).addClass('selected');
							game.config.womenMarked.push(mapid);
							if ($(this).next().hasClass('selected')) {
								$(this).next().removeClass('selected');
								game.config.womenUnmarked.splice($.inArray(mapid, game.config.womenUnmarked), 1);
							}
						}
					}
				}
				if ($(this).hasClass('unmarked')) {
					if ($(this).hasClass('selected')) {
						$(this).removeClass('selected');
						game.config.womenUnmarked.splice($.inArray(mapid, game.config.womenUnmarked), 1);
					} else {
						if (game.config.womenUnmarked.length < game.config.wretched) {
							$(this).addClass('selected');
							game.config.womenUnmarked.push(mapid);
							if ($(this).prev().hasClass('selected')) {
								$(this).prev().removeClass('selected');
								game.config.womenMarked.splice($.inArray(mapid, game.config.womenMarked), 1);
							}
						}
					}
				}
				if (game.config.womenMarked.length >= (game.config.women - game.config.wretched) && game.config.womenUnmarked.length >= game.config.wretched) {
					$('.the-targets-are-identified .next-state').show().click(function(){
						game.config.state = 2;
						game.nextState();
					});
				} else {
					$('.the-targets-are-identified .next-state').hide();
				}
			});
		}
		if (game.config.state == 2) { /* Patrolling the streets */
			$('.token-woman').remove();
			for (a = 0; a < map.length; a++) {
				if (($.inArray(a, game.config.womenMarked) !== -1) || ($.inArray(a, game.config.womenUnmarked) !== -1)) {
					$('<span></span>', {
						text: 'woman',
						'data-mapid': a,
						class: 'label label-info token-woman token-woman-' + a,
						style: 'left:' + map[a].position[0] + ';' + 'top:' + map[a].position[1] + ';'
					}).appendTo('.map');
				}
			}
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
					$('<span></span>', {
						class: 'label label-default location location-' + a,
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
let drawPin = function (mapid, labelText, classes){
	return $('<span></span>', {
		'data-mapid': mapid,
		class: classes,
		text: labelText,
		style: 'left:' + map[mapid].position[0] + ';' + 'top:' + map[mapid].position[1] + ';'
	});
}

let drawPosition = function(num, key){
	if (num.position) {
		if (num.number){
			let murder = (num.murder ? ' location-murder' : '')
			let classes = 'label label-primary location-number location-' + key + murder
			drawPin(key, '', classes).prependTo('.map')
		} else {
			if (num.station){
				var station = ' location-station'
				var classes = 'label label-default location location-' + key + station
				drawPin(key, '', classes).prependTo('.map')
			} else {
				var classes = 'label label-default location location-' + key
				drawPin(key, '', classes).prependTo('.map')
			}
		}
	}
}

let drawMap = function(){
	_.each(map, function(num, key){
		drawPosition(num, key)
	})
}

let drawPolice = function(){
	_.each(map, function(num, key){
		/*
		// TODO: For each Police Clue
			var classes = 'label label-info token token-clue token-clue-' + key
			drawPin(key, '', classes).prependTo('.map')
		*/
	})
}


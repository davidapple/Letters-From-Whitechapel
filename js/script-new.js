let Character = Backbone.Model.extend({
	defaults: {
		path: [],
	},
	setPush: function(key, value){
		this.set(key, this.get(key).concat(value))
	},
	move: function(id){
		this.setPush('path', id)
	},
	setToken: function(id, marked, tokenKey, mapKey){
		let tokenId = Number(map.key(mapKey)[id])
		if (_.contains(_.pluck(this.get(tokenKey), 'id'), tokenId)) {
			return false // Don't use the same spot twice
		} else {
			this.setPush(tokenKey, {'id': Number(tokenId), 'marked': marked})
			return true
		}
	},
	getToken: function(id, tokenKey){
		if (id < this.get(tokenKey).length) {
			return this.get(tokenKey)[id]
		} else {
			return false
		}
	},
	randomToken: function(marked, tokenKey, mapKey){
		if (map.key(mapKey).length > this.get(tokenKey).length) {
			if (!this.setToken(_.random(0, map.key(mapKey).length - 1), marked, tokenKey, mapKey)) {
				this.randomToken(marked, tokenKey, mapKey)
			}
		} else {
			return false // Prevent infinate loop
		}
	},
	randomTokens: function(tokenKey, mapKey, tokenCount, tokenMarked){
		let self = this
		this.set(tokenKey, [])
		_.each(_.range(this.get(tokenMarked)), function(){
			self.randomToken(true, tokenKey, mapKey)
		})
		_.each(_.range(this.get(tokenCount) - this.get(tokenMarked)), function(){
			self.randomToken(false, tokenKey, mapKey)
		})
		this.set(tokenKey, _.shuffle(this.get(tokenKey)))
	},
})

let Jack = Character.extend({
	initialize: function(){
		this.set({
			'womenTokens': [],
			'wretchedTokens': [],
			'murder': [],
			'clue': [],
			'time': 0,
		})
		this.randomBase()
		this.night1()
	},
	night1: function(){ this.changeNight(1, 8, 5, 3, 2) },
	night2: function(){ this.changeNight(2, 7, 4, 2, 2) },
	night3: function(){ this.changeNight(3, 6, 3, 2, 1) },
	night4: function(){ this.changeNight(4, 4, 1, 1, 1) },
	changeNight: function(night, women, marked, carrage, lantern){
		this.set({'night': night, 'womenCount': women, 'womenMarked': marked, 'carrage': carrage, 'lantern': lantern,})
		this.setWomen()
	},
	advanceTime: function(){
		this.set('time', this.get('time') + 1)
	},
	wait: function(){
		this.set('time', this.get('time') - 1)
	},
	randomBase: function(){
		this.setBase(_.random(0, map.key('number').length - 1))
	},
	setBase: function(id){
		let base = Number(map.key('number')[id])
		this.set('base', {'id': base, 'number': map[base].number})
	},
	setWomen: function(){
		this.randomTokens('womenTokens', 'murder', 'womenCount', 'womenMarked')
	},
	setWretched: function(){
		this.set('wretchedTokens', _.where(this.get('womenTokens'), {'marked': true}))
		this.set('womenTokens', [])
	},
	getWretched: function(id){
		return this.getToken(id, 'wretchedTokens')
	},
	murder(id){
		let mapId = this.getWretched(id).id
		this.setPush('murder', {'id': mapId, 'number': map[mapId].number, 'time': this.get('time')})
		this.move(mapId)
		this.set('wretchedTokens', [])
	},
	possibleMoves: function(){

	},
})

let Police = Character.extend({
	initialize: function(){
		this.set({
			'policeTokens': [],
			'policeCount': 7,
			'policeMarked': 5,
			'headOfInvestigation': false,
		})
	},
	setPolice: function(){
		this.randomTokens('policeTokens', 'station', 'policeCount', 'policeMarked')
	},
	checkPolice: function(id){
		let tokens = this.get('policeTokens')
		tokens[id].checked = true
		this.set('policeTokens', tokens)
	},
	possibleMoves: function(){
		
	},
})

let jack = new Jack();
let police = new Police();
police.set('headOfInvestigation', true)

police.setPolice()
jack.setWretched()

// police.checkPolice(3)
// jack.wait()

// jack.murder(3)

// jack.move(8)
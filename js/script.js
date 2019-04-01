const Character = Backbone.Model.extend({
	defaults: {
		path: [],
	},
	setPush: function(key, value){
		this.set(key, this.get(key).concat(value))
	},
	move: function(object){
		this.setPush('path', object)
	},
	setToken: function(id, marked, tokenKey, mapKey){
		let tokenId = Number(map.key(mapKey)[id])
		if (!_.contains(_.pluck(this.get(tokenKey), 'id'), tokenId)) {
			this.setPush(tokenKey, {'id': Number(tokenId), 'marked': marked})
			return true
		} else {
			return false // Same spot repeated
		}
	},
	getToken: function(id, tokenKey){
		if (id < this.get(tokenKey).length) {
			return this.get(tokenKey)[id]
		} else {
			return false // No token here
		}
	},
	moveToken: function(id, tokenKey, idNew){
		let tokens = this.get(tokenKey)
		tokens[id].id = idNew
		this.set(tokenKey, tokens)
		this.markToken(id, tokenKey, 'moved')
	},
	markToken: function(id, tokenKey, property){
		let tokens = this.get(tokenKey)
		tokens[id][property] = true
		this.set(tokenKey, tokens)
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

const Jack = Character.extend({
	initialize: function(){
		this.set({
			'womenTokens': [],
			'wretchedTokens': [],
			'murder': [],
			'clue': [],
			'time': 0,
		})
		this.night1()
	},
	night1: function(){ this.changeNight(1, 8, 5, 3, 2, 1) },
	night2: function(){ this.changeNight(2, 7, 4, 2, 2, 1) },
	night3: function(){ this.changeNight(3, 6, 3, 2, 1, 2) },
	night4: function(){ this.changeNight(4, 4, 1, 1, 1, 1) },
	changeNight: function(night, women, marked, carrage, lantern, murdersTonight){
		this.set({'night': night, 'womenCount': women, 'womenMarked': marked, 'carrage': carrage, 'lantern': lantern, 'murdersTonight': murdersTonight,})
		if (this.get('auto')) {
			this.setWomen()
		}
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
	murderWretched(id){
		let wretched = this.get('wretchedTokens')[id]
		if (!_.has(wretched, 'murdered')) {
			this.markToken(id, 'wretchedTokens', 'murdered')
			this.moveJack(wretched.id, false, false, true, false)
		} else {
			return false // Prevent murdering the same wretched twice
		}
	},
	setMurder(){
		// Note: Searching murdered wretched returns them in a different order to Jack's path
		let murderedWretched = _.where(this.get('wretchedTokens'), {'murdered': true})
		if (murderedWretched.length >= this.get('murdersTonight')){
			this.set('murder', murderedWretched)
			this.set('wretchedTokens', [])
			return true
		} else {
			return false // More murders required tonight
		}
	},
	murder: function(){
		if (this.setMurder()){
			return true
		} else {
			this.murderWretched(_.random(0, jack.get('wretchedTokens').length - 1))
			this.murder()
		}
	},
	moveJack: function(id, carrage, lantern, murder, base){
		this.move({'id': id, 'carrage': carrage, 'lantern': lantern, 'murder': murder, 'base': base})
	},
	possibleMoves: function(id){
		return map[id].adjacentNumber
	},
})

const Police = Character.extend({
	initialize: function(){
		this.set({
			'policeTokens': [],
			'policeCount': 7,
			'policeMarked': 5,
		})
	},
	setPolice: function(){
		this.randomTokens('policeTokens', 'station', 'policeCount', 'policeMarked')
	},
	checkPolice: function(id){
		this.markToken(id, 'policeTokens', 'checked')
	},
	movePolice: function(id, station){
		this.move({'id': id, 'station': station})
	},
	possibleMoves: function(){
		
	},
})

const Squad = Backbone.Collection.extend({
  model: Police
});

// let jack = new Jack()
// let police = new Police()
// police.set('let', true)

// police.setPolice()
// jack.setWretched()

// police.checkPolice(3)
// jack.wait()
// jack.possibleMoves(jack.getToken(0, 'wretchedTokens').id)
// jack.moveToken(0, 'wretchedTokens', 991)
// jack.moveToken(1, 'wretchedTokens', 992)
// jack.moveToken(2, 'wretchedTokens', 993)
// jack.moveToken(3, 'wretchedTokens', 994)

// jack.murder()

// jack.move(8)
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
})

let Jack = Character.extend({
	initialize: function(){
		this.set({
			'women': [],
			'wretched': [],
			'murder': [],
			'clue': [],
		})
		this.randomBase()
		this.night1()
	},
	night1: function(){
		this.set({'womenCount': 8, 'womenMarked': 5, 'carrage': 3, 'lantern': 2,})
		this.allRandomWomen()
	},
	night2: function(){
		this.set({'womenCount': 7, 'womenMarked': 4, 'carrage': 2, 'lantern': 2,})
		this.allRandomWomen()
	},
	night3: function(){
		this.set({'womenCount': 6, 'womenMarked': 3, 'carrage': 2, 'lantern': 1,})
		this.allRandomWomen()
	},
	night4: function(){
		this.set({'womenCount': 4, 'womenMarked': 1, 'carrage': 1, 'lantern': 1,})
		this.allRandomWomen()
	},
	randomBase: function(){
		this.setBase(_.random(0, map.key('number').length - 1))
	},
	setBase: function(id){
		let base = Number(map.key('number')[id])
		this.set('base', {'id': base, 'number': map[base].number})
	},
	allRandomWomen: function(){
		let self = this
		this.set('women', [])
		_.each(_.range(this.get('womenMarked')), function(){
			self.randomWomen(true)
		})
		_.each(_.range(this.get('womenCount') - this.get('womenMarked')), function(){
			self.randomWomen(false)
		})
		this.set('women', _.shuffle(this.get('women')))
	},
	randomWomen: function(marked){
		if (map.key('murder').length > this.get('women').length) {
			if (!this.setWomen(_.random(0, map.key('murder').length - 1), marked)) {
				this.randomWomen(marked)
			}
		} else {
			return false // Prevent infinate loop
		}
	},
	setWomen: function(id, marked){
		let womenId = Number(map.key('murder')[id])
		if (_.contains(_.pluck(this.get('women'), 'id'), womenId)) {
			return false // Don't use the same spot twice
		} else {
			this.setPush('women', {'id': Number(womenId), 'marked': marked})
			return true
		}
	},
	setWretched: function(){
		this.set('wretched', _.where(this.get('women'), {'marked': true}))
		this.set('women', [])
	},
	possibleMoves: function(){

	},
})

let Police = Character.extend({
	initialize: function(){
		this.set({
			'headOfInvestigation': false,
		})
	},
	newPolice: function(){
		
	},
	possibleMoves: function(){
		
	},
})

let jack = new Jack();
let police = new Police();

jack.randomBase()

// jack.setWretched()
// jack.move(8)
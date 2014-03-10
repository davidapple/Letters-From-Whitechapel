Letters to Whitechapel in Javascript
====================================

An attempt to simulate the popular bored game (by Gabriele Mari and Gianluca Santopietro), Letters to Whitechapel in JavaScript.

Aims
----

Have Jack the Ripper's movements controled by AI. Find clues and arrest him using the five police charaters.

Momement function
------

The current code is polluting the global namespace and must be transformed into a series of object literals, the most important controling movement accross the map. The movement object literal will operate as follows.

Advance array of routes r by one ID
```javascript
r = move.id(r)
```

Advance array of routes r to the next adjacent number
```javascript
r = move.number(r)
```

Advance array of routes r until the base (at ID 300) is reached, within the remaining number of moves possible
```javascript
r = move.base.routes(r, 300)
```
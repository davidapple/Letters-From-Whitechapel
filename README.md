Letters to Whitechapel in Javascript
====================================

An attempt to simulate the popular bored game (by Gabriele Mari and Gianluca Santopietro), Letters to Whitechapel in JavaScript.

Aims
----

Have Jack the Ripper's movements controled by AI. Find clues and arrest him using the five police charaters.

Momement function
------

The current code is polluting the global namespace and must be transformed into a series of object literals, the most important controling movement accross the map. The movement object literal will operate as follows.

Return an array of all routes from ID 76 to adjacent IDs
```javascript
movement.id(76)
```

Return an array of all shortest routes from ID 121 to adjacent IDs with numbers
```javascript
movement.number(121)
```

Return an array of all routes from ID 121 to ID 407 via 15 or less numbered IDs
```javascript
movement.route(121, 407, 15)
```
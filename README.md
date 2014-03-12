Letters to Whitechapel in Javascript
====================================

An attempt to simulate the popular bored game (by Gabriele Mari and Gianluca Santopietro), Letters to Whitechapel in JavaScript.

Aims
----

Have Jack the Ripper's movements controled by AI. Find clues and arrest him using the five police charaters.

Start function
--------------

Create a character at a certain ID
```javascript
jack = start(ID);
```

Move function
-------------

Advance an array of routes r.route by one ID
```javascript
jack.route = move.id(jack.route);
```

Advance an array of routes r.route to the next adjacent number
```javascript
jack.route = move.number(jack.route);
```

Route calculation
-----------------

The structure of a route variable
```javascript
jack.route[n] = [ID, ID, ID, ID, ID, ID];
jack.number[n] = [n, undefined, n, undefined, undefined, n];
jack.routeAmnesia[n] = [ID]; // Up to and including the last numbered ID
jack.safety[n] = [%, %, %, %, %, %];
```

Advance an array of routes to an ID
```javascript
jack = route.extensive(jack, ID);
```
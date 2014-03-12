Letters to Whitechapel in Javascript
====================================

An attempt to simulate the popular bored game (by Gabriele Mari and Gianluca Santopietro), Letters to Whitechapel in JavaScript.

Aims
----

Have Jack the Ripper's movements controled by AI. Find clues and arrest him using the five police charaters.

Start function
--------------

Create Jack at a certain ID
```javascript
start(jack, ID);
```

Move function
-------------

Advance an array of routes r.route by one ID
```javascript
r.route = move.id(r.route);
```

Advance an array of routes r.route to the next adjacent number
```javascript
r.route = move.number(r.route);
```

Route calculation
-----------------

The structure of a route variable
```javascript
r.route[n] = [ID, ID, ID, ID, ID, ID];
r.number[n] = [n, undefined, n, undefined, undefined, n];
r.routeAmnesia[n] = [ID]; // Up to and including the last numbered ID
r.safety[n] = [%, %, %, %, %, %];
```

Advance an array of routes to an ID
```javascript
r = route.extensive(r, ID);
```
Letters to Whitechapel in Javascript
====================================

An attempt to simulate the popular bored game (by Gabriele Mari and Gianluca Santopietro), Letters to Whitechapel in JavaScript.

Aims
----

Have Jack the Ripper's movements controled by AI. Find clues and arrest him using the five police charaters.

Move function
-------------

Advance an array of routes r by one ID
```javascript
r = move.id(r);
```

Advance an array of routes r to the next adjacent number
```javascript
r = move.number(r);
```

Route calculation
-----------------

The structure of a route variable
```javascript
r.route[#] = [ID, ID, ID, ID, ID, ID];
r.number[#] = [#, undefined, #, undefined, undefined, #];
r.routeAmnesia[#] = [ID]; // Up to and including the last numbered ID
r.safety[#] = [%, %, %, %, %, %];
```

Advance an array of routes to an ID
```javascript
r = route(r, ID);
```
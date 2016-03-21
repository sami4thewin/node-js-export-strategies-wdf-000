Node.js Export Strategies
---

## Overview

We've covered `module.exports` in broad strokes, but what about the finer
details? And what's up with being able to assign export properties directly to
the `exports` object?

At the end of this lesson, you'll be able to:

1. Explain the difference between `module.exports` and `exports`
2. Discuss ways for determining which strategy to use
3. Evaluate tradeoffs between one strategy and another
4. Recognize that, ultimately, the difference is one of style

## `module.exports`

Basically, you want to use `module.exports` when you want to export a function
or a constructor. (Remember that a constructor is just a function that expects
to be invoked with `new`: `new Constructor()`.)

```javascript
// lamp.js

const Lamp = function Lamp(maxBrightness) {
  this.currentBrightness = 0;
  this.maxBrightness = maxBrightness;
};

Lamp.prototype.brighten = function(amount) {
  amount = amount || 1;

  this.currentBrightness += amount;

  if (this.currentBrightness > this.maxBrightness) {
    this.currentBrightness = this.maxBrightness;
  }
};

Lamp.prototype.dim = function(amount) {
  amount = amount || 1;

  this.currentBrightness -= amount;

  if (this.currentBrightness < 0) {
    this.currentBrightness = 0;
  }
};

Lamp.prototype.turnOff = function() {
  this.currentBrightness = 0;
};

Lamp.prototype.turnOn = function() {
  this.currentBrightness = this.maxBrightness;
};
```

When you `require` a module that exports in this way, you'll be getting the
whole shebang:

```javascript
// living_room.js

const Lamp = require('./lamp');
const myLamp = new Lamp(10);
```

Erm, wait a sec. Did you just get an error? `TypeError: Lamp is not a function`?
While this error is an improvement over JavaScript's infamous `undefined is not
a function`, it doesn't help us very much. Looking back over our code in
`lamp.js`, let's figure out where we went wrong.

Turns out, we didn't export anything from `lamp.js`. If we want to make a class
available elsewhere, we need to tell Node.js explicitly what we're exporting
from the file. We do this by modifying `module.exports`. Since we want to export
the entire `Lamp` constructor in `lamp.js`, we can add the following to the
bottom of the file:

```javascript
module.exports = Lamp.js;
```

Now, if we go back to `living_room.js`, and try to run our code again:

```javascript
// living_room.js

const Lamp = require('./lamp');
const myLamp = new Lamp(10);

// prints 0
console.log(myLamp.currentBrightness);

myLamp.turnOn();

// prints 10
console.log(myLamp.currentBrightness);
```

It works!

## `exports.property`

Conversely, use `exports.myProperty` (where `myProperty` has a better name) when
you want to export multiple props.

```javascript
// power.js

exports.outage = function outage(device) {
  device.currentBrightness = device.maxBrightness = 0;

  console.log(`Uh-oh, ${device.constructor.name}'s power is out.
    Try turning it on and checking its \`currentBrightness\`.`);
};

exports.surge = function surge(device) {
  if (device.currentBrightness > 0) {
    device.currentBrightness = device.maxBrightness * 10;

    console.log(`${device.constructor.name} is surging!
      Current brightness: ${device.currentBrightness}`);
  }
};
```

Here, we're exporting two functions, `outage()` and `surge()` as properties of
the `power.js` module. When we `require` it, we access them just like we access
properties of any other object.

```javascript
// living_room.js

// Note that we can call each module whatever
// we want!
const Decor = require('./lamp');
const powerEvents = require('./power');

const myLamp = new Decor(10);

myLamp.turnOn();

console.log(`myLamp's current brightness: ${myLamp.currentBrightness}`);

power.surge(myLamp);
power.outage(myLamp);

myLamp.turnOn();

console.log(`myLamp's current brightness: ${myLamp.currentBrightness}`);
```

## Export All the Things!

Note that you aren't limited to exporting functions. You can export any valid
bit of JavaScript. Thus:

```javascript
// power_limits.js

module.exports = {
  type: 'Lamp',
  maxBrightness: 20
};
```

Now if you `require` that module

```javascript
// be sure to require it relative to your process
const powerLimits = require('./power_limits');
```

you can access its properties:

```javascript
// 'Lamp'
powerLimits.type;

// 20
powerLimits.maxBrightness;
```

Hmmm — look familiar? I wonder if we can rewrite `power_limits.js` to export
properties:

```javascript
// power_limits.js

exports.type = 'Lamp';
exports.maxBrightness = 20;
```

Now restart your process (or run your script again) it again and check the
results:

```javascript
const powerLimits = require('./power_limits');

// 'Lamp'
powerLimits.type;

// 20
powerLimits.maxBrightness;
```

And everything will work exactly as before.

## When will I ever even use this?

Admittedly, the above examples are a bit contrived in the name of being easy to
run anywhere. With a view towards building an actual application, you might be
wondering how to decide which exports pattern to use.

The good news is, it's up to you. There isn't really a right or wrong answer,
and there are good reasons for each approach.

Let's say that you have a module that handles connecting to a database. You
might, to start, export the whole `Database` (a constructor that holds your
connection info):

```javascript
// database.js

// `pg` is a Node.js module for interacting
// with PostgreSQL databases
// https://github.com/brianc/node-postgres
const pg = require('pg');

function Database(url, config) {
  this.url = url;
  this.config = config;
};

Databse.prototype.query = function(queryString, callback) {
  pg.connect(this.url, (err, client, done) => {
    if (err) {
      done();
      return callback(err);
    }

    client.query.apply(queryString, (err, result) => {
      callback(err, result);
      done();
    });
  });
};

module.exports = Database;
```

Now you have a `Database` that you can pass around willy-nilly:

```javascript
// app.js

const Database = require('./database.js');

const db = new Database('postgres://localhost/my_database');

db.query('select * from foo where foo.bar = 1', (err, result) => {
  if (err) {
    return console.error(err);
  }

  console.log(result);
});
```

But maybe you don't want to keep track of all of that additional state — and,
with this implementation, you might end up making too many connections to the
database! (`pg` will actually prevent you from doing this, but suppose it _didn't_.)

If you have those concerns, and if you want to expose just a limited set of
functionality instead of a massive interface, you can export just the
functionality that you need elsewhere.

```javascript
// database_config.js

module.exports = {
  database: 'my_database',
  host: 'localhost',
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
  user: process.env.DATABASE_USER
};
```

```javascript
// database.js

const pg = require('pg');

// WHOA! Inline `require`!
const client = new pg.Client(require('./database_config'));

exports.query = function(queryString, callback) {
  pg.connect(this.url, (err, client, done) => {
    if (err) {
      done();
      return callback(err);
    }

    client.query(queryString, (err, result) => {
      callback(err, result);
      done();
    });
  });
};
```

Now we're only exposing the `query()` function, so other parts of our
application can't affect the database connection.

```javascript
// app.js

const db = require('./database');

// Notice that there's no configuration or initialization
// happening here -- we just jump straight to the query.

db.query('select * from foo where foo.bar = 1', (err, result) => {
  if (err) {
    return console.error(err);
  }

  console.log(result);
});
```

Pretty cool, right? You'll most likely end up playing around with both
approaches in the applications that you build, figuring out how you like to use
each one in different circumstances. What matters more than anything is that
your code is readable, easy to use, and easy to understand.

## A Final Note

As the [Node.js docs themselves say](https://nodejs.org/api/modules.html#modules_exports_alias),
feel free to use `module.exports` for everything — when you want to export
properties, simply export an object: `module.exports = { foo: 'foo', bar: 1 }`.

Ultimately, `module.exports` versus `exports` is a matter of style —
semantically, they're basically the same.


## Resources

- Node.js `module.exports`: https://nodejs.org/api/modules.html#modules_module_exports
- Node.js `exports` alias: https://nodejs.org/api/modules.html#modules_exports_alias

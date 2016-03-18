Node.js Export Strategies
---

## Overview

We've covered `module.exports` in broad strokes, but what about the finer details?
And what's up with being able to assign export properties directly to the `exports`
object?

## `module.exports`

Basically, you want to use `module.exports` when you want to export a function or a constructor.
(Remember that a constructor is just a function that expects to be invoked with `new`: `new Constructor()`.)

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

module.exports = Lamp;
```

When you `require` a module that exports in this way, you'll be getting the
whole shebang:

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

## Resources

- Node.js `module.exports`: https://nodejs.org/api/modules.html#modules_module_exports
- Node.js `exports` alias: https://nodejs.org/api/modules.html#modules_exports_alias

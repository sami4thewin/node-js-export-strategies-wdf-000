const Lamp = require('./lamp');
const power = require('./power');
const powerLimits = require('./power_limits');

const myLamp = new Lamp(powerLimits.maxBrightness);

myLamp.turnOn();

console.log(`myLamp's current brightness: ${myLamp.currentBrightness}`);

power.surge(myLamp);
power.outage(myLamp);

myLamp.turnOn();

console.log(`myLamp's current brightness: ${myLamp.currentBrightness}`);

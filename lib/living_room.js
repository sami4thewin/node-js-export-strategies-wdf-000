// const Lamp = require('./lamp');
// const myLamp = new Lamp(10);
//
// console.log(myLamp.currentBrightness);
//
// myLamp.turnOn();
//
// // prints 10
// console.log(myLamp.currentBrightness);


const Decor = require('./lamp');
const powerEvents = require('./power');
const powerLimits = require('./power_limits');

const myLamp = new Decor(10);

myLamp.turnOn();

console.log(`myLamp's current brightness: ${myLamp.currentBrightness}`);
power.surge(myLamp);
power.outage(myLamp);
myLamp.turnOn();
console.log(`myLamp's current brightness: ${myLamp.currentBrightness}`);

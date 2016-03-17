Node.js Export Strategies
---

## Overview

We've covered `module.exports` in broad strokes, but what about the finer details?
And what's up with being able to assign export properties directly to the `exports`
object?

## `module.exports`

Basically, you want to use `module.exports` when you want to export a function or a constructor.
(Remember that a constructor is just a function that expects to be invoked with `new`: `new Constructor()`.)

Conversely, use `exports.myProperty` (where `myProperty` has a better name) when
you want to export multiple props.

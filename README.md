# Modern Caps Lock

Modern Caps Lock provides an easy way to check whether Caps Lock is active, and it allows you to run your code whenever the Caps Lock state changes.

1. [Installation](#installation)
2. [API](#api)
   1. [`onCapsLockChange`](#oncapslockchange)
      1. [Arguments](#arguments)
      2. [Return value](#return-value)
   2. [`isCapsLockOn`](#iscapslockon)
      1. [Arguments](#arguments-1)
      2. [Return value](#return-value-1)
3. [Examples](#examples)
   1. [Print Caps Lock state after every change](#print-caps-lock-state-after-every-change)
   2. [Get current Caps Lock state](#get-current-caps-lock-state)
4. [Support](#support)
   1. [Supported Platforms](#supported-platforms)
   2. [Unsupported Platforms](#unsupported-platforms)
5. [Limitations](#limitations)
6. [Credits](#credits)

### Installation

Example installation with npm:

```
npm install @leonabcd123/modern-caps-lock
```

### API

#### onCapsLockChange

Runs the provided callback function whenever the Caps Lock state changes.

##### Arguments

`callback: (capsState: boolean) => void`: a function that takes one argument (`capsState`) and returns nothing. This function is executed after every Caps Lock state change.

##### Return value

`void`.

#### isCapsLockOn

Returns the current Caps Lock state.

##### Arguments

None.

##### Return value

`capsState: boolean`: a boolean indicating whether Caps Lock is on. If `true`, Caps Lock is on; if `false`, Caps Lock is off.


### Examples

##### Print Caps Lock state after every change
```js
import { onCapsLockChange } from "@leonabcd123/modern-caps-lock";

onCapsLockChange((capsState) => {
  console.log(`Caps Lock is ${capsState ? "on" : "off"}`);
});

```

##### Get current Caps Lock state
```js
import { isCapsLockOn } from "@leonabcd123/modern-caps-lock";

if (isCapsLockOn()) {
  console.log("Caps Lock is on!");
} else {
  console.log("Caps Lock is off!");
}
```

### Support

##### Supported Platforms

- Windows
- Mac
- Linux
- iPad

##### Unsupported Platforms

- Platforms using [GBoard](https://en.wikipedia.org/wiki/Gboard)

### Limitations

Because of browser limitations, we can only detect the Caps Lock state after a KeyboardEvent
or MouseEvent occurs. We currently detect updates to the Caps Lock state when the following events are fired:

- keydown
- keyup
- mousedown
- mousemove
- wheel

Until one of these events is fired, the Caps Lock state defaults to `false`.

### Credits

Created by [Leon](https://github.com/Leonabcd123) and [fehmer](https://github.com/fehmer).

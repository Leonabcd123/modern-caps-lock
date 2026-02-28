# Modern Caps Lock

Modern Caps Lock provides an easy way to check whether Caps Lock is active or not, and it allows you to run your code whenever Caps Lock state changes.

### Installation

Example installation with npm:

```
npm install @leonabcd123/modern-caps-lock
```

### API

#### onCapsLockChange()

Runs the provided callback function whenever Caps Lock state is changed.

##### Arguments

`callback: (capsState: boolean) => void`: a function that takes one argument (`capsState`) and returns nothing. This function is executed after every Caps Lock state change.

##### Return value

`void`.

#### isCapsLockOn()

Returns the current Caps Lock state.

##### Arguments

None.

##### Return value

`capsState: boolean`: a boolean representing the current Caps Lock state. If `true`, Caps Lock is on; if `false`, Caps Lock is off.


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

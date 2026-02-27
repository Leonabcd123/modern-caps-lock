# Modern Caps Lock

Modern Caps Lock provides an easy way to know whether Caps Lock is currently active or not, and it allows you run your code whenever Caps Lock state is changed.

### Installation

Example installation with npm:

```
npm install "@leonabcd123/modern-caps-lock"
```

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

if (isCapsLockOn()){
  console.log("Caps Lock is on!");
} else {
  console.log("Caps Lock is off!");
}
```

import { getCurrentOs } from "./os-detection.js";

let capsState = false;
const os = getCurrentOs();
type OnCapsChangeCallback = (capsState: boolean) => void;
const onCapsChangeCallbacks: OnCapsChangeCallback[] = [];
// All events that fire a MouseEvent (or events that inherit from MouseEvent, such as WheelEvent) for which we want to update capsState.
const mouseEventsToUpdateOn = ["mousedown", "mousemove", "wheel"] as const;
const isMobile =
  // @ts-expect-error navigator.userAgentData is only supported on Chrome/Edge/Opera.
  navigator.userAgentData?.mobile ?? navigator.maxTouchPoints > 1;
const isiPad = os === "Mac" && isMobile;
/*
 * This determines whether we ignore the result of getCapsLockModifierState or not when receiving a keyup event for a key which isn't Caps Lock on iPad.
 * This is because an iPad with the default virtual keyboard doesn't send Caps Lock state on any keypress which isn't Caps Lock.
 * However, macOS (on desktop) and an iPad with external keyboard do send Caps Lock state.
 */
let isSendingCapsLockState = !isiPad;
const afterKeyup = new Map();

/**
 * Sets the Caps Lock state and calls the previously provided callback function if Caps Lock
 * state has changed.
 */
function setCapsState(newCapsState: boolean): void {
  if (capsState !== newCapsState) {
    capsState = newCapsState;
    onCapsChangeCallbacks.forEach((callback) => callback(capsState));
  }
}

/**
 * Get the current Caps Lock state based on the getModifierState function.
 *
 * @param event - The event used to check the Caps Lock state
 * @returns The current Caps Lock state.
 */
function getCapsLockModifierState(event: KeyboardEvent | MouseEvent): boolean {
  /*
   * Autofill in Chrome/Edge can send type Event that will still trigger the keydown and keyup event listeners.
   * Type Event doesn't have the getModifierState method (only KeyboardEvent and MouseEvent do), so use optional chaining when calling getModifierState.
   * See https://github.com/microsoft/monaco-editor/issues/4325
   */
  return event.getModifierState?.("CapsLock") ?? capsState;
}

mouseEventsToUpdateOn.forEach((eventType) => {
  document.addEventListener(eventType, (event: MouseEvent) => {
    // All platforms except iPad and Android send correct state on MouseEvent.
    if (!isiPad) {
      const currentCapsState = getCapsLockModifierState(event);
      // If Android sends Caps State: off, we allow that, because that means it's using
      // Virtual keyboard. When using external keyboard, Android will always send Caps
      // State: on when MouseEvent is fired.
      if (!isMobile || !currentCapsState) {
        setCapsState(currentCapsState);
      }
    }
  });
});

document.addEventListener("keyup", (event) => {
  const setAfterKeyupValue = afterKeyup.get(event.code);
  if (setAfterKeyupValue !== undefined) {
    setCapsState(setAfterKeyupValue);
    afterKeyup.delete(event.code);
    return;
  }
  if (os === "Mac") {
    // macOS sends only keydown when enabling Caps Lock and only keyup when disabling.
    if (event.key === "CapsLock") {
      setCapsState(false);
      return;
    }
    /*
     * The iPad's default virtual keyboard doesn't send Caps Lock state on any keypress which isn't Caps Lock,
     * So to decide whether to ignore Caps Lock state on other keypresses,
     * We check whether getCapsLockModifierState has ever returned true.
     * When Caps Lock is pressed, handle it the same as on macOS.
     */
    const currentCapsState = getCapsLockModifierState(event);
    if (isSendingCapsLockState || currentCapsState) {
      // macOS sends correct state on keyup.
      setCapsState(currentCapsState);
      isSendingCapsLockState = true;
    }
  } else if (os === "Windows") {
    // Windows always sends the correct state on keyup (for Caps Lock and for regular keys).
    setCapsState(getCapsLockModifierState(event));
  } else if (event.key !== "CapsLock" && event.key !== "Unidentified") {
    // Check whether key is Unidentified because GBoard sends Unidentified keypresses
    // Which don't have Caps State.
    // Linux on Wayland and Linux with Chromium on X11/Xwayland send the correct Caps Lock state on keyup if the key isn't Caps Lock.
    setCapsState(getCapsLockModifierState(event));
  }
});

document.addEventListener("keydown", (event) => {
  if (os === "Mac") {
    // macOS sends only keydown when enabling Caps Lock and only keyup when disabling.
    if (event.key === "CapsLock") {
      setCapsState(true);
    }
  } else if (os === "Linux") {
    /*
     * Linux on Wayland sends the correct Caps Lock state before toggling Caps Lock
     * on keydown, so we invert the Caps Lock state to get the state after the toggle.
     * On keyup, Linux on Wayland always sends `true` for Caps Lock state when toggling
     * Caps Lock.
     *
     * Linux with Firefox on X11/Xwayland sends the correct Caps Lock state for all keys
     * on keyup and always sends `true` for Caps Lock state on keydown when toggling
     * Caps Lock. Unfortunately, we can't differentiate between Wayland and X11/Xwayland,
     * so we currently only support Wayland.
     *
     * Linux with Chromium on X11/Xwayland has the same Caps Lock behavior as Linux on
     * Wayland, so it's also supported.
     */
    if (event.key === "CapsLock") {
      /* Defer change to be ran when Caps Lock is released. This is to prevent the
       * following case from returning an incorrect value:
       *
       * 1. Enable Caps Lock
       * 2. Press and hold Caps Lock
       * 3. Press another key and release it
       * 4. Release Caps Lock
       *
       * Without deferring, this would cause `capsState` to stay `true`, because the
       * change made here would be overridden by the change to the Caps Lock state when
       * the other key releases. Deferring the change makes it run after the other key
       * releases and changes the Caps Lock state.
       */

      afterKeyup.set(event.code, !getCapsLockModifierState(event));
    }
  }
});

/**
 * Returns the current Caps Lock state.
 *
 * @returns The current Caps Lock state.
 */
function isCapsLockOn(): boolean {
  return capsState;
}

/**
 * Sets up a callback function to be called whenever Caps Lock state changes.
 *
 * @param callback - The callback function
 */
function onCapsLockChange(callback: OnCapsChangeCallback): void {
  onCapsChangeCallbacks.push(callback);
}

export { isCapsLockOn, onCapsLockChange };

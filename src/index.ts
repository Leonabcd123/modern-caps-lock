import { getCurrentOs } from "./os-detection.js";

let previousCapsState = false;
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

/**
 * Calls the previously provided callback function when Caps Lock state changes.
 */
function callCallbackIfNeeded(): void {
  const callCallback = previousCapsState !== capsState;
  previousCapsState = capsState;
  if (callCallback) {
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
        capsState = currentCapsState;
        callCallbackIfNeeded();
      }
    }
  });
});

document.addEventListener("keyup", (event) => {
  if (os === "Mac") {
    // macOS sends only keydown when enabling Caps Lock and only keyup when disabling.
    if (event.key === "CapsLock") {
      capsState = false;
    } else {
      /*
       * The iPad's default virtual keyboard doesn't send Caps Lock state on any keypress which isn't Caps Lock,
       * So to decide whether to ignore Caps Lock state on other keypresses,
       * We check whether getCapsLockModifierState has ever returned true.
       * When Caps Lock is pressed, handle it the same as on macOS.
       */
      const currentCapsState = getCapsLockModifierState(event);
      if (isSendingCapsLockState || currentCapsState) {
        // macOS sends correct state on keyup.
        capsState = currentCapsState;
        isSendingCapsLockState = true;
      }
    }
  } else if (os === "Windows") {
    // Windows always sends the correct state on keyup (for Caps Lock and for regular keys).
    capsState = getCapsLockModifierState(event);
  } else if (event.key !== "CapsLock" && event.key !== "Unidentified") {
    // Check whether key is Unidentified because GBoard sends Unidentified keypresses
    // Which don't have Caps State.
    // Linux sends the correct state on keyup if the key isn't Caps Lock.
    capsState = getCapsLockModifierState(event);
  }
  callCallbackIfNeeded();
});

document.addEventListener("keydown", (event) => {
  if (os === "Mac") {
    // macOS sends only keydown when enabling Caps Lock and only keyup when disabling.
    if (event.key === "CapsLock") {
      capsState = true;
      callCallbackIfNeeded();
    }
  } else if (os === "Linux") {
    /*
     * Linux sends the correct state before Caps Lock is toggled only on keydown,
     * so we invert the modifier state.
     */
    if (event.key === "CapsLock") {
      capsState = !getCapsLockModifierState(event);
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

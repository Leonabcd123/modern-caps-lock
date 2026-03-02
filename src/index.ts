/**
 * Checks whether the user is running some operating system.
 *
 * @param osName - The operating system name (as it appears in navigator.platform)
 * @returns whether the user is running that operating system or not
 */
function isPlatform(osName: string): boolean {
  // @ts-expect-error userAgentData is experimental, only supported on Chrome/Edge/Opera.
  // Fallback to navigator.platform when dealing with other browsers. 
  return ((navigator.userAgentData ?? navigator).platform).toLowerCase().startsWith(osName);
}

/**
 * Gets the current operating system the user is running.
 *
 * @returns the operating system the user is running
 */
function getCurrentOs(): "Mac" | "Linux" | "Windows" | "Unknown" {
  if (isPlatform("mac")) {
    return "Mac";
  }
  if (isPlatform("linux")) {
    return "Linux";
  }
  if (isPlatform("win")) {
    return "Windows";
  }
  return "Unknown";
}

let previousCapsState = false;
let capsState = false;
const os = getCurrentOs();
let onCapsChangeCallback: (capsState: boolean) => void;
// All events that fire a MouseEvent that we want to update capsState when they're fired.
const mouseEventsToUpdateOn = ["mousedown", "mousemove", "wheel"];

/**
 * Calls the previously provided callback function when Caps Lock state changes.
 */
function callCallbackIfNeeded(): void {
  const callCallback = previousCapsState !== capsState;
  previousCapsState = capsState;
  if (callCallback) {
    onCapsChangeCallback?.(capsState);
  }
}

/**
 * Get the current Caps Lock state based on the getModifierState function.
 *
 * @param event - The event used to check the Caps Lock state
 * @returns The current Caps Lock state.
 */
function getCapsLockModifierState(event: KeyboardEvent | MouseEvent): boolean {
  // Need this check because autofill in Chrome/Edge can send type Event that will still trigger the keydown and keyup event listeners.
  // See https://github.com/microsoft/monaco-editor/issues/4325
  if ("getModifierState" in event) {
    return event.getModifierState("CapsLock");
  } else {
    return capsState;
  }
}

mouseEventsToUpdateOn.forEach((eventType) => {
  document.addEventListener(eventType, (event) => {
    if (event instanceof MouseEvent) {
      // All platforms send correct state on MouseEvent
      capsState = getCapsLockModifierState(event);
      callCallbackIfNeeded();
    }
  });
});

document.addEventListener("keyup", (event) => {
  if (os === "Mac") {
    // macOS sends only keydown when enabling Caps Lock and only keyup when disabling.
    if (event.key === "CapsLock") {
      capsState = false;
    } else {
      // IPad doesn't send caps state on any keypress which isn't Caps Lock,
      // So don't update caps state on any keypress which isn't Caps Lock.
      // When Caps Lock is pressed handle it the same as on macOS.
      if (navigator.maxTouchPoints <= 1) {
        // macOS sends correct state on keyup.
        capsState = getCapsLockModifierState(event);
      }
    }
  } else if (os === "Windows") {
    // Windows always sends the correct state on keyup (for Caps Lock and for regular keys).
    capsState = getCapsLockModifierState(event);
  } else if (event.key !== "CapsLock") {
    // Linux sends the correct state on keyup if key isn't Caps Lock.
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
    /* Linux sends the correct state before Caps Lock is toggled only on keydown,
     * so we invert the modifier state.
     */
    if (event.key === "CapsLock") {
      capsState = !getCapsLockModifierState(event);
    }
  }
});

/**
 * Returns the current Caps Lock state.
 */
export function isCapsLockOn(): boolean {
  return capsState;
}

/**
 * Sets up a callback function to be called whenever Caps Lock state changes.
 *
 * @param callback - The callback function
 */
export function onCapsLockChange(callback: (capsState: boolean) => void): void {
  onCapsChangeCallback = callback;
}

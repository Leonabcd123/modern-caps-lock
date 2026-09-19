import { getPlatformInfo, type Os } from "./platform-detection.js";

const CAPS_LOCK = "CapsLock";

type OnCapsChangeCallback = (capsState: boolean) => void;
const onCapsChangeCallbacks: OnCapsChangeCallback[] = [];
let capsState = false;
const { os, isMobile } = getPlatformInfo();

if (os !== "Unknown") {
  // All events that fire a MouseEvent (or events that inherit from MouseEvent, such as WheelEvent) for which we want to update capsState.
  const mouseEventsToUpdateOn = ["mousedown", "mousemove", "wheel"] as const;

  type HandlerResult = boolean | null;
  type Handler<E extends KeyboardEvent | MouseEvent> = (event: E) => HandlerResult;

  type Handlers = {
    onKeydown: Handler<KeyboardEvent>;
    onKeyup: Handler<KeyboardEvent>;
    // IPad never trusts mouse events, so there's no reason to add the mouse event
    // listeners. We set the handler to "skip" to signify that.
    onMouse: Handler<MouseEvent> | "skip";
  };

  const windowsHandler = (event: KeyboardEvent | MouseEvent) => {
    // Windows always sends the correct Caps Lock state on both keyup and keydown
    // (for Caps Lock and for regular keys).
    return getCapsLockModifierState(event);
  };

  function createWindowsHandlers(): Handlers {
    return {
      onKeydown: windowsHandler,
      onKeyup: windowsHandler,
      onMouse: windowsHandler,
    };
  }

  function createLinuxHandlers(): Handlers {
    // On Linux, caps lock disabling is deferred to keyup.
    let disableCapsOnCapsKeyup = false;

    return {
      onKeydown: (event) => {
        if (event.key === CAPS_LOCK && disableCapsOnCapsKeyup) {
          disableCapsOnCapsKeyup = false;
        }

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
        if (event.key === CAPS_LOCK) {
          const flippedCapsState = !getCapsLockModifierState(event);

          if (flippedCapsState) {
            return true;
          } else {
            /*
             * When disabling Caps Lock on Linux, Caps Lock only actually disables when it's released (keyup),
             * but we can only detect Caps Lock state on keydown, so we defer the state
             * to be updated on keyup, when Caps Lock is released.
             */
            disableCapsOnCapsKeyup = true;
          }
        }
        return null;
      },
      onKeyup: (event) => {
        if (event.key === CAPS_LOCK && disableCapsOnCapsKeyup) {
          disableCapsOnCapsKeyup = false;
          return false;
        }

        if (event.key !== CAPS_LOCK && event.key !== "Unidentified") {
          // Check whether key is Unidentified because GBoard sends Unidentified keypresses
          // Which don't have Caps State.
          // Linux on Wayland and Linux with Chromium on X11/Xwayland send the correct Caps Lock state on keyup if the key isn't Caps Lock.
          return getCapsLockModifierState(event);
        }
        return null;
      },
      onMouse: (event) => {
        const currentCapsState = getCapsLockModifierState(event);
        // If Android sends Caps State: off, we allow that, because that means it's using
        // Virtual keyboard. When using external keyboard, Android will always send Caps
        // State: on when MouseEvent is fired.
        if (!isMobile || !currentCapsState) {
          return currentCapsState;
        }
        return null;
      },
    };
  }

  function createMacHandlers(): Handlers {
    /*
     * This determines whether we ignore the result of getCapsLockModifierState or not when receiving a keyup event for a key which isn't Caps Lock on iPad.
     * This is because an iPad with the default virtual keyboard doesn't send Caps Lock state on any keypress which isn't Caps Lock.
     * However, macOS (on desktop) and an iPad with external keyboard do send Caps Lock state.
     */
    let isSendingCapsLockState = !isMobile;

    return {
      onKeydown: (event) => {
        // macOS with chromium sends only keydown when enabling Caps Lock and only keyup when disabling.
        // When using firefox, it sends keydown for both enabling and disabling.
        if (event.key === CAPS_LOCK) {
          return getCapsLockModifierState(event);
        }
        return null;
      },
      onKeyup: (event) => {
        // macOS with chromium sends only keydown when enabling Caps Lock and only keyup when disabling.
        if (event.key === CAPS_LOCK) {
          return false;
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
          isSendingCapsLockState = true;
          return currentCapsState;
        }
        return null;
      },
      // iPad doesn't send correct state on MouseEvent.
      onMouse: isMobile
        ? "skip"
        : (event) => {
            return getCapsLockModifierState(event);
          },
    };
  }

  const platformHandlers: Record<Exclude<Os, "Unknown">, () => Handlers> = {
    Windows: createWindowsHandlers,
    Linux: createLinuxHandlers,
    Mac: createMacHandlers,
  };

  const { onKeydown, onKeyup, onMouse } = platformHandlers[os]();
  /**
   * Sets the Caps Lock state and calls the previously provided callback function if Caps Lock
   * state has changed.
   */
  function setCapsState(newCapsState: HandlerResult): void {
    if (newCapsState === null) return;
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
    return event.getModifierState(CAPS_LOCK);
  }

  if (onMouse !== "skip") {
    mouseEventsToUpdateOn.forEach((eventType) => {
      document.addEventListener(
        eventType,
        (event: MouseEvent) => {
          setCapsState(onMouse(event));
        },
        { passive: true },
      );
    });
  }

  function addKeyboardListener(type: "keydown" | "keyup", handler: Handler<KeyboardEvent>): void {
    document.addEventListener(type, (event: Event) => {
      /*
       * Autofill in Chrome/Edge can send a keydown/keyup event of type Event that
       * will still trigger the keydown/keyup event listener, but we only care about
       * keyboard events.
       * See https://github.com/microsoft/monaco-editor/issues/4325
       */
      if (!(event instanceof KeyboardEvent)) return;
      setCapsState(handler(event));
    });
  }

  addKeyboardListener("keydown", onKeydown);
  addKeyboardListener("keyup", onKeyup);
}

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

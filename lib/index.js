import { getPlatformInfo } from "./platform-detection.js";
const CAPS_LOCK = "CapsLock";
const onCapsChangeCallbacks = [];
let capsState = false;
const { os, isMobile } = getPlatformInfo();
if (os !== "Unknown") {
    function getCapsLockModifierState(event) {
        return event.getModifierState(CAPS_LOCK);
    }
    const mouseEventsToUpdateOn = ["mousedown", "mousemove", "wheel"];
    function createWindowsHandlers() {
        return {
            onKeydown: getCapsLockModifierState,
            onKeyup: getCapsLockModifierState,
            onMouse: getCapsLockModifierState,
        };
    }
    function createLinuxHandlers() {
        let disableCapsOnCapsKeyup = false;
        return {
            onKeydown: (event) => {
                if (event.key !== CAPS_LOCK)
                    return null;
                const isEnabling = !getCapsLockModifierState(event);
                disableCapsOnCapsKeyup = !isEnabling;
                return isEnabling ? true : null;
            },
            onKeyup: (event) => {
                if (event.key === CAPS_LOCK) {
                    const shouldDisable = disableCapsOnCapsKeyup;
                    disableCapsOnCapsKeyup = false;
                    return shouldDisable ? false : null;
                }
                return event.key === "Unidentified"
                    ? null
                    : getCapsLockModifierState(event);
            },
            onMouse: (event) => {
                const currentCapsState = getCapsLockModifierState(event);
                if (!isMobile || !currentCapsState) {
                    return currentCapsState;
                }
                return null;
            },
        };
    }
    function createMacHandlers() {
        let isSendingCapsLockState = !isMobile;
        return {
            onKeydown: (event) => {
                return event.key === CAPS_LOCK ? getCapsLockModifierState(event) : null;
            },
            onKeyup: (event) => {
                if (event.key === CAPS_LOCK) {
                    return false;
                }
                const currentCapsState = getCapsLockModifierState(event);
                if (isSendingCapsLockState || currentCapsState) {
                    isSendingCapsLockState = true;
                    return currentCapsState;
                }
                return null;
            },
            onMouse: isMobile ? undefined : getCapsLockModifierState,
        };
    }
    const platformHandlers = {
        Windows: createWindowsHandlers,
        Linux: createLinuxHandlers,
        Mac: createMacHandlers,
    };
    const { onKeydown, onKeyup, onMouse } = platformHandlers[os]();
    function setCapsState(newCapsState) {
        if (newCapsState === null || newCapsState === capsState)
            return;
        capsState = newCapsState;
        onCapsChangeCallbacks.forEach((callback) => callback(capsState));
    }
    if (onMouse) {
        mouseEventsToUpdateOn.forEach((eventType) => {
            document.addEventListener(eventType, (event) => {
                setCapsState(onMouse(event));
            }, { passive: true });
        });
    }
    function addKeyboardListener(type, handler) {
        document.addEventListener(type, (event) => {
            if (!(event instanceof KeyboardEvent))
                return;
            setCapsState(handler(event));
        });
    }
    addKeyboardListener("keydown", onKeydown);
    addKeyboardListener("keyup", onKeyup);
}
function isCapsLockOn() {
    return capsState;
}
function onCapsLockChange(callback) {
    onCapsChangeCallbacks.push(callback);
}
export { isCapsLockOn, onCapsLockChange };

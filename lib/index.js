import { getPlatformInfo } from "./platform-detection.js";
const CAPS_LOCK = "CapsLock";
const onCapsChangeCallbacks = [];
let capsState = false;
const { os, isMobile } = getPlatformInfo();
if (os !== "Unknown") {
    const mouseEventsToUpdateOn = ["mousedown", "mousemove", "wheel"];
    const windowsHandler = (event) => {
        return getCapsLockModifierState(event);
    };
    function createWindowsHandlers() {
        return {
            onKeydown: windowsHandler,
            onKeyup: windowsHandler,
            onMouse: windowsHandler,
        };
    }
    function createLinuxHandlers() {
        let disableCapsOnCapsKeyup = false;
        return {
            onKeydown: (event) => {
                if (event.key === CAPS_LOCK && disableCapsOnCapsKeyup) {
                    disableCapsOnCapsKeyup = false;
                }
                if (event.key === CAPS_LOCK) {
                    const flippedCapsState = !getCapsLockModifierState(event);
                    if (flippedCapsState) {
                        return true;
                    }
                    else {
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
                    return getCapsLockModifierState(event);
                }
                return null;
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
                if (event.key === CAPS_LOCK) {
                    return getCapsLockModifierState(event);
                }
                return null;
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
            onMouse: isMobile
                ? "skip"
                : (event) => {
                    return getCapsLockModifierState(event);
                },
        };
    }
    const platformHandlers = {
        Windows: createWindowsHandlers,
        Linux: createLinuxHandlers,
        Mac: createMacHandlers,
    };
    const { onKeydown, onKeyup, onMouse } = platformHandlers[os]();
    function setCapsState(newCapsState) {
        if (newCapsState === null)
            return;
        if (capsState !== newCapsState) {
            capsState = newCapsState;
            onCapsChangeCallbacks.forEach((callback) => callback(capsState));
        }
    }
    function getCapsLockModifierState(event) {
        return event.getModifierState(CAPS_LOCK);
    }
    if (onMouse !== "skip") {
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

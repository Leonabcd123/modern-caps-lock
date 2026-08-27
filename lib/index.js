var _a, _b;
import { getCurrentOs } from "./os-detection.js";
const CAPS_LOCK = "CapsLock";
const onCapsChangeCallbacks = [];
let capsState = false;
const os = getCurrentOs();
if (os !== "Unknown") {
    const mouseEventsToUpdateOn = ["mousedown", "mousemove", "wheel"];
    const isMobile = (_b = (_a = navigator.userAgentData) === null || _a === void 0 ? void 0 : _a.mobile) !== null && _b !== void 0 ? _b : navigator.maxTouchPoints > 1;
    const isiPad = os === "Mac" && isMobile;
    let isSendingCapsLockState = !isiPad;
    let disableCapsOnCapsKeyup = false;
    function setCapsState(newCapsState) {
        if (capsState !== newCapsState) {
            capsState = newCapsState;
            onCapsChangeCallbacks.forEach((callback) => callback(capsState));
        }
    }
    function getCapsLockModifierState(event) {
        return event.getModifierState(CAPS_LOCK);
    }
    mouseEventsToUpdateOn.forEach((eventType) => {
        document.addEventListener(eventType, (event) => {
            if (!isiPad) {
                const currentCapsState = getCapsLockModifierState(event);
                if (!isMobile || !currentCapsState) {
                    setCapsState(currentCapsState);
                }
            }
        }, { passive: true });
    });
    document.addEventListener("keyup", (event) => {
        if (!(event instanceof KeyboardEvent))
            return;
        if (event.key === CAPS_LOCK && disableCapsOnCapsKeyup) {
            setCapsState(false);
            disableCapsOnCapsKeyup = false;
            return;
        }
        switch (os) {
            case "Windows":
                setCapsState(getCapsLockModifierState(event));
                break;
            case "Mac":
                if (event.key === CAPS_LOCK) {
                    setCapsState(false);
                    return;
                }
                {
                    const currentCapsState = getCapsLockModifierState(event);
                    if (isSendingCapsLockState || currentCapsState) {
                        setCapsState(currentCapsState);
                        isSendingCapsLockState = true;
                    }
                }
                break;
            case "Linux":
                if (event.key !== CAPS_LOCK && event.key !== "Unidentified") {
                    setCapsState(getCapsLockModifierState(event));
                }
                break;
        }
    });
    document.addEventListener("keydown", (event) => {
        if (!(event instanceof KeyboardEvent))
            return;
        if (event.key === CAPS_LOCK && disableCapsOnCapsKeyup) {
            disableCapsOnCapsKeyup = false;
        }
        switch (os) {
            case "Windows":
                setCapsState(getCapsLockModifierState(event));
                break;
            case "Mac":
                if (event.key === CAPS_LOCK) {
                    setCapsState(getCapsLockModifierState(event));
                }
                break;
            case "Linux":
                if (event.key === CAPS_LOCK) {
                    const flippedCapsState = !getCapsLockModifierState(event);
                    if (flippedCapsState) {
                        setCapsState(true);
                    }
                    else {
                        disableCapsOnCapsKeyup = true;
                    }
                }
                break;
        }
    });
}
function isCapsLockOn() {
    return capsState;
}
function onCapsLockChange(callback) {
    onCapsChangeCallbacks.push(callback);
}
export { isCapsLockOn, onCapsLockChange };

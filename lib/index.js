import { getCurrentOs } from "./os-detection.js";
let previousCapsState = false;
let capsState = false;
const os = getCurrentOs();
let onCapsChangeCallback;
const mouseEventsToUpdateOn = ["mousedown", "mousemove", "wheel"];
const isiPad = os === "Mac" && navigator.maxTouchPoints > 1;
let isSendingCapsLockState = !isiPad;
function callCallbackIfNeeded() {
    const callCallback = previousCapsState !== capsState;
    previousCapsState = capsState;
    if (callCallback) {
        onCapsChangeCallback === null || onCapsChangeCallback === void 0 ? void 0 : onCapsChangeCallback(capsState);
    }
}
function getCapsLockModifierState(event) {
    var _a, _b;
    return (_b = (_a = event.getModifierState) === null || _a === void 0 ? void 0 : _a.call(event, "CapsLock")) !== null && _b !== void 0 ? _b : capsState;
}
mouseEventsToUpdateOn.forEach((eventType) => {
    document.addEventListener(eventType, (event) => {
        if (!isiPad) {
            capsState = getCapsLockModifierState(event);
            callCallbackIfNeeded();
        }
    });
});
document.addEventListener("keyup", (event) => {
    if (os === "Mac") {
        if (event.key === "CapsLock") {
            capsState = false;
        }
        else {
            const currentCapsState = getCapsLockModifierState(event);
            if (isSendingCapsLockState || currentCapsState) {
                capsState = currentCapsState;
                isSendingCapsLockState = true;
            }
        }
    }
    else if (os === "Windows") {
        capsState = getCapsLockModifierState(event);
    }
    else if (event.key !== "CapsLock" && event.key !== "Unidentified") {
        capsState = getCapsLockModifierState(event);
    }
    callCallbackIfNeeded();
});
document.addEventListener("keydown", (event) => {
    if (os === "Mac") {
        if (event.key === "CapsLock") {
            capsState = true;
            callCallbackIfNeeded();
        }
    }
    else if (os === "Linux") {
        if (event.key === "CapsLock") {
            capsState = !getCapsLockModifierState(event);
        }
    }
});
export function isCapsLockOn() {
    return capsState;
}
export function onCapsLockChange(callback) {
    onCapsChangeCallback = callback;
}

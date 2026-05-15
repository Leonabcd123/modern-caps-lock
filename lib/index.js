var _a, _b;
import { getCurrentOs } from "./os-detection.js";
let previousCapsState = false;
let capsState = false;
const os = getCurrentOs();
const onCapsChangeCallbacks = [];
const mouseEventsToUpdateOn = ["mousedown", "mousemove", "wheel"];
const isMobile = (_b = (_a = navigator.userAgentData) === null || _a === void 0 ? void 0 : _a.mobile) !== null && _b !== void 0 ? _b : navigator.maxTouchPoints > 1;
const isiPad = os === "Mac" && isMobile;
let isSendingCapsLockState = !isiPad;
function callCallbackIfNeeded() {
    const callCallback = previousCapsState !== capsState;
    previousCapsState = capsState;
    if (callCallback) {
        onCapsChangeCallbacks.forEach((callback) => callback(capsState));
    }
}
function getCapsLockModifierState(event) {
    var _a, _b;
    return (_b = (_a = event.getModifierState) === null || _a === void 0 ? void 0 : _a.call(event, "CapsLock")) !== null && _b !== void 0 ? _b : capsState;
}
mouseEventsToUpdateOn.forEach((eventType) => {
    document.addEventListener(eventType, (event) => {
        if (!isiPad) {
            const currentCapsState = getCapsLockModifierState(event);
            if (!isMobile || !currentCapsState) {
                capsState = currentCapsState;
                callCallbackIfNeeded();
            }
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
    onCapsChangeCallbacks.push(callback);
}

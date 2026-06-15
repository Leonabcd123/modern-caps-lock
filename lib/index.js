var _a, _b;
import { getCurrentOs } from "./os-detection.js";
let capsState = false;
const os = getCurrentOs();
const onCapsChangeCallbacks = [];
const mouseEventsToUpdateOn = ["mousedown", "mousemove", "wheel"];
const isMobile = (_b = (_a = navigator.userAgentData) === null || _a === void 0 ? void 0 : _a.mobile) !== null && _b !== void 0 ? _b : navigator.maxTouchPoints > 1;
const isiPad = os === "Mac" && isMobile;
let isSendingCapsLockState = !isiPad;
const afterKeyup = new Map();
function setCapsState(newCapsState) {
    if (capsState !== newCapsState) {
        capsState = newCapsState;
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
        if (event.key === "CapsLock") {
            setCapsState(false);
            return;
        }
        const currentCapsState = getCapsLockModifierState(event);
        if (isSendingCapsLockState || currentCapsState) {
            setCapsState(currentCapsState);
            isSendingCapsLockState = true;
        }
    }
    else if (os === "Windows") {
        setCapsState(getCapsLockModifierState(event));
    }
    else if (event.key !== "CapsLock" && event.key !== "Unidentified") {
        setCapsState(getCapsLockModifierState(event));
    }
});
document.addEventListener("keydown", (event) => {
    if (os === "Mac") {
        if (event.key === "CapsLock") {
            setCapsState(true);
        }
    }
    else if (os === "Linux") {
        if (event.key === "CapsLock") {
            afterKeyup.set(event.code, !getCapsLockModifierState(event));
        }
    }
});
function isCapsLockOn() {
    return capsState;
}
function onCapsLockChange(callback) {
    onCapsChangeCallbacks.push(callback);
}
export { isCapsLockOn, onCapsLockChange };

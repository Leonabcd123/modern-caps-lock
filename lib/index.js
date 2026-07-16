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
    const setAfterKeyupValue = afterKeyup.get(event.key);
    if (setAfterKeyupValue !== undefined) {
        setCapsState(setAfterKeyupValue);
        afterKeyup.delete(event.key);
        return;
    }
    switch (os) {
        case "Windows":
            setCapsState(getCapsLockModifierState(event));
            break;
        case "Mac":
            if (event.key === "CapsLock") {
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
            if (event.key !== "CapsLock" && event.key !== "Unidentified") {
                setCapsState(getCapsLockModifierState(event));
            }
            break;
    }
});
document.addEventListener("keydown", (event) => {
    if (afterKeyup.get(event.key) !== undefined) {
        afterKeyup.delete(event.key);
    }
    switch (os) {
        case "Windows":
            setCapsState(getCapsLockModifierState(event));
            break;
        case "Mac":
            if (event.key === "CapsLock") {
                setCapsState(true);
            }
            break;
        case "Linux":
            if (event.key === "CapsLock") {
                const flippedCapsState = !getCapsLockModifierState(event);
                if (flippedCapsState) {
                    setCapsState(true);
                }
                else {
                    afterKeyup.set(event.key, flippedCapsState);
                }
            }
            break;
    }
});
function isCapsLockOn() {
    return capsState;
}
function onCapsLockChange(callback) {
    onCapsChangeCallbacks.push(callback);
}
export { isCapsLockOn, onCapsLockChange };

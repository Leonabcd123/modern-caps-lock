function isPlatform(osName) {
    var _a, _b;
    return osName.test((_b = (_a = navigator.userAgentData) === null || _a === void 0 ? void 0 : _a.platform) !== null && _b !== void 0 ? _b : (navigator.oscpu || navigator.userAgent || navigator.platform));
}
function getCurrentOs() {
    if (isPlatform(/Mac/i)) {
        return "Mac";
    }
    if (isPlatform(/Linux/i)) {
        return "Linux";
    }
    if (isPlatform(/Win/i)) {
        return "Windows";
    }
    return "Unknown";
}
let previousCapsState = false;
let capsState = false;
const os = getCurrentOs();
let onCapsChangeCallback;
const mouseEventsToUpdateOn = ["mousedown", "mousemove", "wheel"];
const isiPad = os === "Mac" && navigator.maxTouchPoints > 1;
let isSendingCapsLockStateOniPad = !isiPad;
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
        if (event instanceof MouseEvent) {
            if (!isiPad) {
                capsState = getCapsLockModifierState(event);
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
            isSendingCapsLockStateOniPad || (isSendingCapsLockStateOniPad = currentCapsState);
            if (isSendingCapsLockStateOniPad) {
                capsState = currentCapsState;
            }
        }
    }
    else if (os === "Windows") {
        capsState = getCapsLockModifierState(event);
    }
    else if (event.key !== "CapsLock") {
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
//# sourceMappingURL=index.js.map
function isPlatform(osName) {
    var _a;
    return (((_a = navigator.userAgentData) !== null && _a !== void 0 ? _a : navigator).platform).toLowerCase().startsWith(osName) || new RegExp(osName, "i").test(navigator.userAgent);
}
function getCurrentOs() {
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
let onCapsChangeCallback;
const mouseEventsToUpdateOn = ["mousedown", "mousemove", "wheel"];
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
            if (navigator.maxTouchPoints <= 1) {
                capsState = getCapsLockModifierState(event);
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
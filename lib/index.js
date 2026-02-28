"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCapsLockOn = isCapsLockOn;
exports.onCapsLockChange = onCapsLockChange;
function isPlatform(searchTerm) {
    const platform = navigator.platform;
    return platform.includes(searchTerm);
}
function getCurrentOs() {
    if (isPlatform("Mac")) {
        return "Mac";
    }
    if (isPlatform("Linux")) {
        return "Linux";
    }
    if (isPlatform("Windows")) {
        return "Windows";
    }
    return "Unknown";
}
let previousCapsState = false;
let capsState = false;
const os = getCurrentOs();
let onCapsChangeCallback;
function shouldCallCallback() {
    let callCallback = previousCapsState !== capsState;
    previousCapsState = capsState;
    return callCallback;
}
function getCapsLockModifierState(event) {
    return event.getModifierState("CapsLock");
}
document.addEventListener("mousedown", (event) => {
    capsState = getCapsLockModifierState(event);
    if (shouldCallCallback()) {
        onCapsChangeCallback(capsState);
    }
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
    if (shouldCallCallback()) {
        onCapsChangeCallback(capsState);
    }
});
document.addEventListener("keydown", (event) => {
    if (os === "Mac") {
        if (event.key === "CapsLock") {
            capsState = true;
            if (shouldCallCallback()) {
                onCapsChangeCallback(capsState);
            }
        }
    }
    else if (os === "Linux") {
        if (event.key === "CapsLock") {
            capsState = !getCapsLockModifierState(event);
        }
    }
});
function isCapsLockOn() {
    return capsState;
}
function onCapsLockChange(callback) {
    onCapsChangeCallback = callback;
}
//# sourceMappingURL=index.js.map
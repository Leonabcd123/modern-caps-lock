"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCapsLockOn = isCapsLockOn;
exports.onCapsLockChange = onCapsLockChange;
function isPlatform(searchTerm) {
    const platform = navigator.platform;
    if (typeof searchTerm === "string") {
        return platform.includes(searchTerm);
    }
    else {
        return searchTerm.test(platform);
    }
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
let capsState = false;
const os = getCurrentOs();
let onCapsChangeHandler;
function getCapsLockModifierState(event) {
    return event.getModifierState("CapsLock");
}
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
    onCapsChangeHandler(capsState);
});
document.addEventListener("keydown", (event) => {
    if (os === "Mac") {
        if (event.key === "CapsLock") {
            capsState = true;
            onCapsChangeHandler(capsState);
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
function onCapsLockChange(handler) {
    onCapsChangeHandler = handler;
}
//# sourceMappingURL=index.js.map
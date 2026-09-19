function isPlatform(osName) {
    var _a;
    if ("userAgentData" in navigator) {
        return osName.test(navigator.userAgentData.platform);
    }
    return (osName.test((_a = navigator.oscpu) !== null && _a !== void 0 ? _a : "") ||
        osName.test(navigator.userAgent) ||
        osName.test(navigator.platform));
}
export function getPlatformInfo() {
    var _a, _b;
    let os = "Unknown";
    if (isPlatform(/Mac/i)) {
        os = "Mac";
    }
    else if (isPlatform(/Linux|Android/i)) {
        os = "Linux";
    }
    else if (isPlatform(/Win/i)) {
        os = "Windows";
    }
    const isMobile = (_b = (_a = navigator.userAgentData) === null || _a === void 0 ? void 0 : _a.mobile) !== null && _b !== void 0 ? _b : navigator.maxTouchPoints > 1;
    return { os, isMobile };
}

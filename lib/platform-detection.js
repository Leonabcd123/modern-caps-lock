function isPlatform(osName) {
    var _a, _b, _c;
    return osName.test((_b = (_a = navigator.userAgentData) === null || _a === void 0 ? void 0 : _a.platform) !== null && _b !== void 0 ? _b : ((_c = navigator.oscpu) !== null && _c !== void 0 ? _c : "") + navigator.userAgent + navigator.platform);
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

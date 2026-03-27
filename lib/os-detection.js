function isPlatform(osName) {
    var _a, _b, _c;
    return osName.test((_b = (_a = navigator.userAgentData) === null || _a === void 0 ? void 0 : _a.platform) !== null && _b !== void 0 ? _b : ((_c = navigator.oscpu) !== null && _c !== void 0 ? _c : "") + navigator.userAgent + navigator.platform);
}
export function getCurrentOs() {
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

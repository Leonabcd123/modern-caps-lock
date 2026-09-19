type Os = "Mac" | "Linux" | "Windows" | "Unknown";
export declare function getPlatformInfo(): {
    os: Os;
    isMobile: boolean;
};
export {};

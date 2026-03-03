type OnCapsChangeCallback = (capsState: boolean) => void;
export declare function isCapsLockOn(): boolean;
export declare function onCapsLockChange(callback: OnCapsChangeCallback): void;
export {};

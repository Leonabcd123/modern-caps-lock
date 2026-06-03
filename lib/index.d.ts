type OnCapsChangeCallback = (capsState: boolean) => void;
declare function isCapsLockOn(): boolean;
declare function onCapsLockChange(callback: OnCapsChangeCallback): void;
export { isCapsLockOn, onCapsLockChange };

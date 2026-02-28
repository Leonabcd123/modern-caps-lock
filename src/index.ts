function isPlatform(searchTerm: string): boolean {
  const platform = navigator.platform;
  return platform.includes(searchTerm);
}

function getCurrentOs(): "Mac" | "Linux" | "Windows" | "Unknown" {
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
let onCapsChangeCallback: (capsState: boolean) => void;

function getCapsLockModifierState(event: KeyboardEvent): boolean {
  return event.getModifierState("CapsLock");
}

document.addEventListener("keyup", (event) => {
  if (os === "Mac") {
    // macOS sends only keydown when enabling Caps Lock and only keyup when disabling.
    if (event.key === "CapsLock") {
      capsState = false;
    } else {
      // IPad doesn't send caps state on any keypress which isn't Caps Lock,
      // So don't update caps state on any keypress which isn't Caps Lock.
      if (navigator.maxTouchPoints <= 1) {
        capsState = getCapsLockModifierState(event);
      }
    }
  } else if (os === "Windows") {
    // Windows always sends the correct state on keyup (for Caps Lock and for regular keys).
    capsState = getCapsLockModifierState(event);
  } else if (event.key !== "CapsLock") {
    // Linux sends the correct state on keyup if key isn't Caps Lock.
    capsState = getCapsLockModifierState(event);
  }
  onCapsChangeCallback(capsState);
});

document.addEventListener("keydown", (event) => {
  if (os === "Mac") {
    // macOS sends only keydown when enabling Caps Lock and only keyup when disabling.
    if (event.key === "CapsLock") {
      capsState = true;
      onCapsChangeCallback(capsState);
    }
  } else if (os === "Linux") {
    /* Linux sends the correct state before Caps Lock is toggled only on keydown,
     * so we invert the modifier state.
     */
    if (event.key === "CapsLock") {
      capsState = !getCapsLockModifierState(event);
    }
  }
});

export function isCapsLockOn(): boolean {
  return capsState;
} 

export function onCapsLockChange(callback: (capsState: boolean) => void): void {
  onCapsChangeCallback = callback;
}

// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/os-detection.js", () => ({
  getCurrentOs: vi.fn(),
}));

import { getCurrentOs } from "../src/os-detection.js";

type Os = "Windows" | "Mac" | "Linux" | "Unknown";

type NavOpts = {
  mobile?: boolean;
  maxTouchPoints?: number;
};

function setNavigator({ mobile, maxTouchPoints }: NavOpts): void {
  Object.defineProperty(navigator, "userAgentData", {
    value: mobile === undefined ? undefined : { mobile },
    configurable: true,
  });
  Object.defineProperty(navigator, "maxTouchPoints", {
    value: maxTouchPoints ?? 0,
    configurable: true,
  });
}

async function loadModule(
  os: Os,
  navOpts: NavOpts = {},
): Promise<typeof import("../src/index.js")> {
  vi.resetModules();
  setNavigator(navOpts);
  vi.mocked(getCurrentOs).mockReturnValue(os);
  return import("../src/index.js");
}

type ModuleExports = Awaited<ReturnType<typeof loadModule>>;

function keyEvent(
  type: "keydown" | "keyup",
  {
    key,
    capsLock = false,
    withModifierState = true,
  }: { key: string; capsLock?: boolean; withModifierState?: boolean },
): KeyboardEvent {
  const event = new KeyboardEvent(type, { key, bubbles: true });
  if (withModifierState) {
    event.getModifierState = vi.fn((mod) => (mod === "CapsLock" ? capsLock : false));
  } else {
    // Simulate the autofill-sent `Event` that lacks getModifierState entirely.
    // @ts-expect-error deliberately removing the method
    event.getModifierState = undefined;
  }
  return event;
}

function mouseEvent(type: "mousedown" | "mousemove" | "wheel", capsLock: boolean): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true });
  event.getModifierState = vi.fn((mod) => (mod === "CapsLock" ? capsLock : false));
  return event;
}

function dispatch(event: Event): void {
  document.dispatchEvent(event);
}

function expectMouseEventsToUpdateState(isCapsLockOn: () => boolean): void {
  dispatch(mouseEvent("mousedown", true));
  expect(isCapsLockOn()).toBe(true);

  dispatch(mouseEvent("mousemove", false));
  expect(isCapsLockOn()).toBe(false);

  dispatch(mouseEvent("wheel", true));
  expect(isCapsLockOn()).toBe(true);
}

function expectMouseEventsToNotUpdateState(isCapsLockOn: () => boolean): void {
  dispatch(mouseEvent("mousedown", true));
  expect(isCapsLockOn()).toBe(false);

  dispatch(mouseEvent("mousemove", true));
  expect(isCapsLockOn()).toBe(false);

  dispatch(mouseEvent("wheel", true));
  expect(isCapsLockOn()).toBe(false);
}

describe("caps-lock-state", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("defaults to caps lock off before any events fire", async () => {
      const { isCapsLockOn } = await loadModule("Windows");
      expect(isCapsLockOn()).toBe(false);
    });
  });

  describe("onCapsLockChange", () => {
    let isCapsLockOn: ModuleExports["isCapsLockOn"];
    let onCapsLockChange: ModuleExports["onCapsLockChange"];

    beforeEach(async () => {
      ({ isCapsLockOn, onCapsLockChange } = await loadModule("Windows"));
    });

    it("invokes the callback with the new state when caps lock toggles", () => {
      const cb = vi.fn();
      onCapsLockChange(cb);

      dispatch(keyEvent("keydown", { key: "a", capsLock: true }));

      expect(isCapsLockOn()).toBe(true);
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(true);
    });

    it("does not invoke the callback when the state doesn't change", () => {
      const cb = vi.fn();
      onCapsLockChange(cb);

      dispatch(keyEvent("keydown", { key: "a", capsLock: false }));

      expect(cb).not.toHaveBeenCalled();
    });

    it("supports multiple registered callbacks", () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      onCapsLockChange(cb1);
      onCapsLockChange(cb2);

      dispatch(keyEvent("keydown", { key: "a", capsLock: true }));

      expect(cb1).toHaveBeenCalledWith(true);
      expect(cb2).toHaveBeenCalledWith(true);
    });
  });

  describe("Windows", () => {
    let isCapsLockOn: ModuleExports["isCapsLockOn"];

    beforeEach(async () => {
      ({ isCapsLockOn } = await loadModule("Windows"));
    });

    it("sets state from getModifierState on keydown", () => {
      dispatch(keyEvent("keydown", { key: "a", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keydown", { key: "a", capsLock: false }));
      expect(isCapsLockOn()).toBe(false);
    });

    it("updates state from getModifierState on keyup", () => {
      dispatch(keyEvent("keyup", { key: "b", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keyup", { key: "b", capsLock: false }));
      expect(isCapsLockOn()).toBe(false);
    });

    it("trusts keydown on the CapsLock key itself", () => {
      dispatch(keyEvent("keydown", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);
    });

    it("trusts keyup on the CapsLock key itself", () => {
      dispatch(keyEvent("keyup", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);
    });

    it("updates state from mouse events on desktop", () => {
      expectMouseEventsToUpdateState(isCapsLockOn);
    });

    it("falls back to the existing state when getModifierState is unavailable (autofill Event)", () => {
      dispatch(keyEvent("keydown", { key: "a", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);

      expect(() =>
        dispatch(keyEvent("keydown", { key: "a", withModifierState: false })),
      ).not.toThrow();
      expect(isCapsLockOn()).toBe(true);
    });
  });

  describe("Mac (desktop)", () => {
    let isCapsLockOn: ModuleExports["isCapsLockOn"];

    beforeEach(async () => {
      ({ isCapsLockOn } = await loadModule("Mac", { mobile: false }));
    });

    it("turns on when CapsLock is pressed (keydown)", () => {
      dispatch(keyEvent("keydown", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);
    });

    it("does not update state on keydown for a non-CapsLock key", () => {
      dispatch(keyEvent("keydown", { key: "b", capsLock: true }));
      expect(isCapsLockOn()).toBe(false);
    });

    it("turns off when CapsLock is released (keyup)", () => {
      dispatch(keyEvent("keydown", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keyup", { key: "CapsLock", capsLock: false }));
      expect(isCapsLockOn()).toBe(false);
    });

    it("updates state from a regular key's keyup", () => {
      dispatch(keyEvent("keyup", { key: "b", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);
    });

    it("updates state from mouse events on desktop", () => {
      expectMouseEventsToUpdateState(isCapsLockOn);
    });
  });

  describe("Mac (iPad, virtual keyboard)", () => {
    let isCapsLockOn: ModuleExports["isCapsLockOn"];

    beforeEach(async () => {
      ({ isCapsLockOn } = await loadModule("Mac", { mobile: true }));
    });

    it("ignores regular-key keyups until modifier state has ever been observed as true on keyup", () => {
      dispatch(keyEvent("keydown", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keyup", { key: "b", capsLock: false }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keyup", { key: "b", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keyup", { key: "b", capsLock: false }));
      expect(isCapsLockOn()).toBe(false);
    });

    it("toggles directly via the CapsLock key itself", () => {
      dispatch(keyEvent("keydown", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keyup", { key: "CapsLock", capsLock: false }));
      expect(isCapsLockOn()).toBe(false);
    });

    it("ignores mouse events entirely on iPad", () => {
      expectMouseEventsToNotUpdateState(isCapsLockOn);
    });
  });

  describe("Mobile, non-iPad (e.g. Android)", () => {
    let isCapsLockOn: ModuleExports["isCapsLockOn"];

    beforeEach(async () => {
      ({ isCapsLockOn } = await loadModule("Linux", { mobile: true }));
    });

    it("updates state on keyup", () => {
      dispatch(keyEvent("keyup", { key: "b", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);
    });

    it("ignores unidentified keypresses on keyup", () => {
      dispatch(keyEvent("keyup", { key: "Unidentified", capsLock: true }));
      expect(isCapsLockOn()).toBe(false);

      dispatch(keyEvent("keyup", { key: "b", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keyup", { key: "Unidentified", capsLock: false }));
      expect(isCapsLockOn()).toBe(true);
    });

    it("does not trust a mouse event reporting caps lock ON", () => {
      dispatch(mouseEvent("mousedown", true));
      expect(isCapsLockOn()).toBe(false);
    });

    it("does trust a mouse event reporting caps lock OFF", () => {
      dispatch(keyEvent("keyup", { key: "b", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(mouseEvent("mousedown", false));
      expect(isCapsLockOn()).toBe(false);
    });
  });

  describe("Unknown", () => {
    let isCapsLockOn: ModuleExports["isCapsLockOn"];

    beforeEach(async () => {
      ({ isCapsLockOn } = await loadModule("Unknown"));
    });

    it("does not update state on keydown for any key", () => {
      dispatch(keyEvent("keydown", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(false);

      dispatch(keyEvent("keydown", { key: "b", capsLock: true }));
      expect(isCapsLockOn()).toBe(false);
    });

    it("does not update state on keyup for any key", () => {
      dispatch(keyEvent("keyup", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(false);

      dispatch(keyEvent("keyup", { key: "b", capsLock: true }));
      expect(isCapsLockOn()).toBe(false);
    });

    it("ignores mouse events", () => {
      expectMouseEventsToNotUpdateState(isCapsLockOn);
    });
  });

  describe("Linux", () => {
    let isCapsLockOn: ModuleExports["isCapsLockOn"];

    beforeEach(async () => {
      ({ isCapsLockOn } = await loadModule("Linux", { mobile: false }));
    });

    it("turns on immediately on CapsLock keydown when modifier state currently reads false", () => {
      dispatch(keyEvent("keydown", { key: "CapsLock", capsLock: false }));
      expect(isCapsLockOn()).toBe(true);
    });

    it("does not update state on keydown for a non-CapsLock key", () => {
      dispatch(keyEvent("keydown", { key: "b", capsLock: true }));
      expect(isCapsLockOn()).toBe(false);
    });

    it("defers turning off until caps lock keyup when modifier state currently reads true on keydown", () => {
      dispatch(keyEvent("keydown", { key: "CapsLock", capsLock: false }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keydown", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keyup", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(false);
    });

    it("does not let an interleaved keypress on a different key clear the deferred CapsLock toggle", () => {
      dispatch(keyEvent("keydown", { key: "CapsLock", capsLock: false }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keydown", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keydown", { key: "x", capsLock: true }));
      dispatch(keyEvent("keyup", { key: "x", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);

      dispatch(keyEvent("keyup", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(false);
    });

    it("updates state from a regular key's keyup", () => {
      dispatch(keyEvent("keyup", { key: "b", capsLock: true }));
      expect(isCapsLockOn()).toBe(true);
    });

    it("ignores a stray CapsLock keyup that wasn't deferred", () => {
      dispatch(keyEvent("keyup", { key: "CapsLock", capsLock: true }));
      expect(isCapsLockOn()).toBe(false);
    });

    it("updates state from mouse events", () => {
      expectMouseEventsToUpdateState(isCapsLockOn);
    });
  });
});

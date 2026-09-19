// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import { getPlatformInfo } from "../src/platform-detection.js";

type UserAgentData = {
  platform: string;
  mobile: boolean;
};

type NavigatorOverrides = {
  userAgentData?: Partial<UserAgentData>;
  oscpu?: string;
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
};

function setNavigator({
  userAgentData,
  oscpu,
  userAgent = "",
  platform = "",
  maxTouchPoints = 0,
}: NavigatorOverrides): void {
  if (userAgentData === undefined) {
    Reflect.deleteProperty(navigator, "userAgentData");
  } else {
    const completeUserAgentData: UserAgentData = { platform: "", mobile: false, ...userAgentData };
    Object.defineProperty(navigator, "userAgentData", {
      value: completeUserAgentData,
      configurable: true,
    });
  }
  if (oscpu === undefined) {
    Reflect.deleteProperty(navigator, "oscpu");
  } else {
    Object.defineProperty(navigator, "oscpu", {
      value: oscpu,
      configurable: true,
    });
  }
  Object.defineProperty(navigator, "userAgent", {
    value: userAgent,
    configurable: true,
  });
  Object.defineProperty(navigator, "platform", {
    value: platform,
    configurable: true,
  });
  Object.defineProperty(navigator, "maxTouchPoints", {
    value: maxTouchPoints,
    configurable: true,
  });
}

describe("getPlatformInfo", () => {
  describe("os detection via navigator.userAgentData.platform", () => {
    it("detects Mac", () => {
      setNavigator({ userAgentData: { platform: "macOS" } });
      expect(getPlatformInfo().os).toBe("Mac");
    });

    it("detects Linux", () => {
      setNavigator({ userAgentData: { platform: "Linux" } });
      expect(getPlatformInfo().os).toBe("Linux");
    });

    it("detects Android as Linux", () => {
      setNavigator({ userAgentData: { platform: "Android" } });
      expect(getPlatformInfo().os).toBe("Linux");
    });

    it("detects Windows", () => {
      setNavigator({ userAgentData: { platform: "Windows" } });
      expect(getPlatformInfo().os).toBe("Windows");
    });

    it("returns Unknown for an unrecognized platform string", () => {
      setNavigator({ userAgentData: { platform: "ChromeOS" } });
      expect(getPlatformInfo().os).toBe("Unknown");
    });

    it("trusts userAgentData.platform over a contradicting fallback string", () => {
      setNavigator({
        userAgentData: { platform: "macOS" },
        oscpu: "Windows NT",
        userAgent: "Windows NT 10.0",
        platform: "Win32",
      });
      expect(getPlatformInfo().os).toBe("Mac");
    });
  });

  describe("os detection via fallback (no userAgentData)", () => {
    it("detects Mac from navigator.oscpu", () => {
      setNavigator({ oscpu: "Intel Mac OS X 10.15" });
      expect(getPlatformInfo().os).toBe("Mac");
    });

    it("detects Mac from navigator.userAgent (e.g. iPad Safari reporting 'Mac OS X')", () => {
      setNavigator({
        userAgent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
      });
      expect(getPlatformInfo().os).toBe("Mac");
    });

    it("detects Linux from navigator.userAgent", () => {
      setNavigator({
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      });
      expect(getPlatformInfo().os).toBe("Linux");
    });

    it("detects Android (as Linux) from navigator.userAgent", () => {
      setNavigator({
        userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36",
      });
      expect(getPlatformInfo().os).toBe("Linux");
    });

    it("detects Windows from navigator.userAgent", () => {
      setNavigator({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      });
      expect(getPlatformInfo().os).toBe("Windows");
    });

    it("detects Windows from navigator.platform when userAgent/oscpu don't match", () => {
      setNavigator({
        oscpu: "",
        userAgent: "SomeCustomAgent/1.0",
        platform: "Win32",
      });
      expect(getPlatformInfo().os).toBe("Windows");
    });

    it("returns Unknown when nothing in the fallback string matches", () => {
      setNavigator({
        oscpu: "",
        userAgent: "SomeCustomAgent/1.0",
        platform: "",
      });
      expect(getPlatformInfo().os).toBe("Unknown");
    });
  });

  describe("case insensitivity", () => {
    it("matches Mac regardless of case", () => {
      setNavigator({ userAgentData: { platform: "MACOS" } });
      expect(getPlatformInfo().os).toBe("Mac");

      setNavigator({ userAgentData: { platform: "mac" } });
      expect(getPlatformInfo().os).toBe("Mac");

      setNavigator({ userAgentData: { platform: "MacIntel" } });
      expect(getPlatformInfo().os).toBe("Mac");
    });

    it("matches Linux regardless of case", () => {
      setNavigator({ userAgentData: { platform: "LINUX" } });
      expect(getPlatformInfo().os).toBe("Linux");

      setNavigator({ userAgentData: { platform: "linux" } });
      expect(getPlatformInfo().os).toBe("Linux");
    });

    it("matches Android (as Linux) regardless of case", () => {
      setNavigator({ userAgentData: { platform: "ANDROID" } });
      expect(getPlatformInfo().os).toBe("Linux");

      setNavigator({ userAgentData: { platform: "android" } });
      expect(getPlatformInfo().os).toBe("Linux");
    });

    it("matches Windows regardless of case", () => {
      setNavigator({ userAgentData: { platform: "WINDOWS" } });
      expect(getPlatformInfo().os).toBe("Windows");

      setNavigator({ userAgentData: { platform: "windows" } });
      expect(getPlatformInfo().os).toBe("Windows");

      setNavigator({ userAgentData: { platform: "win32" } });
      expect(getPlatformInfo().os).toBe("Windows");
    });

    it("matches case-insensitively through the fallback string too, not just userAgentData", () => {
      setNavigator({
        oscpu: "",
        userAgent: "some agent string with LINUX in it",
        platform: "",
      });
      expect(getPlatformInfo().os).toBe("Linux");
    });
  });

  describe("isMobile", () => {
    it("is true when userAgentData.mobile is true, regardless of maxTouchPoints", () => {
      setNavigator({ userAgentData: { platform: "Windows", mobile: true }, maxTouchPoints: 0 });
      expect(getPlatformInfo().isMobile).toBe(true);
    });

    it("is false when userAgentData.mobile is false, even if maxTouchPoints suggests otherwise", () => {
      setNavigator({ userAgentData: { platform: "Windows", mobile: false }, maxTouchPoints: 10 });
      expect(getPlatformInfo().isMobile).toBe(false);
    });

    it("falls back to maxTouchPoints > 1 when userAgentData is unavailable", () => {
      setNavigator({ platform: "MacIntel", maxTouchPoints: 5 });
      expect(getPlatformInfo().isMobile).toBe(true);
    });

    it("is false via fallback when maxTouchPoints is exactly 1 (mouse/trackpad, not touch)", () => {
      setNavigator({ platform: "MacIntel", maxTouchPoints: 1 });
      expect(getPlatformInfo().isMobile).toBe(false);
    });

    it("is false via fallback when maxTouchPoints is 0", () => {
      setNavigator({ platform: "Win32", maxTouchPoints: 0 });
      expect(getPlatformInfo().isMobile).toBe(false);
    });
  });

  describe("combined os + isMobile", () => {
    it("reports iPad as Mac + mobile", () => {
      setNavigator({ userAgentData: { platform: "macOS", mobile: true } });
      expect(getPlatformInfo()).toEqual({ os: "Mac", isMobile: true });
    });

    it("reports a Windows desktop as Windows + non-mobile", () => {
      setNavigator({ userAgentData: { platform: "Windows", mobile: false } });
      expect(getPlatformInfo()).toEqual({ os: "Windows", isMobile: false });
    });
  });
});

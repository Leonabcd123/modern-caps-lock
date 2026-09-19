/**
 * Checks whether the user is running a specific operating system.
 *
 * @param osName - The operating system name (as a RegExp)
 * @returns Whether the user is running that operating system or not
 */
function isPlatform(osName: RegExp): boolean {
  /*
   * navigator.userAgentData is experimental, only supported in Chrome, Edge and Opera. Treat it as a source of truth when available.
   * Fallback to navigator.oscpu (which is only supported on Firefox), navigator.userAgent and navigator.platform. If any of them contain osName, return true.
   */

  // @ts-expect-error navigator.userAgentData is only supported on Chrome/Edge/Opera.
  const platform = navigator.userAgentData?.platform;
  return platform !== undefined
    ? osName.test(platform)
    : osName.test(
        // @ts-expect-error navigator.oscpu is only supported on Firefox.
        navigator.oscpu ?? "",
      ) ||
        osName.test(navigator.userAgent) ||
        osName.test(navigator.platform);
}

export type Os = "Mac" | "Linux" | "Windows" | "Unknown";

/**
 * Gets the user's platform info.
 *
 * @remarks
 * iPad is treated as Mac, and Android is treated as Linux.
 *
 * @returns The operating system the user is running and whether they're using a mobile device
 */
export function getPlatformInfo(): { os: Os; isMobile: boolean } {
  let os: Os = "Unknown";

  if (isPlatform(/Mac/i)) {
    os = "Mac";
  } else if (isPlatform(/Linux|Android/i)) {
    os = "Linux";
  } else if (isPlatform(/Win/i)) {
    os = "Windows";
  }

  const isMobile =
    // @ts-expect-error navigator.userAgentData is only supported on Chrome/Edge/Opera.
    navigator.userAgentData?.mobile ?? navigator.maxTouchPoints > 1;

  return { os, isMobile };
}

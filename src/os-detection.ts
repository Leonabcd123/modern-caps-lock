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
  return osName.test(
    // @ts-expect-error navigator.userAgentData is only supported on Chrome/Edge/Opera.
    navigator.userAgentData?.platform ??
      // @ts-expect-error navigator.oscpu is only supported on Firefox.
      (navigator.oscpu ?? "") + navigator.userAgent + navigator.platform,
  );
}

/**
 * Gets the user's current operating system.
 *
 * @returns The operating system the user is running
 */
export function getCurrentOs(): "Mac" | "Linux" | "Windows" | "Unknown" {
  if (isPlatform(/Mac/i)) {
    return "Mac";
  }
  if (isPlatform(/Linux|Android/i)) {
    return "Linux";
  }
  if (isPlatform(/Win/i)) {
    return "Windows";
  }
  return "Unknown";
}

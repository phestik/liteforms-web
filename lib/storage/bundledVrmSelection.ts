const BUNDLED_VRM_SELECTION_KEY = "liteforms.bundledVrmSelection";

export function loadBundledVrmSelection(): string | null {
  try {
    return localStorage.getItem(BUNDLED_VRM_SELECTION_KEY);
  } catch {
    return null;
  }
}

export function saveBundledVrmSelection(id: string): void {
  try {
    localStorage.setItem(BUNDLED_VRM_SELECTION_KEY, id);
  } catch {
    // localStorage may be unavailable in private browsing.
  }
}

export function clearBundledVrmSelection(): void {
  try {
    localStorage.removeItem(BUNDLED_VRM_SELECTION_KEY);
  } catch {
    // ignore
  }
}

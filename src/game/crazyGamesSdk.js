let initialized = false;

function getSdk() {
  if (typeof window === "undefined") return null;
  return window.CrazyGames || null;
}

export async function initCrazyGames() {
  const sdk = getSdk();
  if (!sdk || initialized) return;
  try {
    await Promise.race([
      sdk.SDK.init(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("CrazyGames SDK init timeout")), 3000);
      }),
    ]);
    initialized = true;
  } catch (error) {
    console.warn("CrazyGames SDK init failed:", error);
  }
}

export function gameplayStart() {
  const sdk = getSdk();
  sdk?.SDK?.game?.gameplayStart?.();
}

export function gameplayStop() {
  const sdk = getSdk();
  sdk?.SDK?.game?.gameplayStop?.();
}

export function happytime() {
  const sdk = getSdk();
  sdk?.SDK?.game?.happytime?.();
}

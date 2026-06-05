let initialized = false;
let initPromise = null;

function getSdk() {
  if (typeof window === "undefined") return null;
  return window.CrazyGames || null;
}

export async function initCrazyGames() {
  if (initialized) return;
  if (initPromise) return initPromise;

  const sdk = getSdk();
  if (!sdk) return;

  initPromise = (async () => {
    try {
      await Promise.race([
        sdk.SDK.init(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("CrazyGames SDK init timeout")), 5000);
        }),
      ]);
      initialized = true;
    } catch (error) {
      console.warn("CrazyGames SDK init failed:", error);
    }
  })();

  return initPromise;
}

function runWhenReady(callback, label) {
  void initCrazyGames().then(() => {
    if (!initialized) return;
    try {
      callback();
    } catch (error) {
      console.warn(`CrazyGames ${label} failed:`, error);
    }
  });
}

export function gameplayStart() {
  const sdk = getSdk();
  if (!sdk) return;
  runWhenReady(() => sdk.SDK.game.gameplayStart(), "gameplayStart");
}

export function gameplayStop() {
  const sdk = getSdk();
  if (!sdk) return;
  runWhenReady(() => sdk.SDK.game.gameplayStop(), "gameplayStop");
}

export function happytime() {
  const sdk = getSdk();
  if (!sdk) return;
  runWhenReady(() => sdk.SDK.game.happytime(), "happytime");
}

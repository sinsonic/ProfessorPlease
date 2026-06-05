let initialized = false;
let initPromise = null;

function getSdk() {
  if (typeof window === "undefined") return null;
  return window.CrazyGames || null;
}

export function isCrazyGamesEnvironment() {
  if (typeof window === "undefined") return false;
  return /crazygames\.com$/i.test(window.location.hostname);
}

function loadSdkScript() {
  if (!isCrazyGamesEnvironment()) {
    return Promise.resolve(false);
  }
  if (getSdk()) {
    return Promise.resolve(true);
  }

  const existing = document.querySelector("script[data-crazygames-sdk]");
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(!!getSdk()), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://sdk.crazygames.com/crazygames-sdk-v3.js";
    script.dataset.crazygamesSdk = "true";
    script.async = true;
    script.onload = () => resolve(!!getSdk());
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function initCrazyGames() {
  if (!isCrazyGamesEnvironment()) return;
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const loaded = await loadSdkScript();
    if (!loaded) return;

    const sdk = getSdk();
    if (!sdk) return;

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
  if (!isCrazyGamesEnvironment()) return;

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

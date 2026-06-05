const STORAGE_KEY = "fictyfact_html_progress_v1";

function createDefaultProgress() {
  return {
    bestStreak: 0,
    stats: {
      quizzesPlayed: 0,
      correctAnswers: 0,
    },
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw);
    return {
      bestStreak: Number.isFinite(parsed?.bestStreak) ? parsed.bestStreak : 0,
      stats: {
        quizzesPlayed: parsed?.stats?.quizzesPlayed || 0,
        correctAnswers: parsed?.stats?.correctAnswers || 0,
      },
    };
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export function addQuizStats(correctAnswers) {
  const progress = loadProgress();
  progress.stats.quizzesPlayed += 1;
  progress.stats.correctAnswers += correctAnswers;
  saveProgress(progress);
  return progress;
}

export function updateBestStreak(streak) {
  const progress = loadProgress();
  progress.bestStreak = Math.max(progress.bestStreak || 0, streak);
  saveProgress(progress);
  return progress;
}

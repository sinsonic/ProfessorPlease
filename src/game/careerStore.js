export const STUDENTS_PER_DAY = 3;
const STORAGE_KEY = "professor_career_v1";

function createDefaultCareer() {
  return {
    reputation: 0,
    money: 0,
    day: 1,
    studentsGradedToday: 0,
    ownedDecorations: [],
    pendingBoosters: [],
    activeBoosters: [],
    mistakeShieldUsed: false,
  };
}

function normalizeCareer(parsed) {
  return {
    reputation: Number.isFinite(parsed?.reputation) ? parsed.reputation : 0,
    money: Number.isFinite(parsed?.money) ? parsed.money : 0,
    day: Number.isFinite(parsed?.day) && parsed.day >= 1 ? parsed.day : 1,
    studentsGradedToday: Number.isFinite(parsed?.studentsGradedToday)
      ? Math.max(0, Math.min(STUDENTS_PER_DAY, parsed.studentsGradedToday))
      : 0,
    ownedDecorations: Array.isArray(parsed?.ownedDecorations) ? parsed.ownedDecorations : [],
    pendingBoosters: Array.isArray(parsed?.pendingBoosters) ? parsed.pendingBoosters : [],
    activeBoosters: Array.isArray(parsed?.activeBoosters) ? parsed.activeBoosters : [],
    mistakeShieldUsed: Boolean(parsed?.mistakeShieldUsed),
  };
}

export function loadCareer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultCareer();
    return normalizeCareer(JSON.parse(raw));
  } catch {
    return createDefaultCareer();
  }
}

export function saveCareer(career) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(career));
}

export function resetCareer() {
  localStorage.removeItem(STORAGE_KEY);
}

export function adjustReputation(delta) {
  const career = loadCareer();
  career.reputation += delta;
  saveCareer(career);
  return career;
}

export function adjustMoney(delta) {
  const career = loadCareer();
  career.money += delta;
  saveCareer(career);
  return career;
}

export function applyCareerEffects({ reputationChange = 0, moneyChange = 0 } = {}) {
  const career = loadCareer();
  const repDelta = Number(reputationChange) || 0;
  const moneyDelta = Number(moneyChange) || 0;
  career.reputation += repDelta;
  career.money += moneyDelta;
  saveCareer(career);
  return { career, reputationChange: repDelta, moneyChange: moneyDelta };
}

export function getBoosterModifiers(career = loadCareer()) {
  const modifiers = {
    repBonusPerCorrect: 0,
    salaryMultiplier: 1,
    mistakeShield: false,
    dayStartMoney: 0,
  };

  career.activeBoosters.forEach((booster) => {
    switch (booster.effect) {
      case "rep_bonus":
        modifiers.repBonusPerCorrect += Number(booster.value) || 0;
        break;
      case "salary_multiplier":
        modifiers.salaryMultiplier *= Number(booster.value) || 1;
        break;
      case "mistake_shield":
        modifiers.mistakeShield = true;
        break;
      case "day_start_money":
        modifiers.dayStartMoney += Number(booster.value) || 0;
        break;
      default:
        break;
    }
  });

  return modifiers;
}

export function adjustReputationForAnswer(isCorrect) {
  const career = loadCareer();
  const modifiers = getBoosterModifiers(career);

  if (!isCorrect && modifiers.mistakeShield && !career.mistakeShieldUsed) {
    career.mistakeShieldUsed = true;
    saveCareer(career);
    return career;
  }

  const delta = isCorrect ? 1 + modifiers.repBonusPerCorrect : -1;
  career.reputation += delta;
  saveCareer(career);
  return career;
}

export function activatePendingBoosters() {
  const career = loadCareer();
  if (career.pendingBoosters.length === 0 && career.activeBoosters.length === 0) {
    career.mistakeShieldUsed = false;
    saveCareer(career);
    return career;
  }

  career.activeBoosters = [...career.pendingBoosters];
  career.pendingBoosters = [];
  career.mistakeShieldUsed = false;

  const modifiers = getBoosterModifiers(career);
  if (modifiers.dayStartMoney > 0) {
    career.money += modifiers.dayStartMoney;
  }

  saveCareer(career);
  return career;
}

export function clearActiveBoosters() {
  const career = loadCareer();
  career.activeBoosters = [];
  career.mistakeShieldUsed = false;
  saveCareer(career);
  return career;
}

export function ownsDecoration(decorationKey, career = loadCareer()) {
  return career.ownedDecorations.includes(decorationKey);
}

export function hasPendingOrActiveBooster(boosterId, career = loadCareer()) {
  return career.pendingBoosters.some((b) => b.id === boosterId)
    || career.activeBoosters.some((b) => b.id === boosterId);
}

export function purchaseShopItem(item) {
  const career = loadCareer();
  const price = Number(item.price) || 0;

  if (career.money < price) {
    return { ok: false, reason: "Not enough money.", career };
  }

  if (item.type === "decoration") {
    if (ownsDecoration(item.decorationKey, career)) {
      return { ok: false, reason: "You already own this decoration.", career };
    }
    career.money -= price;
    career.ownedDecorations.push(item.decorationKey);
    saveCareer(career);
    return { ok: true, career };
  }

  if (item.type === "booster") {
    if (hasPendingOrActiveBooster(item.id, career)) {
      return { ok: false, reason: "You already bought this booster for the next day.", career };
    }
    career.money -= price;
    career.pendingBoosters.push({
      id: item.id,
      effect: item.boosterEffect,
      value: item.boosterValue,
      name: item.name,
    });
    saveCareer(career);
    return { ok: true, career };
  }

  return { ok: false, reason: "Unknown item type.", career };
}

export function recordStudentGraded() {
  const career = loadCareer();
  career.studentsGradedToday = Math.min(STUDENTS_PER_DAY, career.studentsGradedToday + 1);
  saveCareer(career);
  return career;
}

export function isDayComplete(career = loadCareer()) {
  return career.studentsGradedToday >= STUDENTS_PER_DAY;
}

export function completeWorkDay(salaryAmount) {
  const career = loadCareer();
  const completedDay = career.day;
  const modifiers = getBoosterModifiers(career);
  const payout = Math.round(salaryAmount * modifiers.salaryMultiplier);

  career.money += payout;
  career.studentsGradedToday = 0;
  career.day += 1;
  career.activeBoosters = [];
  career.mistakeShieldUsed = false;
  saveCareer(career);

  return {
    career,
    completedDay,
    salaryPaid: payout,
    baseSalary: salaryAmount,
    salaryMultiplier: modifiers.salaryMultiplier,
  };
}

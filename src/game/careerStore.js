export const STUDENTS_PER_DAY = 3;
const STORAGE_KEY = "professor_career_v1";

function createDefaultCareer() {
  return {
    reputation: 0,
    money: 0,
    day: 1,
    studentsGradedToday: 0,
  };
}

export function loadCareer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultCareer();
    const parsed = JSON.parse(raw);
    return {
      reputation: Number.isFinite(parsed?.reputation) ? parsed.reputation : 0,
      money: Number.isFinite(parsed?.money) ? parsed.money : 0,
      day: Number.isFinite(parsed?.day) && parsed.day >= 1 ? parsed.day : 1,
      studentsGradedToday: Number.isFinite(parsed?.studentsGradedToday)
        ? Math.max(0, Math.min(STUDENTS_PER_DAY, parsed.studentsGradedToday))
        : 0,
    };
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
  career.money += salaryAmount;
  career.studentsGradedToday = 0;
  career.day += 1;
  saveCareer(career);
  return { career, completedDay, salaryPaid: salaryAmount };
}

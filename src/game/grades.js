export function gradeFromCorrectCount(correctCount) {
  if (correctCount >= 5) return "A";
  if (correctCount === 4) return "B";
  if (correctCount === 3) return "C";
  if (correctCount === 2) return "D";
  return "F";
}

export function isFailingGrade(correctCount) {
  const count = Number(correctCount);
  if (!Number.isFinite(count)) return false;
  const grade = gradeFromCorrectCount(count);
  return grade === "D" || grade === "F";
}

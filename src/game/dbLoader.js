import { publicAssetUrl } from "./assetUrl";
import { resolveStudentAvatarKey } from "./studentAvatars";

let cachedStudents = null;

function assertValidStudent(student) {
  if (!student || typeof student !== "object") return false;
  if (typeof student.id !== "string" || !student.id.trim()) return false;
  if (typeof student.name !== "string" || !student.name.trim()) return false;
  if (!Array.isArray(student.statements) || student.statements.length !== 5) return false;

  for (const s of student.statements) {
    if (!s || typeof s !== "object") return false;
    if (typeof s.statement !== "string" || !s.statement.trim()) return false;
    if (typeof s.isCorrect !== "boolean") return false;
    if (typeof s.explanation !== "string" || !s.explanation.trim()) return false;
  }

  return true;
}

export async function loadAllStudents() {
  if (cachedStudents) return cachedStudents;

  const response = await fetch(publicAssetUrl("data/students.json"));
  if (!response.ok) {
    throw new Error(`Failed to load students.json: ${response.status}`);
  }

  const data = await response.json();
  const students = data?.students;
  if (!Array.isArray(students) || students.length === 0) {
    throw new Error("Invalid students.json: expected { students: [...] }");
  }

  const normalized = students
    .filter(assertValidStudent)
    .map((student) => ({
      ...student,
      avatarKey: resolveStudentAvatarKey(student),
    }));
  if (normalized.length === 0) {
    throw new Error("Invalid students.json: no valid students (each must have exactly 5 statements)");
  }

  cachedStudents = normalized;
  return cachedStudents;
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function loadRandomStudent() {
  const students = await loadAllStudents();
  const [picked] = shuffle(students);
  return picked;
}

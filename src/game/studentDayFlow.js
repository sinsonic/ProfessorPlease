import { playStudentApproach } from "./classroomVisuals";
import { isDayComplete, loadCareer } from "./careerStore";
import { loadRandomStudent } from "./dbLoader";

export function getContinueButtonLabel() {
  return isDayComplete(loadCareer()) ? "END WORK DAY" : "NEXT STUDENT";
}

export async function continueAfterStudent(scene, { classroom = null } = {}) {
  if (isDayComplete(loadCareer())) {
    scene.scene.start("DayEndScene");
    return;
  }

  try {
    const student = await loadRandomStudent();
    if (classroom) {
      scene.children.list.forEach((child) => {
        if (child !== classroom?.root) child.setVisible(false);
      });
    }

    playStudentApproach(scene, {
      studentName: student.name,
      major: student.major,
      avatarKey: student.avatarKey,
      depth: 30,
      onComplete: () => {
        scene.scene.start("QuizScene", { student });
      },
    });
  } catch (error) {
    scene.add.text(540, 1700, `Could not load student: ${error.message}`, {
      fontFamily: "Arial",
      fontSize: "28px",
      color: "#dc2626",
      align: "center",
      wordWrap: { width: 900 },
    }).setOrigin(0.5).setDepth(40);
  }
}

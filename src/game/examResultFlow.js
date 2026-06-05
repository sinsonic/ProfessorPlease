import {
  buildSceneContext,
  pickSpecialSceneForResult,
} from "./specialScenesLoader";

export async function goToExamResult(scene, payload) {
  try {
    const sceneConfig = await pickSpecialSceneForResult(payload.correctCount);
    if (sceneConfig) {
      scene.scene.start("SpecialScene", {
        ...payload,
        sceneConfig,
        sceneContext: buildSceneContext(payload),
      });
      return;
    }
  } catch (error) {
    console.warn("Special scene selection failed:", error);
  }

  scene.scene.start("QuizSummaryScene", payload);
}

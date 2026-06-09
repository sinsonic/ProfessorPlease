import { hasSeenIntroCutscene, hasSeenStoryDay } from "./careerStore";
import { getBundledStoryBeatForDay, getStoryBeatForDay } from "./storyLoader";

export async function getUnseenStoryBeat(storyDay) {
  if (hasSeenStoryDay(storyDay)) return null;
  return getStoryBeatForDay(storyDay);
}

function getUnseenBundledBeat(storyDay) {
  if (hasSeenStoryDay(storyDay)) return null;
  return getBundledStoryBeatForDay(storyDay);
}

export function startGameAfterBoot(scene) {
  try {
    const beat = getUnseenBundledBeat(0);

    if (beat && !hasSeenIntroCutscene()) {
      scene.scene.start("IntroCutsceneScene", {
        nextScene: "StoryScene",
        nextSceneData: { storyDay: 0, nextScene: "WorldsScene" },
      });
      return;
    }

    if (beat) {
      scene.scene.start("StoryScene", { storyDay: 0, nextScene: "WorldsScene" });
      return;
    }

    scene.scene.start("WorldsScene");
  } catch (error) {
    console.error("Boot story flow failed:", error);
    scene.scene.start("WorldsScene");
  }
}

export async function continueAfterDayEnd(scene, completedDay) {
  const beat = await getUnseenStoryBeat(completedDay);
  if (beat) {
    scene.scene.start("StoryScene", {
      storyDay: completedDay,
      nextScene: "WorldsScene",
    });
    return;
  }
  scene.scene.start("WorldsScene");
}

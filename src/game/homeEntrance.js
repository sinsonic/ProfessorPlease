import { hasSeenHomeScreenIntro, markHomeScreenIntroSeen } from "./careerStore";

function slideIn(scene, target, { fromX, fromY, delay = 0, duration = 720, ease = "Back.easeOut" } = {}) {
  if (!target) return;

  const endX = target.x;
  const endY = target.y;
  if (fromX != null) target.x = fromX;
  if (fromY != null) target.y = fromY;
  target.setAlpha(1);

  scene.tweens.add({
    targets: target,
    x: endX,
    y: endY,
    duration,
    delay,
    ease,
  });
}

export function shouldPlayHomeEntrance() {
  return !hasSeenHomeScreenIntro();
}

export function playHomeEntrance(scene, {
  classroom,
  careerHud,
  logo,
  careerPanel,
  startButton,
  shopButton,
  hiddenButton,
} = {}) {
  const classroomTargets = [classroom?.root, classroom?.decorLayer].filter(Boolean);
  classroomTargets.forEach((target) => {
    slideIn(scene, target, {
      fromY: target.y + 420,
      delay: 0,
      duration: 900,
      ease: "Cubic.easeOut",
    });
  });

  slideIn(scene, careerHud?.root, {
    fromY: -180,
    delay: 120,
    duration: 680,
  });

  slideIn(scene, logo, {
    fromY: logo.y - 280,
    delay: 220,
    duration: 760,
  });

  slideIn(scene, careerPanel, {
    fromX: -920,
    delay: 340,
    duration: 820,
  });

  slideIn(scene, startButton, {
    fromY: startButton.y + 320,
    delay: 480,
    duration: 780,
  });

  slideIn(scene, hiddenButton, {
    fromX: hiddenButton.x - 240,
    fromY: hiddenButton.y + 120,
    delay: 560,
    duration: 700,
  });

  slideIn(scene, shopButton, {
    fromX: shopButton.x + 240,
    fromY: shopButton.y + 120,
    delay: 640,
    duration: 700,
  });

  scene.time.delayedCall(900, () => markHomeScreenIntroSeen());
}

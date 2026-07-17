import { exercises } from '../data/exercises';

const durationConfig = {
  5:  { baseCount: 1, directionalCount: 1, stretch: false, coreCount: 0 },
  10: { baseCount: 2, directionalCount: 1, stretch: true, coreCount: 0 },
  15: { baseCount: 3, directionalCount: 2, stretch: true, coreCount: 1 },
  20: { baseCount: 4, directionalCount: 3, stretch: true, coreCount: 2 },
};

export function generatePlan({ directionalPreference, duration, recommendedExercises }) {
  const config = durationConfig[duration] || durationConfig[10];
  const plan = [];

  let directionalPool;
  if (recommendedExercises && recommendedExercises.length > 0) {
    directionalPool = exercises.filter((e) => recommendedExercises.includes(e.id));
  } else {
    directionalPool = exercises.filter(
      (e) => e.category === '定向' && (e.directionalType === directionalPreference || e.directionalType === '通用')
    );
  }
  const selectedDirectional = directionalPool.slice(0, config.directionalCount);

  const basePool = exercises.filter((e) => e.category === '基础');
  const selectedBase = basePool.slice(0, config.baseCount);

  let selectedCore = [];
  if (config.coreCount > 0) {
    const corePool = exercises.filter((e) => e.directionalType === '核心稳定' && !selectedDirectional.includes(e));
    selectedCore = corePool.slice(0, config.coreCount);
  }

  plan.push(...selectedBase);
  plan.push(...selectedDirectional);
  plan.push(...selectedCore);

  if (config.stretch) {
    const stretch = exercises.find((e) => e.id === 'piriformis-stretch');
    if (stretch) plan.push(stretch);
  }

  return plan.map((ex, index) => ({ ...ex, order: index + 1 }));
}

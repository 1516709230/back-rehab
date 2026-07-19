import { exercises } from '../data/exercises';

const durationConfig = {
  5:  { baseCount: 1, directionalCount: 1, stretch: false, coreCount: 0 },
  10: { baseCount: 2, directionalCount: 1, stretch: true, coreCount: 0 },
  15: { baseCount: 3, directionalCount: 2, stretch: true, coreCount: 1 },
  20: { baseCount: 4, directionalCount: 3, stretch: true, coreCount: 2 },
};

export function generatePlan({ directionalPreference, duration, recommendedExercises }) {
  const config = durationConfig[duration] || durationConfig[10];
  
  const directionalPool = recommendedExercises && recommendedExercises.length > 0
    ? exercises.filter(e => recommendedExercises.includes(e.id))
    : exercises.filter(e => e.category === '定向' && 
                           (e.directionalType === directionalPreference || e.directionalType === '通用'));
  
  const selectedDirectional = directionalPool.slice(0, config.directionalCount);
  const selectedBase = exercises.filter(e => e.category === '基础').slice(0, config.baseCount);
  
  const selectedCore = config.coreCount > 0
    ? exercises.filter(e => e.directionalType === '核心稳定' && !selectedDirectional.includes(e))
               .slice(0, config.coreCount)
    : [];

  const plan = [
    ...selectedBase,
    ...selectedDirectional,
    ...selectedCore,
  ];

  if (config.stretch) {
    const piriformisStretch = exercises.find(e => e.id === 'piriformis-stretch');
    if (piriformisStretch && !plan.includes(piriformisStretch)) {
      plan.push(piriformisStretch);
    }
  }

  return plan.map((ex, index) => ({ ...ex, order: index + 1 }));
}

export function generateWeeklyPlan(params) {
  const dailyPlan = generatePlan(params);
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  
  return days.map((day, index) => ({
    day: index + 1,
    dayName: day,
    focus: params.directionalPreference || '核心训练',
    exercises: dailyPlan,
  }));
}
import { resultTemplates } from '../data/templates';

export function runAssessment(answers) {
  const hasRedFlag = answers.redFlag && answers.redFlag !== 'none';

  const nerveScore = calculateNerveScore(answers);
  const directionalPreference = determineDirectionalPreference(answers);
  const type = classifyCondition(answers, nerveScore);

  const template = resultTemplates[type] || resultTemplates.mixed;

  return {
    type: template.type,
    directionalPreference,
    summary: template.summary,
    hasRedFlag,
    recommendedExercises: template.recommendedExercises,
  };
}

function calculateNerveScore(answers) {
  return (
    (answers.legPain === 'weakness' ? 2 : 
     answers.legPain === 'radicular' ? 1.5 : 
     answers.legPain === 'numbness' ? 1 : 0) +
    (answers.painNature === 'burning' || answers.painNature === 'sharp' ? 1 : 0) +
    (answers.painLocation === 'leg' ? 1 : 0)
  );
}

function determineDirectionalPreference(answers) {
  const { aggravatedBy, relievedBy } = answers;
  if (aggravatedBy === 'flexion' || relievedBy === 'extension') {
    return '伸展';
  } else if (aggravatedBy === 'extension' || relievedBy === 'flexion') {
    return '屈曲';
  }
  return '通用';
}

function classifyCondition(answers, nerveScore) {
  const { painLocation, painNature, aggravatedBy, onset } = answers;
  
  const locationLeg = painLocation === 'leg';
  const natureRadicular = painNature === 'sharp' || painNature === 'burning';
  const aggravatesFlexion = aggravatedBy === 'flexion';
  const aggravatesExtension = aggravatedBy === 'extension';

  if (nerveScore >= 2.5 && (locationLeg || natureRadicular)) {
    return 'neuro';
  } else if ((locationLeg || natureRadicular) && aggravatesFlexion) {
    return 'disc';
  } else if (aggravatesExtension) {
    return 'joint';
  } else if (nerveScore <= 0 && onset === 'sudden' && !aggravatesExtension && !aggravatesFlexion) {
    return 'muscle';
  } else if (nerveScore <= 1 && aggravatesFlexion) {
    return 'disc';
  }
  return 'mixed';
}
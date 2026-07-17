export function runAssessment(answers) {
  const redFlagAnswer = answers.redFlag;
  const hasRedFlag = redFlagAnswer && redFlagAnswer !== 'none';

  const nerveScore = (
    (answers.legPain === 'weakness' ? 2 : answers.legPain === 'radicular' ? 1.5 : answers.legPain === 'numbness' ? 1 : 0) +
    (answers.painNature === 'burning' || answers.painNature === 'sharp' ? 1 : 0) +
    (answers.painLocation === 'leg' ? 1 : 0)
  );

  const aggravatedBy = answers.aggravatedBy;
  const relievedBy = answers.relievedBy;
  let directionalPreference = '通用';
  if (aggravatedBy === 'flexion' || relievedBy === 'extension') {
    directionalPreference = '伸展';
  } else if (aggravatedBy === 'extension' || relievedBy === 'flexion') {
    directionalPreference = '屈曲';
  }

  let type;
  const locationLeg = answers.painLocation === 'leg';
  const natureRadicular = answers.painNature === 'sharp' || answers.painNature === 'burning';
  const aggravatesFlexion = aggravatedBy === 'flexion';
  const aggravatesExtension = aggravatedBy === 'extension';

  if (nerveScore >= 2.5 && (locationLeg || natureRadicular)) {
    type = 'neuro';
  } else if ((locationLeg || natureRadicular) && aggravatesFlexion) {
    type = 'disc';
  } else if (aggravatesExtension) {
    type = 'joint';
  } else if (nerveScore <= 0 && answers.onset === 'sudden' && !aggravatesExtension && !aggravatesFlexion) {
    type = 'muscle';
  } else if (nerveScore <= 1 && aggravatesFlexion) {
    type = 'disc';
  } else {
    type = 'mixed';
  }

  const resultTemplates = {
    disc: {
      type: '椎间盘源性',
      summary: '你的症状模式与椎间盘相关问题一致。推荐以伸展为主的康复方向（McKenzie 方法），避免长时间弯腰和负重。',
      recommendedExercises: ['prone-lying', 'prone-press-up', 'standing-extension', 'cat-camel'],
    },
    joint: {
      type: '小关节源性',
      summary: '你的症状模式与小关节综合征一致。推荐以屈曲为主的康复方向，避免长时间后仰和扭转。',
      recommendedExercises: ['knee-to-chest', 'seated-flexion', 'bird-dog', 'cat-camel'],
    },
    muscle: {
      type: '肌肉软组织源性',
      summary: '你的症状模式与肌肉或软组织问题一致。推荐以核心稳定为主的康复方向。',
      recommendedExercises: ['cat-camel', 'dead-bug', 'bird-dog', 'glute-bridge'],
    },
    mixed: {
      type: '混合型',
      summary: '你的症状模式不典型，可能涉及多种因素。建议从最舒适的通用动作开始。',
      recommendedExercises: ['cat-camel', 'transverse-activation', 'glute-bridge', 'piriformis-stretch'],
    },
    neuro: {
      type: '神经源性',
      summary: '你的症状涉及神经放射痛。建议以神经滑动和温和的伸展为主。建议就医进一步评估。',
      recommendedExercises: ['cat-camel', 'prone-lying', 'piriformis-stretch'],
    },
  };

  const template = resultTemplates[type] || resultTemplates.mixed;

  return {
    type: template.type,
    directionalPreference,
    summary: template.summary,
    hasRedFlag,
    recommendedExercises: template.recommendedExercises,
  };
}

export const resultTemplates = {
  disc: {
    type: '椎间盘源性',
    directionalPreference: '伸展',
    summary: '你的症状模式与椎间盘相关问题一致。推荐以伸展为主的康复方向（McKenzie 方法），避免长时间弯腰和负重。如果出现腿部力量下降，请及时就医。',
    recommendedExercises: ['prone-lying', 'prone-press-up', 'standing-extension', 'cat-camel'],
  },
  joint: {
    type: '小关节源性',
    directionalPreference: '屈曲',
    summary: '你的症状模式与小关节综合征一致。推荐以屈曲为主的康复方向，避免长时间后仰和扭转。核心稳定训练对预防复发有帮助。',
    recommendedExercises: ['knee-to-chest', 'seated-flexion', 'bird-dog', 'cat-camel'],
  },
  muscle: {
    type: '肌肉软组织源性',
    directionalPreference: '核心稳定',
    summary: '你的症状模式与肌肉或软组织问题一致。推荐以核心稳定为主的康复方向，逐步恢复腰部的活动能力和力量。',
    recommendedExercises: ['cat-camel', 'dead-bug', 'bird-dog', 'glute-bridge'],
  },
  mixed: {
    type: '混合型',
    directionalPreference: '通用',
    summary: '你的症状模式不典型，可能涉及多种因素。建议从最舒适的通用动作开始，观察症状变化。如果持续不改善，建议就医评估。',
    recommendedExercises: ['cat-camel', 'transverse-activation', 'glute-bridge', 'piriformis-stretch'],
  },
  neuro: {
    type: '神经源性',
    directionalPreference: '伸展',
    summary: '你的症状涉及神经放射痛。建议以神经滑动和温和的伸展为主。避免高强度训练，建议就医进一步评估。',
    recommendedExercises: ['cat-camel', 'prone-lying', 'piriformis-stretch'],
  },
};

export const directionalLabels = {
  '通用': '通用',
  '伸展': '伸展',
  '屈曲': '屈曲',
  '核心稳定': '核心稳定',
};

export const phaseLabels = {
  'acute': '急性期',
  'sub-acute': '亚急性期',
  'maintenance': '维持期',
};

export const redFlagOptions = {
  none: '以上都没有',
  fever: '发烧且背部疼痛',
  bladder: '大小便控制困难',
  weakLeg: '腿部力量持续变差',
};
export const questions = [
  {
    id: 'painLocation',
    question: '你的疼痛主要在哪个位置？',
    options: [
      { value: 'center', label: '腰部正中央' },
      { value: 'unilateral', label: '腰部一侧' },
      { value: 'buttock', label: '臀部区域（单侧或双侧）' },
      { value: 'leg', label: '腰部放射到腿部或脚' },
    ],
  },
  {
    id: 'painNature',
    question: '疼痛是什么样的感觉？',
    options: [
      { value: 'dull', label: '钝痛、酸胀感' },
      { value: 'sharp', label: '刺痛、针扎感' },
      { value: 'burning', label: '灼烧感、麻刺感' },
      { value: 'stiff', label: '僵硬为主，轻微疼痛' },
    ],
  },
  {
    id: 'aggravatedBy',
    question: '哪些动作会让疼痛加重？',
    options: [
      { value: 'flexion', label: '弯腰、久坐、穿袜子' },
      { value: 'extension', label: '后仰、久站、走路' },
      { value: 'rotation', label: '转身、侧弯' },
      { value: 'none', label: '没有明显的加重动作' },
    ],
  },
  {
    id: 'relievedBy',
    question: '哪些动作会让疼痛缓解？',
    options: [
      { value: 'lying', label: '躺下来或屈膝' },
      { value: 'walking', label: '走动或改变姿势' },
      { value: 'extension', label: '后仰或挺腰' },
      { value: 'flexion', label: '弯腰或蜷缩' },
    ],
  },
  {
    id: 'legPain',
    question: '腿部有没有以下症状？',
    options: [
      { value: 'none', label: '没有腿部症状' },
      { value: 'numbness', label: '麻木或蚂蚁爬的感觉' },
      { value: 'weakness', label: '腿部无力或脚抬不起来' },
      { value: 'radicular', label: '从腰部到脚的一条线放射痛' },
    ],
  },
  {
    id: 'onset',
    question: '这次疼痛是怎么开始的？',
    options: [
      { value: 'sudden', label: '突然发作（比如弯腰捡东西后）' },
      { value: 'gradual', label: '慢慢出现的，没有明显诱因' },
      { value: 'injury', label: '受伤后（摔倒、运动损伤等）' },
      { value: 'posture', label: '长期不良姿势（久坐/久站）' },
    ],
  },
  {
    id: 'redFlag',
    question: '以下情况是否出现？（如有请就医）',
    isRedFlag: true,
    options: [
      { value: 'none', label: '以上都没有' },
      { value: 'fever', label: '发烧且背部疼痛' },
      { value: 'bladder', label: '大小便控制困难' },
      { value: 'weakLeg', label: '腿部力量持续变差' },
    ],
  },
];

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

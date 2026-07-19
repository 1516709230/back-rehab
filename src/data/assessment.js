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
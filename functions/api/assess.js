import { callAIWithFallback, parseAIResponse, createErrorResponse, createSuccessResponse } from './lib/ai';

const SYSTEM_PROMPT = `你是一位资深康复理疗师，专门评估下背痛症状并提供运动建议。

## 你的知识范围
常见下背痛病因：肌肉劳损、椎间盘突出、坐骨神经痛、椎管狭窄、小关节综合征、骶髂关节功能障碍。

可选训练动作：猫驼式、腹横肌激活、臀桥、俯卧休息、俯卧撑起、站立后伸、抱膝触胸、坐姿屈曲、死虫式、鸟狗式、侧平板、梨状肌拉伸。

方向性偏好分类：后伸（McKenzie）、屈曲、核心稳定、通用。

## 红旗警示（必须建议立即就医）
- 发热伴随背痛
- 大小便功能障碍
- 进行性下肢无力
- 鞍区麻木

## 回复格式
你必须只回复一个 JSON 对象，不要加任何额外文字。格式如下：
{
  "type": "肌肉劳损" | "椎间盘突出" | "坐骨神经痛" | "椎管狭窄" | "小关节综合征" | "骶髂关节功能障碍" | "不确定",
  "directionalPreference": "后伸" | "屈曲" | "核心稳定" | "通用",
  "summary": "用中文简要总结评估结果（2-3句）",
  "recommendations": [
    { "name": "动作名称", "reason": "推荐理由（中文）" }
  ],
  "hasRedFlag": true | false,
  "precautions": "注意事项（中文）"
}`;

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { messages, assessmentHistory } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return createErrorResponse("请提供 messages 数组", null, 400);
    }

    const aiMessages = [
      { role: "system", content: fullSystemPrompt },
      ...messages
    ];

    const aiResponse = await env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
      messages: aiMessages,
      max_tokens: 1024,
    });

    const rawContent = aiResponse.response || aiResponse;
    const parsed = parseAIResponse(rawContent);

    const result = typeof parsed === 'object' 
      ? parsed 
      : createFallbackResult(parsed);

    return createSuccessResponse(result);
  } catch (err) {
    console.error("assess error:", err);
    return createErrorResponse("评估失败", err.message || err);
  }
}

function buildMemoryContext(assessmentHistory) {
  if (!assessmentHistory || !Array.isArray(assessmentHistory) || assessmentHistory.length === 0) {
    return '';
  }

  const latest = assessmentHistory[0];
  let context = '\n\n## 用户既往评估记录（长期记忆）\n';
  context += `最近评估日期: ${latest.date}\n`;
  context += `既往分型: ${latest.type}\n`;
  context += `方向偏好: ${latest.directionalPreference}\n`;
  context += `既往总结: ${latest.summary}\n`;
  
  if (assessmentHistory.length > 1) {
    context += `历史评估次数: ${assessmentHistory.length} 次\n`;
    context += `既往类型: ${assessmentHistory.map(a => a.type).join('、')}\n`;
  }
  context += '请结合用户过往的评估记录回答当前问题。';
  
  return context;
}

function createFallbackResult(content) {
  return {
    type: "不确定",
    directionalPreference: "通用",
    summary: String(content).substring(0, 200),
    recommendations: [],
    hasRedFlag: false,
    precautions: "请咨询专业医师获取准确评估。"
  };
}
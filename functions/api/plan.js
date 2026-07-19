import { callAIWithFallback, parseAIResponse, createErrorResponse, createSuccessResponse } from './lib/ai';

const SYSTEM_PROMPT = `You are a professional rehab plan designer for lower back pain. Generate structured weekly plans.

Available exercises:
- cat-camel: 猫驼式 (spinal mobilization)
- transverse-activation: 腹横肌激活 (core activation)
- glute-bridge: 臀桥 (hip stability)
- prone-lying: 俯卧支撑 (McKenzie extension)
- prone-press-up: 俯卧撑起 (McKenzie advanced)
- standing-extension: 站立后伸 (extension)
- knee-to-chest: 仰卧抱膝 (flexion)
- seated-flexion: 坐姿屈曲 (flexion)
- dead-bug: 死虫式 (core stability)
- bird-dog: 鸟狗式 (core stability)
- side-plank: 侧平板 (lateral core)
- piriformis-stretch: 梨状肌拉伸 (stretch)

Phases: acute(急性期 1-7d gentle only NO strengthening), sub-acute(亚急性期 1-6w gradual), maintenance(维持期 6w+ full program)
Short sessions(5-10min): fewer exercises. Long sessions(15-20min): more exercises + stretches.
Always include piriformis-stretch at end of stretch days.

Respond ONLY with JSON, no markdown:
{"phase":"急性期|亚急性期|维持期","weeklySchedule":[{"day":1,"focus":"重点","exercises":[{"id":"cat-camel","name":"猫驼式","sets":"3","reps":"8-10次","hold":"","note":"说明"}]}],"totalWeeks":4,"notes":"总体建议"}`;

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { phase = "sub-acute", painLevel = 3, duration = 15, notes = "", assessment = null } = body;

    const userContent = buildUserContent(phase, painLevel, duration, notes, assessment);
    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ];

    const aiResponse = await callAIWithFallback(env, aiMessages, 2048);
    const rawContent = aiResponse.response || aiResponse;
    const parsed = parseAIResponse(rawContent);

    const result = typeof parsed === 'object' 
      ? parsed 
      : createFallbackResult(parsed);

    return createSuccessResponse(result);
  } catch (err) {
    console.error("plan error:", err);
    return createErrorResponse("生成失败", err.message || err);
  }
}

function buildUserContent(phase, painLevel, duration, notes, assessment) {
  let content = `Generate a ${phase} phase rehab plan. Pain level: ${painLevel}/10. Session duration: ${duration} minutes.`;
  
  if (notes) {
    content += ` Notes: ${notes}`;
  }
  
  if (assessment) {
    content += ` Assessment history: type=${assessment.type}, direction=${assessment.directionalPreference}, summary=${assessment.summary}. Use this assessment context to personalize the plan.`;
  }
  
  return content;
}

function createFallbackResult(content) {
  return { 
    phase: "亚急性期", 
    weeklySchedule: [], 
    totalWeeks: 4, 
    notes: String(content).substring(0, 300) 
  };
}
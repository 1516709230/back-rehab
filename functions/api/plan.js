/**
 * POST /api/plan
 * AI-powered rehab plan generator using Workers AI.
 * Generates a structured weekly exercise plan based on phase, pain level, and duration.
 */
export async function onRequestPost({ request, env }) {
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

  try {
    const body = await request.json();
    const { phase = "sub-acute", painLevel = 3, duration = 15, notes = "" } = body;

    const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate a ${phase} phase rehab plan. Pain level: ${painLevel}/10. Session duration: ${duration} minutes. ${notes ? "Notes: " + notes : ""}` },
      ],
      max_tokens: 2048,
    });

    const rawContent = aiResponse.response || aiResponse;
    const cleaned = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { phase: "亚急性期", weeklySchedule: [], totalWeeks: 4, notes: cleaned.substring(0, 300) };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    console.error("plan error:", err);
    return new Response(
      JSON.stringify({ error: "生成失败，请稍后重试" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

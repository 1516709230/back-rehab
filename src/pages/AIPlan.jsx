import { useState, useEffect } from 'react';
import { Calendar, Sparkles, Loader2, ChevronRight, RefreshCw } from 'lucide-react';
import { getLatestAssessment } from '../db';

const phases = [
  { key: 'acute', label: '急性期', desc: '1-7天' },
  { key: 'sub-acute', label: '亚急性期', desc: '1-6周' },
  { key: 'maintenance', label: '维持期', desc: '6周+' },
];

const durations = [5, 10, 15, 20];

export default function AIPlan() {
  const [phase, setPhase] = useState('sub-acute');
  const [painLevel, setPainLevel] = useState(3);
  const [duration, setDuration] = useState(15);
  const [notes, setNotes] = useState('');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [latestAssessment, setLatestAssessment] = useState(null);

  useEffect(() => {
    getLatestAssessment().then(setLatestAssessment);
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase,
          painLevel,
          duration,
          notes,
          assessment: latestAssessment
            ? { type: latestAssessment.type, directionalPreference: latestAssessment.directionalPreference, summary: latestAssessment.summary }
            : null
        }),
      });
      if (!res.ok) throw new Error('生成失败');
      const data = await res.json();
      setPlan(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setPlan(null); setError(null); };

  if (plan) {
    return (
      <div className="min-h-screen p-4 pb-20">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={22} className="text-blue-600" />
            <h1 className="text-lg font-bold">AI 训练计划</h1>
          </div>
          <button onClick={handleReset} className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">
            <RefreshCw size={14} /> 重新生成
          </button>
        </header>

        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">{plan.phase}</span>
          <span className="text-sm text-gray-500">{plan.totalWeeks} 周计划</span>
        </div>

        <div className="space-y-3">
          {plan.weeklySchedule?.map((day) => (
            <div key={day.day} className="rounded-xl bg-white border border-gray-200 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">第 {day.day} 天</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{day.focus}</span>
              </div>
              <div className="space-y-2">
                {day.exercises?.map((ex, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                        {ex.sets && <span>{ex.sets} 组</span>}
                        {ex.reps && <span>{ex.reps}</span>}
                        {ex.hold && <span>保持 {ex.hold}</span>}
                      </div>
                      {ex.note && <p className="mt-1 text-xs text-gray-400">{ex.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {plan.notes && (
          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-800 leading-relaxed">
            <p className="font-medium mb-1">总体建议</p>
            {plan.notes}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">个性化计划，请按照自身感觉调整强度</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <header className="mb-6 flex items-center gap-2">
        <Calendar size={22} className="text-blue-600" />
        <h1 className="text-lg font-bold">AI 训练计划</h1>
      </header>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">恢复阶段</label>
          <div className="flex gap-2">
            {phases.map((p) => (
              <button
                key={p.key}
                onClick={() => setPhase(p.key)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-center transition-colors ${
                  phase === p.key ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-xs opacity-70">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">疼痛程度</label>
            <span className="text-sm font-bold text-blue-600">{painLevel}/10</span>
          </div>
          <input
            type="range"
            min="0" max="10"
            value={painLevel}
            onChange={(e) => setPainLevel(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>无痛</span><span>剧痛</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">每次时长（分钟）</label>
          <div className="flex gap-2">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 rounded-xl border py-2 text-sm transition-colors ${
                  duration === d ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {d} 分钟
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">补充说明（可选）</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="如：医生建议、特殊限制..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-300 resize-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> 生成中...</>
          ) : (
            <><Sparkles size={18} /> 生成计划</>
          )}
        </button>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
            <button onClick={handleGenerate} className="ml-2 underline">重试</button>
          </div>
        )}
      </div>
    </div>
  );
}

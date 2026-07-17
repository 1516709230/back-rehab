import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { generatePlan } from '../logic/exercisePlan';
import { saveDailyLog, savePainRecord, getDailyLog, getLatestAssessment } from '../db';
import DurationPicker from '../components/DurationPicker';
import ExerciseCard from '../components/ExerciseCard';
import NprsSlider from '../components/NprsSlider';
import SittingTimer from '../components/SittingTimer';
import { Flame } from 'lucide-react';

export default function Home() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [duration, setDuration] = useState(10);
  const [plan, setPlan] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [showNprs, setShowNprs] = useState(false);
  const [painScore, setPainScore] = useState(0);
  const [assessment, setAssessment] = useState(null);
  const [streak, setStreak] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    Promise.all([
      getDailyLog(today),
      getLatestAssessment(),
    ]).then(([log, assess]) => {
      if (assess) setAssessment(assess);
      if (log && log.isComplete) {
        setCompletedIds(new Set(log.completedExercises || []));
        setPainScore(log.painScore || 0);
        setShowNprs(true);
      }
      setInitialized(true);
    });
  }, [today]);

  useEffect(() => {
    if (!initialized || !assessment) {
      setPlan([]);
      return;
    }
    const p = generatePlan({
      directionalPreference: assessment.directionalPreference,
      duration,
      recommendedExercises: assessment.recommendedExercises,
    });
    setPlan(p);
  }, [duration, assessment, initialized]);

  const toggleExercise = useCallback((id) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (plan.length > 0 && completedIds.size === plan.length) {
      setShowNprs(true);
    }
  }, [completedIds, plan]);

  const handleLog = async () => {
    await savePainRecord({ date: today, score: painScore });
    await saveDailyLog({
      date: today,
      duration,
      completedExercises: [...completedIds],
      painScore,
      isComplete: true,
    });
  };

  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(format(d, 'yyyy-MM-dd'));
    }
    Promise.all(dates.map((d) => getDailyLog(d))).then((logs) => {
      let count = 0;
      for (const log of logs) {
        if (log && log.isComplete) count++;
        else break;
      }
      setStreak(count);
    });
  }, [today]);

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <Flame size={48} className="mb-4 text-gray-300" />
        <h2 className="text-lg font-medium text-gray-600">还没有评估</h2>
        <p className="mt-2 text-sm text-gray-500">请先完成腰部评估，获取个性化方案</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">今日康复</h1>
        <div className="flex items-center gap-1 text-sm text-orange-500">
          <Flame size={16} /> <span>连续 {streak} 天</span>
        </div>
      </div>

      <SittingTimer />

      <DurationPicker value={duration} onChange={setDuration} />

      {plan.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-600">
            今日方案（{duration} 分钟 · {plan.length} 个动作）
          </h2>
          {plan.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              completed={completedIds.has(ex.id)}
              onToggle={() => toggleExercise(ex.id)}
            />
          ))}
        </div>
      )}

      {showNprs && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30">
          <div className="w-full rounded-t-2xl bg-white p-6 pb-10">
            <NprsSlider value={painScore} onChange={setPainScore} />
            <button
              onClick={handleLog}
              className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-medium text-white"
            >
              完成记录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

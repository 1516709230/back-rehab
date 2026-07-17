import { useState } from 'react';
import { questions } from '../data/assessment';
import { runAssessment } from '../logic/assessmentEngine';
import { saveAssessment } from '../db';
import { ClipboardList, AlertTriangle } from 'lucide-react';

export default function Assessment() {
  const [step, setStep] = useState('intro');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    const currentQ = questions[step];
    if (step >= questions.length - 1) {
      const assessmentResult = runAssessment(newAnswers);
      const record = {
        date: new Date().toISOString(),
        answers: newAnswers,
        ...assessmentResult,
      };
      saveAssessment(record);
      setResult(assessmentResult);
      setStep('done');
    } else {
      setStep(step + 1);
    }
  };

  if (step === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <ClipboardList size={48} className="mb-4 text-blue-600" />
        <h2 className="text-xl font-bold">腰部评估</h2>
        <p className="mt-2 text-sm text-gray-500">回答几个简单问题，我们将评估你的腰部状况</p>
        <p className="mt-1 text-xs text-gray-400">约需 2 分钟</p>
        <button
          onClick={() => setStep(0)}
          className="mt-6 rounded-xl bg-blue-600 px-8 py-3 font-medium text-white"
        >
          开始评估
        </button>
      </div>
    );
  }

  if (step === 'done' && result) {
    return (
      <div className="space-y-4 p-4 pb-8">
        <h2 className="text-xl font-bold">评估结果</h2>
        {result.hasRedFlag && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle size={20} />
              <span className="font-medium">建议就医</span>
            </div>
            <p className="mt-1 text-sm text-red-600">
              你的部分症状可能需要专业医疗评估，建议及时就医。
            </p>
          </div>
        )}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">分型</div>
          <div className="text-lg font-bold">{result.type}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">推荐方向</div>
          <div className="text-lg font-bold">{result.directionalPreference}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">建议</div>
          <p className="mt-1 text-base leading-relaxed">{result.summary}</p>
        </div>
        <button
          onClick={() => { setStep('intro'); setAnswers({}); setResult(null); }}
          className="w-full rounded-xl border border-gray-300 py-3 text-gray-600"
        >
          重新评估
        </button>
        <p className="text-xs text-gray-400">
          本评估不构成医疗诊断，仅供参考。如症状持续请就医。
        </p>
      </div>
    );
  }

  const currentQuestion = questions[step];
  return (
    <div className="space-y-6 p-4 pb-8">
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400">{step + 1}/{questions.length}</span>
      </div>

      <h2 className="text-lg font-bold">{currentQuestion.question}</h2>
      <div className="space-y-2">
        {currentQuestion.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(currentQuestion.id, opt.value)}
            className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

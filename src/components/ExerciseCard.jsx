import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Circle } from 'lucide-react';

export default function ExerciseCard({ exercise, completed, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const setsReps = [
    exercise.sets && `${exercise.sets} 组`,
    exercise.reps && ` / ${exercise.reps}`,
    exercise.hold && ` / 保持 ${exercise.hold}`,
  ].filter(Boolean).join('');

  return (
    <div className={`rounded-xl border p-4 transition-colors ${
      completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onToggle} className="text-blue-600">
            {completed ? <CheckCircle size={24} className="text-green-500" /> : <Circle size={24} />}
          </button>
          <div>
            <div className="font-medium">{exercise.name}</div>
            {setsReps && <div className="text-xs text-gray-500">{setsReps}</div>}
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 border-t border-gray-100 pt-3 text-sm leading-relaxed text-gray-600">
          <p>{exercise.description}</p>
          {exercise.tips && <p className="mt-2 text-xs text-blue-600">提示：{exercise.tips}</p>}
        </div>
      )}
    </div>
  );
}

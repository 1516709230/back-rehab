export default function DurationPicker({ value, onChange }) {
  const options = [
    { value: 5, label: '5 分钟', desc: '快速版' },
    { value: 10, label: '10 分钟', desc: '标准版' },
    { value: 15, label: '15 分钟', desc: '完整版' },
    { value: 20, label: '20+ 分钟', desc: '强化版' },
  ];
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-gray-600">选择今日时长</h2>
      <div className="grid grid-cols-4 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border-2 p-2 text-center transition-colors ${
              value === opt.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <div className="text-lg font-bold">{opt.label}</div>
            <div className="text-xs">{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

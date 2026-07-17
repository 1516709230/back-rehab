export default function NprsSlider({ value, onChange }) {
  const getLabel = (v) => {
    if (v === 0) return '无痛';
    if (v <= 3) return '轻度';
    if (v <= 6) return '中度';
    return '重度';
  };
  return (
    <div className="space-y-3">
      <h3 className="text-center font-medium">你今天感觉怎么样？（0 = 无痛，10 = 最痛）</h3>
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>0 无痛</span>
        <span className="text-lg font-bold text-blue-600">{value}</span>
        <span>10 最痛</span>
      </div>
      <p className="text-center text-sm text-gray-500">{getLabel(value)}</p>
    </div>
  );
}

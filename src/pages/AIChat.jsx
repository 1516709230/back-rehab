import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertTriangle, Loader2, Brain } from 'lucide-react';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, result, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      if (!res.ok) throw new Error('请求失败');
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.summary }]);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex items-center gap-2 border-b bg-white px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
          <Brain size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="font-semibold text-gray-900">AI 康复助手</h1>
          <p className="text-xs text-gray-400">描述你的症状，获取个性化建议</p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Sparkles size={40} className="mx-auto mb-3 text-blue-300" />
            <p className="text-sm">告诉我你的腰部不适</p>
            <p className="mt-1 text-xs">比如："我弯腰时腰疼，坐久了也疼"</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-white border border-gray-200 px-4 py-3">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span className="text-sm text-gray-400">分析中...</span>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            {result.hasRedFlag && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle size={18} />
                  <span className="text-sm font-medium">建议及时就医</span>
                </div>
                <p className="mt-1 text-xs text-red-600">部分症状可能需要专业医疗评估</p>
              </div>
            )}

            <div className="rounded-xl bg-white border border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{result.type}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{result.directionalPreference}</span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{result.summary}</p>
            </div>

            {result.recommendations?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">推荐动作</p>
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="rounded-xl bg-white border border-gray-200 p-3">
                    <p className="text-sm font-medium text-gray-900">{rec.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{rec.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {result.precautions && (
              <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
                <span className="font-medium text-gray-700">注意事项：</span>{result.precautions}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
            <button onClick={handleSend} className="ml-2 underline">重试</button>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="border-t bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述你的腰部症状..."
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

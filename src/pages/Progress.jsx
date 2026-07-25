import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { getLogsInRange, getPainRecords, getDailyLog } from '../db';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarDays, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function Progress() {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [painData, setPainData] = useState([]);
  const [weekRate, setWeekRate] = useState(0);
  const [monthRate, setMonthRate] = useState(0);

  const today = new Date();

  useEffect(() => {
    const start = startOfMonth(viewMonth);
    const end = endOfMonth(viewMonth);
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    Promise.all([
      getLogsInRange(startStr, endStr),
      getPainRecords(),
    ]).then(([monthLogs, painRecords]) => {
      setLogs(monthLogs);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentPain = painRecords
        .filter((r) => new Date(r.date) >= thirtyDaysAgo)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((r) => ({ date: format(new Date(r.date), 'MM/dd'), score: r.score }));
      setPainData(recentPain);

      // 本周完成率：始终用本周日期（不受 viewMonth 影响）
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        weekDays.push(format(d, 'yyyy-MM-dd'));
      }
      Promise.all(weekDays.map((d) => getDailyLog(d))).then((weekLogs) => {
        const weekCompleted = weekLogs.filter((l) => l && l.isComplete).length;
        setWeekRate(Math.round((weekCompleted / 7) * 100));
      });

      // 月完成率：只算到今天为止的当月天数
      const todayStr = format(today, 'yyyy-MM-dd');
      const allMonthDays = eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));
      const daysUpToToday = allMonthDays.filter((d) => d <= todayStr);
      const monthCompleted = monthLogs.filter((l) => l.isComplete).length;
      setMonthRate(daysUpToToday.length > 0 ? Math.round((monthCompleted / daysUpToToday.length) * 100) : 0);
    });
  }, [viewMonth]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  });

  return (
    <div className="space-y-4 p-4 pb-8">
      <h1 className="text-xl font-bold">康复进度</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 size={18} />
            <span className="text-sm text-gray-600">本周完成率</span>
          </div>
          <div className="mt-1 text-2xl font-bold">{weekRate}%</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-blue-600">
            <CalendarDays size={18} />
            <span className="text-sm text-gray-600">本月完成率</span>
          </div>
          <div className="mt-1 text-2xl font-bold">{monthRate}%</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} className="px-2 text-gray-500">&lt;</button>
            <span className="font-medium">{format(viewMonth, 'yyyy年 M月')}</span>
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} className="px-2 text-gray-500">&gt;</button>
          </div>
          <button onClick={() => setViewMonth(new Date())} className="text-xs text-blue-600">
            本月
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['一','二','三','四','五','六','日'].map((d) => (
            <div key={d} className="py-1 text-gray-400">{d}</div>
          ))}
          {daysInMonth.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const log = logs.find((l) => l.date === dateStr);
            const isToday = isSameDay(day, today);
            return (
              <div
                key={dateStr}
                className={`rounded-full py-1 text-xs ${
                  isToday ? 'ring-2 ring-blue-400' : ''
                } ${
                  log?.isComplete ? 'bg-green-100 text-green-700' : 'text-gray-500'
                }`}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
      </div>

      {painData.length > 1 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-red-500" />
            <span className="font-medium">疼痛趋势</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={painData}>
              <XAxis dataKey="date" fontSize={12} tick={{ fill: '#9CA3AF' }} />
              <YAxis domain={[0, 10]} fontSize={12} tick={{ fill: '#9CA3AF' }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

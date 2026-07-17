import { useState, useEffect } from 'react';
import { getDailyLog, getLogsInRange, getLatestAssessment, getSetting } from '../db';

export function useDailyLog(dateStr) {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getDailyLog(dateStr).then((result) => {
      setLog(result || null);
      setLoading(false);
    });
  }, [dateStr]);
  return { log, loading, setLog };
}

export function useLogRange(startDate, endDate) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getLogsInRange(startDate, endDate).then((result) => {
      setLogs(result);
      setLoading(false);
    });
  }, [startDate, endDate]);
  return { logs, loading };
}

export function useLatestAssessment() {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getLatestAssessment().then((result) => {
      setAssessment(result);
      setLoading(false);
    });
  }, []);
  return { assessment, loading };
}

export function useSetting(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getSetting(key).then((v) => {
      setValue(v ?? defaultValue);
      setLoading(false);
    });
  }, [key]);
  return { value, loading, setValue };
}

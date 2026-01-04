/**
 * 诊断页面
 */

'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/lib/utils/logger';
import { telemetry } from '@/lib/utils/telemetry';

export default function DiagnosticsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // 获取日志和统计信息
    setLogs(logger.getLogs ? logger.getLogs() : []);
    setStats(telemetry.getStats ? telemetry.getStats() : null);
  }, []);

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6">系统诊断</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">运行统计</h2>
        {stats ? (
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(stats, null, 2)}</pre>
        ) : (
          <p className="text-gray-500">暂无统计数据</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">最近日志</h2>
        <div className="space-y-2">
          {logs.slice(-20).map((log, i) => (
            <div key={i} className="p-2 border-b text-sm">
              <span className="text-gray-500 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={`font-mono ${log.level === 'error' ? 'text-red-500' : 'text-blue-500'}`}>[{log.module}]</span>
              <span className="ml-2">{log.message}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

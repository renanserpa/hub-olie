import React, { useState, useEffect, useRef } from "react";
import { getCrewLogs } from "../services/logStreamService";
import { cn } from "../../lib/utils";

export default function SystemMonitor() {
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stream = getCrewLogs((msg: string) => {
      setLogs(prev => [...prev, msg]);
    });
    setConnected(true);
    return () => stream.close();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-secondary dark:bg-dark-secondary text-sm font-mono rounded-2xl p-4 h-[500px] flex flex-col border border-border dark:border-dark-border shadow-sm">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="font-semibold text-lg text-textPrimary dark:text-dark-textPrimary font-sans">🖥️ System Monitor — AtlasAI Crew</h2>
        <span className={cn("font-sans font-semibold flex items-center gap-2", connected ? "text-green-500" : "text-red-500")}>
          <span className={cn("w-2 h-2 rounded-full", connected ? "bg-green-500" : "bg-red-500")}></span>
          {connected ? "Online" : "Offline"}
        </span>
      </div>
      <div className="overflow-y-auto flex-grow pr-2 text-textSecondary dark:text-dark-textSecondary">
        {logs.map((l, i) => (
          <div key={i} className="border-b border-border/50 dark:border-dark-border/50 py-1 whitespace-pre-wrap break-words">{l}</div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

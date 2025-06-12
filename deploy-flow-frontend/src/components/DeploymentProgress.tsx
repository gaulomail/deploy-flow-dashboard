
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, Terminal, Clock } from 'lucide-react';

interface DeploymentProgressProps {
  logs: string[];
}

export const DeploymentProgress: React.FC<DeploymentProgressProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogType = (log: string) => {
    if (log.includes('Starting') || log.includes('Connecting')) return 'info';
    if (log.includes('completed successfully')) return 'success';
    if (log.includes('error') || log.includes('failed')) return 'error';
    return 'default';
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>;
      case 'error': return <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>;
      case 'info': return <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl shadow-gray-200/50 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/60">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Deployment Progress
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Real-time deployment monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={logs.length > 0 ? "default" : "secondary"} className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              {logs.length > 0 ? 'Active' : 'Waiting'}
            </Badge>
          </div>
        </div>
        <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative">
          <div
            ref={logContainerRef}
            className="h-48 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 overflow-y-auto font-mono text-sm shadow-inner backdrop-blur-sm deployment-logs"
            style={{
              background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%)',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)'
            }}
          >
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-400 italic text-sm">
                    Waiting for deployment logs...
                  </p>
                  <p className="text-gray-500 text-xs">
                    Real-time logs will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => {
                  const logType = getLogType(log);
                  return (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 text-gray-100 animate-fade-in group hover:bg-white/5 rounded p-2 -m-2 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                        {getLogIcon(logType)}
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`text-sm ${
                          logType === 'success' ? 'text-green-300' :
                          logType === 'error' ? 'text-red-300' :
                          logType === 'info' ? 'text-blue-300' :
                          'text-gray-300'
                        }`}>
                          {log}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Terminal-like header */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-gray-700 to-gray-600 rounded-t-xl border-b border-gray-600 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <span className="text-xs text-gray-300 font-medium ml-2">deployment.log</span>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            Monitor deployment progress and logs in real-time
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

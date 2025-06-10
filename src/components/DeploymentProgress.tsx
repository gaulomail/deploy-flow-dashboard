
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Deployment Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={logContainerRef}
          className="h-40 bg-gray-50 border border-gray-200 rounded-md p-4 overflow-y-auto font-mono text-sm"
        >
          {logs.length === 0 ? (
            <p className="text-deploy-gray italic">
              [Real-time logs will appear here]
            </p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1 text-gray-800">
                <span className="text-deploy-gray mr-2">
                  [{new Date().toLocaleTimeString()}]
                </span>
                {log}
              </div>
            ))
          )}
        </div>
        <p className="text-xs text-deploy-gray mt-2">
          View deployment progress in real-time (FR6).
        </p>
      </CardContent>
    </Card>
  );
};

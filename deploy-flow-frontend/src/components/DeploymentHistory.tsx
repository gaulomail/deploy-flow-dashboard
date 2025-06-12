
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { History, User, Server, GitBranch, Clock, CheckCircle, XCircle } from 'lucide-react';

interface DeploymentRecord {
  user: string;
  host: string;
  branch: string;
  timestamp: string;
  status: 'success' | 'failed';
  duration?: string;
}

const mockDeploymentHistory: DeploymentRecord[] = [
  {
    user: 'gdsmith',
    host: '007',
    branch: 'master',
    timestamp: '2025-06-10 18:00',
    status: 'success',
    duration: '2m 15s'
  },
  {
    user: 'jdoe',
    host: '008',
    branch: 'test',
    timestamp: '2025-06-10 17:30',
    status: 'success',
    duration: '1m 45s'
  },
  {
    user: 'asmith',
    host: '007',
    branch: 'master',
    timestamp: '2025-06-10 16:45',
    status: 'failed',
    duration: '45s'
  },
  {
    user: 'mkuru',
    host: '008',
    branch: 'master',
    timestamp: '2025-06-10 15:20',
    status: 'success',
    duration: '3m 02s'
  }
];

export const DeploymentHistory: React.FC = () => {
  return (
    <Card className="w-full bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl shadow-gray-200/50 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/60">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Deployment History
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Recent deployment activity</p>
            </div>
          </div>
          
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            {mockDeploymentHistory.length} records
          </Badge>
        </div>
        <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
                <TableHead className="font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Host
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Branch
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timestamp
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDeploymentHistory.map((record, index) => (
                <TableRow 
                  key={index} 
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-gray-100"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {record.user.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-900">{record.user}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.host === '007' ? 'default' : 'secondary'} className="font-mono">
                      {record.host}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.branch === 'master' ? 'default' : 'outline'} className="font-mono">
                      {record.branch}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 font-mono">
                    {record.timestamp}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {record.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <Badge
                        variant={record.status === 'success' ? 'default' : 'destructive'}
                        className={
                          record.status === 'success'
                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 font-mono">
                    {record.duration}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-xs text-purple-800 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            View and audit past deployment activities
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

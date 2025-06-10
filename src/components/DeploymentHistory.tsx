
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DeploymentRecord {
  user: string;
  host: string;
  branch: string;
  timestamp: string;
  status: 'success' | 'failed';
}

const mockDeploymentHistory: DeploymentRecord[] = [
  {
    user: 'gdsmith',
    host: '007',
    branch: 'master',
    timestamp: '2025-06-10 18:00',
    status: 'success'
  },
  {
    user: 'jdoe',
    host: '008',
    branch: 'test',
    timestamp: '2025-06-10 17:30',
    status: 'success'
  },
  {
    user: 'asmith',
    host: '007',
    branch: 'master',
    timestamp: '2025-06-10 16:45',
    status: 'failed'
  },
  {
    user: 'mkuru',
    host: '008',
    branch: 'master',
    timestamp: '2025-06-10 15:20',
    status: 'success'
  }
];

export const DeploymentHistory: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Deployment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">User</TableHead>
                <TableHead className="font-medium">Host</TableHead>
                <TableHead className="font-medium">Branch</TableHead>
                <TableHead className="font-medium">Timestamp</TableHead>
                <TableHead className="font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDeploymentHistory.map((record, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{record.user}</TableCell>
                  <TableCell>{record.host}</TableCell>
                  <TableCell>{record.branch}</TableCell>
                  <TableCell className="text-sm text-deploy-gray">
                    {record.timestamp}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        record.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {record.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-deploy-gray mt-4">
          View past deployments for auditing (FR9).
        </p>
      </CardContent>
    </Card>
  );
};

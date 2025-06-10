
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DeploymentFormProps {
  onDeploy: (formData: any) => void;
  onReleaseLock: () => void;
  isDeploying: boolean;
}

export const DeploymentForm: React.FC<DeploymentFormProps> = ({
  onDeploy,
  onReleaseLock,
  isDeploying
}) => {
  const [githubUsername, setGithubUsername] = useState('mukuru');
  const [stagingHost, setStagingHost] = useState('007');
  const [branch, setBranch] = useState('master');
  const [runRuckusMigrations, setRunRuckusMigrations] = useState(true);
  const [reloadSupervisor, setReloadSupervisor] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDeploy({
      githubUsername,
      stagingHost,
      branch,
      runRuckusMigrations,
      reloadSupervisor
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Deploy Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GitHub Username Input */}
          <div className="space-y-2">
            <Label htmlFor="github-username" className="text-sm font-medium">
              GitHub Username
            </Label>
            <Input
              id="github-username"
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="e.g., gdsmith (default: mukuru)"
              className="w-full"
            />
            <p className="text-xs text-deploy-gray">
              Enter your GitHub username to select your fork (FR1).
            </p>
          </div>

          {/* Staging Host Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="staging-host" className="text-sm font-medium">
              Staging Host
            </Label>
            <Select value={stagingHost} onValueChange={setStagingHost}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select staging host" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="007">007 (default)</SelectItem>
                <SelectItem value="008">008</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-deploy-gray">
              Select the target staging server (FR2, NFR6).
            </p>
          </div>

          {/* Branch Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="branch" className="text-sm font-medium">
              Branch
            </Label>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="master">master (default)</SelectItem>
                <SelectItem value="test">test</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-deploy-gray">
              Choose the branch to deploy (FR3).
            </p>
          </div>

          {/* Ruckus Migrations Toggle */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ruckus-migrations"
                checked={runRuckusMigrations}
                onCheckedChange={setRunRuckusMigrations}
                className="data-[state=checked]:bg-deploy-blue data-[state=checked]:border-deploy-blue"
              />
              <Label htmlFor="ruckus-migrations" className="text-sm font-medium">
                Run Ruckus Migrations
              </Label>
            </div>
            <p className="text-xs text-deploy-gray">
              Enable/disable Ruckus migrations (FR4).
            </p>
          </div>

          {/* Supervisor Reload Toggle */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="supervisor-reload"
                checked={reloadSupervisor}
                onCheckedChange={setReloadSupervisor}
                className="data-[state=checked]:bg-deploy-blue data-[state=checked]:border-deploy-blue"
              />
              <Label htmlFor="supervisor-reload" className="text-sm font-medium">
                Reload Supervisor
              </Label>
            </div>
            <p className="text-xs text-deploy-gray">
              Enable/disable supervisor reload (FR5).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              disabled={isDeploying}
              className="flex-1 bg-deploy-blue hover:bg-deploy-blue-hover text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </Button>
            <Button
              type="button"
              onClick={onReleaseLock}
              disabled={isDeploying}
              className="flex-1 bg-deploy-red hover:bg-deploy-red-hover text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Release Lock
            </Button>
          </div>
          <p className="text-xs text-deploy-gray">
            Initiate deployment (FR14, FR17) or release lock (FR7, FR15, FR17).
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

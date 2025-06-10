
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GitBranch, Server, Settings, Play, Unlock } from 'lucide-react';

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

  const handleRuckusChange = (checked: boolean | "indeterminate") => {
    setRunRuckusMigrations(checked === true);
  };

  const handleSupervisorChange = (checked: boolean | "indeterminate") => {
    setReloadSupervisor(checked === true);
  };

  return (
    <Card className="w-full bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl shadow-gray-200/50 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/60">
      <CardHeader className="space-y-4 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Deploy Configuration
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">Configure your deployment settings</p>
          </div>
        </div>
        <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </CardHeader>
      
      <CardContent className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* GitHub Username Input */}
          <div className="group space-y-3">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-gray-600" />
              <Label htmlFor="github-username" className="text-sm font-semibold text-gray-700">
                GitHub Username
              </Label>
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Required
              </Badge>
            </div>
            <Input
              id="github-username"
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="e.g., gdsmith (default: mukuru)"
              className="w-full transition-all duration-200 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 bg-white/80 backdrop-blur-sm group-hover:bg-white"
            />
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              Enter your GitHub username to select your fork
            </p>
          </div>

          {/* Staging Host Dropdown */}
          <div className="group space-y-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-gray-600" />
              <Label htmlFor="staging-host" className="text-sm font-semibold text-gray-700">
                Staging Host
              </Label>
              <Badge variant="outline" className="text-xs">
                {stagingHost === '007' ? 'Primary' : 'Secondary'}
              </Badge>
            </div>
            <Select value={stagingHost} onValueChange={setStagingHost}>
              <SelectTrigger className="w-full transition-all duration-200 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 bg-white/80 backdrop-blur-sm group-hover:bg-white">
                <SelectValue placeholder="Select staging host" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200">
                <SelectItem value="007" className="hover:bg-blue-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    007 (default)
                  </div>
                </SelectItem>
                <SelectItem value="008" className="hover:bg-blue-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    008
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              Select the target staging server
            </p>
          </div>

          {/* Branch Dropdown */}
          <div className="group space-y-3">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-gray-600" />
              <Label htmlFor="branch" className="text-sm font-semibold text-gray-700">
                Branch
              </Label>
              <Badge variant={branch === 'master' ? 'default' : 'secondary'} className="text-xs">
                {branch === 'master' ? 'Stable' : 'Testing'}
              </Badge>
            </div>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="w-full transition-all duration-200 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 bg-white/80 backdrop-blur-sm group-hover:bg-white">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200">
                <SelectItem value="master" className="hover:bg-blue-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    master (default)
                  </div>
                </SelectItem>
                <SelectItem value="test" className="hover:bg-blue-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    test
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              Choose the branch to deploy
            </p>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Configuration Options */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration Options
            </h3>
            
            {/* Ruckus Migrations Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 transition-all duration-200 hover:shadow-md">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="ruckus-migrations"
                    checked={runRuckusMigrations}
                    onCheckedChange={handleRuckusChange}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-2"
                  />
                  <Label htmlFor="ruckus-migrations" className="text-sm font-semibold text-gray-800 cursor-pointer">
                    Run Ruckus Migrations
                  </Label>
                  <Badge variant={runRuckusMigrations ? "default" : "secondary"} className="text-xs">
                    {runRuckusMigrations ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 ml-7">
                  Enable or disable Ruckus migrations during deployment
                </p>
              </div>
            </div>

            {/* Supervisor Reload Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-100 transition-all duration-200 hover:shadow-md">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="supervisor-reload"
                    checked={reloadSupervisor}
                    onCheckedChange={handleSupervisorChange}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-2"
                  />
                  <Label htmlFor="supervisor-reload" className="text-sm font-semibold text-gray-800 cursor-pointer">
                    Reload Supervisor
                  </Label>
                  <Badge variant={reloadSupervisor ? "default" : "secondary"} className="text-xs">
                    {reloadSupervisor ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 ml-7">
                  Enable or disable supervisor reload after deployment
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={isDeploying}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-200/50 transition-all duration-200 hover:shadow-xl hover:shadow-blue-300/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Play className="w-4 h-4 mr-2" />
                {isDeploying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deploying...
                  </>
                ) : (
                  'Deploy'
                )}
              </Button>
              
              <Button
                type="button"
                onClick={onReleaseLock}
                disabled={isDeploying}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-red-200/50 transition-all duration-200 hover:shadow-xl hover:shadow-red-300/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Release Lock
              </Button>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                Use Deploy to initiate deployment or Release Lock to free up deployment resources
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

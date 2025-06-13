import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GitBranch, Rocket, Clock, User, CheckCircle, XCircle, Loader, Unlock, Settings, X, Eye, Terminal } from 'lucide-react';
import { AliceChatBot } from './AliceChatBot';
import { Combobox } from "@/components/ui/combobox";
import { cn } from '@/lib/utils';
import { Settings as SettingsComponent } from './Settings';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'react-hot-toast';
import io, { Socket } from 'socket.io-client';
// Framer Motion for more complex animations if needed in the future, but using Tailwind for now.
// import { motion } from "framer-motion";

interface DeploymentLog {
  id: string;
  user: string;
  timestamp: Date;
  branch: string;
  environment: string;
  status: 'success' | 'failed' | 'in-progress';
  trace: Array<string>;
}

interface DeploymentStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
}

const DeploymentInterface = () => {
  const { settings } = useSettings();
  const [isPageLoaded, setIsPageLoaded] = useState(false); // For entrance animations
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('origin');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [activeTab, setActiveTab] = useState('deploy');
  const [showSettings, setShowSettings] = useState(false);
  const [lastCommit, setLastCommit] = useState<any>(null);
  const [currentDeployment, setCurrentDeployment] = useState<any>(null);

  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([
    { id: '1', name: 'Preparing deployment', status: 'pending' },
    { id: '2', name: 'Building application', status: 'pending' },
    { id: '3', name: 'Running tests', status: 'pending' },
    { id: '4', name: 'Deploying to environment', status: 'pending' },
    { id: '5', name: 'Health checks', status: 'pending' },
  ]);

  const [deploymentLogs, setDeploymentLogs] = useState<DeploymentLog[]>([
    {
      id: '1',
      user: 'Sarah Chen',
      timestamp: new Date('2024-06-11T14:30:00'),
      branch: 'feature-auth',
      environment: 'staging-3',
      status: 'success',
      trace: [
        'Preparing deployment...',
        'Building application...',
        'Running tests...',
        'Deploying to environment...',
        'Health checks passed.',
        'Deployment complete.'
      ]
    },
    {
      id: '2',
      user: 'Mike Johnson',
      timestamp: new Date('2024-06-11T13:15:00'),
      branch: 'fix-payment-bug',
      environment: 'staging-1',
      status: 'failed',
      trace: [
        'Preparing deployment...',
        'Building application...',
        'Tests failed: payment.test.js',
        'Deployment aborted.'
      ]
    },
    {
      id: '3',
      user: 'Emma Rodriguez',
      timestamp: new Date('2024-06-11T12:00:00'),
      branch: 'main',
      environment: 'ubt',
      status: 'success',
      trace: [
        'Preparing deployment...',
        'Building application...',
        'Running tests...',
        'Deploying to environment...',
        'Health checks passed.',
        'Deployment complete.'
      ]
    }
  ]);

  // Repository and branch states
  const defaultRepo = { owner: 'gaulomail', name: 'mukuru' };
  const [repositories, setRepositories] = useState<{ owner: string; name: string }[]>([defaultRepo]);
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; name: string }>(defaultRepo);
  const [reposLoading, setReposLoading] = useState(false);
  const [reposError, setReposError] = useState('');

  const [branches, setBranches] = useState<string[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState('');
  const [selectedBranchDetails, setSelectedBranchDetails] = useState<any>(null);

  const [environments, setEnvironments] = useState<string[]>([]);
  const [environmentsLoading, setEnvironmentsLoading] = useState(false);
  const [environmentsError, setEnvironmentsError] = useState('');

  useEffect(() => {
    // Trigger entrance animations shortly after mount
    const timer = setTimeout(() => setIsPageLoaded(true), 50); // Small delay
    return () => clearTimeout(timer);
  }, []);

  // Fetch environments
  useEffect(() => {
    const fetchEnvironments = async () => {
      setEnvironmentsLoading(true);
      setEnvironmentsError('');
      try {
        const res = await fetch('http://localhost:3000/branches/environments');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch environments');
        }
        const data = await res.json();
        if (data.environments && Array.isArray(data.environments)) {
          setEnvironments(data.environments);
          // Select the first environment by default if none is selected
          if (!selectedEnvironment && data.environments.length > 0) {
            setSelectedEnvironment(data.environments[0]);
          }
        } else {
          setEnvironments([]);
          setEnvironmentsError('No environments found');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch environments';
        setEnvironmentsError(errorMessage);
        setEnvironments([]);
        console.error('Error fetching environments:', err);
      } finally {
        setEnvironmentsLoading(false);
      }
    };
    fetchEnvironments();
  }, [selectedEnvironment]);

  // Fetch repository details
  useEffect(() => {
    const fetchRepoDetails = async () => {
      setReposLoading(true);
      setReposError('');
      try {
        const res = await fetch(`http://localhost:3000/branches/repo?owner=${selectedRepo.owner}&repo=${selectedRepo.name}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch repository details');
        }
        const data = await res.json();
        if (data) {
          // If this is a fork, add the source repo to the list
          if (data.isFork && data.sourceRepo) {
            setRepositories([
              { owner: data.sourceRepo.owner, name: data.sourceRepo.name },
              { owner: selectedRepo.owner, name: selectedRepo.name }
            ]);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repository details';
        setReposError(errorMessage);
        console.error('Error fetching repository details:', err);
      } finally {
        setReposLoading(false);
      }
    };
    fetchRepoDetails();
  }, [selectedRepo]);

  // Fetch branches when repo is selected
  const fetchBranches = React.useCallback(async () => {
    if (!selectedRepo || !selectedRepo.owner || !selectedRepo.name) {
      setBranches([]);
      setBranchesError(''); // Clear error if repo is not fully selected
      setBranchesLoading(false);
      return;
    }

    setBranchesLoading(true);
    setBranchesError('');
    setSelectedBranch(''); // Clear previous branch selection when fetching new ones
    setSelectedBranchDetails(null); // Clear details of previously selected branch

    try {
      const response = await fetch(`http://localhost:3000/branches/branches?owner=${selectedRepo.owner}&repo=${selectedRepo.name}`);

      if (!response.ok) {
        let errorMsg = `Failed to fetch branches (status: ${response.status})`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
          // If response is not JSON or empty, use the status-based message
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data && Array.isArray(data.branches)) {
        setBranches(data.branches);
        if (data.branches.length === 0) {
          setBranchesError('No branches found for this repository.');
        }
      } else {
        setBranches([]);
        setBranchesError('Received unexpected format for branch data. Expected an object with a "branches" array.');
        console.warn('Unexpected branch data format:', data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching branches';
      setBranchesError(errorMessage);
      setBranches([]); // Clear branches on error
      toast.error(errorMessage);
    } finally {
      setBranchesLoading(false);
    }
  }, [selectedRepo.owner, selectedRepo.name]); // Dependencies: owner and name from selectedRepo

  // Effect to fetch branches when the selected repository changes
  useEffect(() => {
    if (selectedRepo && selectedRepo.owner && selectedRepo.name) {
      fetchBranches();
    } else {
      // Clear branch related state if no repo is selected or selection is incomplete
      setBranches([]);
      setSelectedBranch('');
      setSelectedBranchDetails(null);
      setBranchesError('');
      setBranchesLoading(false);
    }
  }, [selectedRepo, fetchBranches]); // fetchBranches is now a stable dependency due to useCallback

  useEffect(() => {
    if(!isDeploying)
      return;

    if(!selectedBranch || !selectedEnvironment)
      return;

    const steps = [...deploymentSteps];
    const newLog: DeploymentLog = {
      id: Date.now().toString(),
      user: 'Current User',
      timestamp: new Date(),
      branch: selectedBranch,
      environment: selectedEnvironment,
      status: 'success',
      trace: [],
    };

    // Only connect when deployment starts, or you can connect on mount if needed
    const socket: Socket = io('http://localhost:3000');

    // Event names based on your branch and host
    const dataEvent = `${selectedBranch}-${selectedEnvironment}-data`;
    const errorEvent = `${selectedBranch}-${selectedEnvironment}-error`;
    const closeEvent = `${selectedBranch}-${selectedEnvironment}-close`;
    
    // Example: You might want to append logs or update state based on these events
    socket.on(dataEvent, (data: string) => {
      // Handle incoming data
      if(newLog.trace.length == 0)
      {
        steps[0].status = 'running'; 
        setDeploymentProgress((1 / steps.length) * 100);
      }
      else if(data.includes('deploy_lock:create'))
      {
        steps[0].status = 'completed';
        steps[1].status = 'running'; 
        setDeploymentProgress((2 / steps.length) * 100);
      }
      else if(data.includes('echo'))
      {
        steps[1].status = 'completed';
        steps[2].status = 'running'; 
        setDeploymentProgress((3 / steps.length) * 100);
      }
      else if(data.includes('deploy_lock:release'))
      {
        steps[2].status = 'completed';
        steps[3].status = 'running'; 
        setDeploymentProgress((4 / steps.length) * 100);
      }
      else if(data.includes('valtari_deploy_stg'))
      {
        steps[3].status = 'completed';
        steps[4].status = 'running'; 
        setDeploymentProgress((5 / steps.length) * 100);
      }
      else if(data.includes('newrelic:notice_deployment'))
      {
        steps[4].status = 'completed';
      }

      setDeploymentSteps([...steps])
      newLog.trace.push(data);
      console.log('DATA:', data);
    });

    socket.on(errorEvent, (error: string) => {
      // Handle error event (e.g., show error toast or update error state)
      // setError(error);
      console.error('ERROR:', error);
      toast.error(`Deployment API error: ${error}`);
      socket.off(dataEvent);
      socket.off(errorEvent);
      socket.off(closeEvent);
      socket.disconnect();
      setDeploymentLogs([newLog, ...deploymentLogs]);
      setDeploymentSteps(steps.map(step => ({ ...step, status: 'pending' })));
      setDeploymentProgress(0);
      setIsDeploying(false);
      setActiveTab('logs');
    });

    socket.on(closeEvent, () => {
      // Handle close event (e.g., mark deployment as finished)
      // setDeploymentFinished(true);
      console.log('CLOSE event received');
      socket.off(dataEvent);
      socket.off(errorEvent);
      socket.off(closeEvent);
      socket.disconnect();
      setDeploymentLogs([newLog, ...deploymentLogs]);
      setDeploymentSteps(steps.map(step => ({ ...step, status: 'pending' })));
      setDeploymentProgress(0);
      setIsDeploying(false);
      setActiveTab('logs');
    });
  }, [selectedBranch, selectedEnvironment, isDeploying]);

  // Fetch branch details when a branch is selected
  const fetchBranchDetails = async (branch: string) => {
    if (!branch || !selectedRepo) return;
    try {
      const res = await fetch(`http://localhost:3000/branches/branches/${branch}?owner=${selectedRepo.owner}&repo=${selectedRepo.name}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch branch details');
      }
      const data = await res.json();
      setSelectedBranchDetails(data);
    } catch (error) {
      console.error('Error fetching branch details:', error);
      setSelectedBranchDetails(null);
    }
  };

  // Update fetchLastCommit to use settings
  const fetchLastCommit = async () => {
    if (!selectedBranch) return;
    
    try {
      const response = await fetch(`/api/branches/${selectedBranch}/commits`, {
        headers: {
          'Authorization': `Bearer ${settings.githubToken || import.meta.env.VITE_GITHUB_TOKEN}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch last commit');
      const data = await response.json();
      setLastCommit(data.commit);
    } catch (error) {
      console.error('Error fetching last commit:', error);
      toast.error('Failed to fetch last commit');
    }
  };

  // Update startDeployment to use settings
  const startDeployment = async () => {
    if (!selectedRepo || !selectedBranch) {
      toast.error('Please select a repository and branch');
      return;
    }

    try {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey || import.meta.env.VITE_API_KEY}`
        },
        body: JSON.stringify({
          repo: selectedRepo,
          branch: selectedBranch,
          environment: settings.defaultEnvironment
        })
      });

      if (!response.ok) throw new Error('Failed to start deployment');
      const data = await response.json();
      setCurrentDeployment(data);
      toast.success('Deployment started successfully');
    } catch (error) {
      console.error('Error starting deployment:', error);
      toast.error('Failed to start deployment');
    }
  };

  const handleDeploy = async () => {
    if (!selectedBranch || !selectedEnvironment) return;
    
    setIsDeploying(true);
    setDeploymentProgress(0);
    setActiveTab('steps');

    const response = await fetch('http://localhost:3000/deploys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branch: selectedBranch,
          host: selectedEnvironment,
        }),
      });
    
    if (!response.ok) {
      toast.error(`Deployment API error: ${response.statusText}`);
    }
  };

  const handleRelease = () => {
    setIsLocked(false);
    setLockReason('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  // State for log modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeLogTrace, setActiveLogTrace] = useState<string[] | null>(null);
  const [activeLogUser, setActiveLogUser] = useState<string>('');
  const [activeLogTimestamp, setActiveLogTimestamp] = useState<string>('');

  return (
    <div className="min-h-screen bg-background p-6 overflow-x-hidden themed-component"> {/* Added overflow-x-hidden for safety with transforms */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className={cn(
          "text-center space-y-2",
          "transition-all duration-700 ease-out",
          isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        )}>
          <div className="flex items-center justify-center gap-4">
            <img 
              src="/mukuru-logo.png" 
              alt="Mukuru" 
              className="h-12 object-contain"
            />
            <h1 className="text-4xl font-bold text-primary">Alice</h1>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-zinc-400 hover:text-primary"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-lg text-gray-400">Deploy your code with confidence - Alice is here to help! 🚀</p>
        </div>

        {/* Settings Dialog */}
        {showSettings && (
          <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4">
            <div className="relative bg-background rounded-lg border-2 border-primary w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-zinc-400 hover:text-primary z-10"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-5 w-5" />
              </Button>
              <SettingsComponent />
            </div>
          </div>
        )}

        {/* Main Interface */}
        <Card className={cn(
          "shadow-lg border border-[#FF6B00] bg-zinc-900/90 backdrop-blur-sm",
          "transition-all duration-700 ease-out delay-200", // Added delay
          isPageLoaded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-5 scale-95"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center text-primary">Ready to Deploy?</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-zinc-800">
                <TabsTrigger value="deploy" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-300 transition-colors duration-200 ease-in-out">Deploy</TabsTrigger>
                <TabsTrigger value="steps" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-300 transition-colors duration-200 ease-in-out">Steps</TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-300 transition-colors duration-200 ease-in-out">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="deploy" className="space-y-6">
                {/* Repository Selection */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-primary flex items-center gap-2 mb-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                    Choose Repository
                  </label>
                  <Combobox
                    options={repositories.map(repo => ({ 
                      value: `${repo.owner}/${repo.name}`, 
                      label: `${repo.owner}/${repo.name}` 
                    }))}
                    value={`${selectedRepo.owner}/${selectedRepo.name}`}
                    onChange={(value) => {
                      if (value) {
                        const [owner, name] = value.split('/');
                        setSelectedRepo({ owner, name });
                      } else {
                        // Optionally handle deselection, e.g., reset to a default or clear related fields
                        // For now, it might be best to prevent full deselection if a repo is always needed
                        // Or ensure your logic elsewhere handles selectedRepo being potentially null/undefined
                      }
                    }}
                    placeholder={reposLoading ? 'Loading repositories...' : 'Select a repository'}
                    searchPlaceholder="Search repositories..."
                    emptyPlaceholder={reposError ? reposError : "No repositories found."}
                    disabled={reposLoading || reposError !== ''}
                    className="h-12 text-base border-2 border-zinc-800 hover:border-zinc-700 transition-colors bg-zinc-900 text-gray-300 data-[state=open]:border-zinc-700"
                  />
                  {/* Display error separately if not covered by Combobox's emptyPlaceholder when disabled and errored */}
                  {reposError && (reposLoading || repositories.length === 0) && (
                     <p className="mt-2 text-sm text-red-600">{reposError}</p>
                  )}
                </div>

                {/* Branch Selection */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-primary flex items-center gap-2 mb-2">
                    <GitBranch className="h-5 w-5 text-primary" />
                    Choose Branch
                  </label>
                  <Combobox
                    options={branches.map(branch => ({ value: branch, label: branch }))}
                    value={selectedBranch}
                    onChange={(value) => {
                      setSelectedBranch(value);
                      if (value) {
                        fetchBranchDetails(value);
                      } else {
                        setSelectedBranchDetails(null);
                      }
                    }}
                    placeholder={branchesLoading ? 'Loading branches...' : 'Select a branch to deploy'}
                    searchPlaceholder="Search branches..."
                    emptyPlaceholder={branchesError ? branchesError : "No branches found."}
                    disabled={branchesLoading || branchesError !== ''}
                    className="h-12 text-base border-2 border-zinc-800 hover:border-zinc-700 transition-colors bg-zinc-900 text-gray-300 data-[state=open]:border-zinc-700"
                  />
                  {/* Display error separately if not covered by Combobox's emptyPlaceholder when disabled and errored */}
                  {branchesError && (branchesLoading || branches.length === 0) && (
                     <p className="mt-2 text-sm text-red-600">{branchesError}</p>
                  )}
                  {/* Enhanced Selected Branch Details with animation */}
                  <div className={cn(
                    "mt-2 p-4 bg-zinc-800 rounded-lg overflow-hidden transition-all duration-300 ease-in-out",
                    selectedBranchDetails ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  )}>
                    {selectedBranchDetails && ( /* Keep conditional rendering for content to avoid issues when null */
                      <div className="text-sm text-gray-300 space-y-1">
                        <p><span className="font-medium text-primary/90">Last commit:</span> {selectedBranchDetails.commit.message}</p>
                        <p><span className="font-medium text-primary/90">Author:</span> {selectedBranchDetails.commit.author.name}</p>
                        <p><span className="font-medium text-primary/90">Date:</span> {new Date(selectedBranchDetails.commit.date).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Environment Selection */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-primary mb-2">
                    Pick your staging environment
                  </label>
                  <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                    <SelectTrigger className="h-12 text-base border-2 border-zinc-800 hover:border-primary/50 transition-colors bg-zinc-900 text-gray-300">
                      <SelectValue placeholder="Where would you like to deploy?" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-2 border-zinc-800 max-h-60">
                      {environments.map((env) => (
                        <SelectItem key={env} value={env} className="hover:bg-zinc-800 text-gray-300 data-[state=checked]:bg-zinc-700">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${env === 'ubt' ? 'bg-primary' : 'bg-primary/60'}`} />
                            {env}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lock Message */}
                {isLocked && (
                  <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <Unlock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary">Deployment Locked</h3>
                        <p className="text-primary/80">{lockReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deploy/Release Button */}
                <div className="text-center pt-4">
                  {isLocked ? (
                    <Button
                      onClick={handleRelease}
                      className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 hover:scale-105"
                    >
                      <Unlock className="h-5 w-5 mr-2" />
                      Release Lock
                    </Button>
                  ) : (
                    <Button
                      onClick={handleDeploy}
                      disabled={!selectedBranch || !selectedEnvironment || isDeploying}
                      className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isDeploying ? (
                        <>
                          <Loader className="h-5 w-5 mr-2 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-5 w-5 mr-2" />
                          Deploy Now
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Progress Bar */}
                {isDeploying && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Deployment Progress</span>
                      <span>{Math.round(deploymentProgress)}%</span>
                    </div>
                    <Progress value={deploymentProgress} className="h-3 bg-muted [&>div]:bg-primary" />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="steps" className="space-y-4">
                <h3 className="text-xl font-semibold text-primary mb-4">Deployment Steps</h3>
                <div className="space-y-3">
                  {deploymentSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                        "bg-card/50 backdrop-blur-sm themed-component",
                        step.status === 'running'
                          ? 'border-primary/50 shadow-lg shadow-primary/10'
                          : step.status === 'completed'
                          ? 'border-green-500/50 shadow-lg shadow-green-500/10'
                          : step.status === 'failed'
                          ? 'border-red-500/50 shadow-lg shadow-red-500/10'
                          : 'border-zinc-700/50'
                      )}
                    >
                      <div className="flex-shrink-0">
                        {getStepStatusIcon(step.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{step.name}</p>
                        {step.status === 'running' && (
                          <p className="text-sm text-primary">In progress...</p>
                        )}
                        {step.status === 'completed' && (
                          <p className="text-sm text-green-500">Completed successfully</p>
                        )}
                        {step.status === 'failed' && (
                          <p className="text-sm text-red-500">Failed</p>
                        )}
                        {step.duration && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Duration: {step.duration}s
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <h3 className="text-xl font-semibold text-primary mb-4">Deployment History</h3>
                <div className="space-y-3">
                  {deploymentLogs.map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                        "bg-card/50 backdrop-blur-sm hover:bg-muted/50 themed-component",
                        log.status === 'success'
                          ? 'border-green-500/50 hover:border-green-500/70'
                          : log.status === 'failed'
                          ? 'border-red-500/50 hover:border-red-500/70'
                          : 'border-primary/50 hover:border-primary/70'
                      )}
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(log.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{log.user}</span>
                          <Badge 
                            variant="outline" 
                            className="text-xs border-border text-muted-foreground bg-muted/50"
                          >
                            {log.branch}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-primary/20 text-primary border-primary/30"
                          >
                            {log.environment}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <Badge
                          variant={
                            log.status === 'success'
                              ? 'default'
                              : log.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className={cn(
                            "text-xs font-medium",
                            log.status === 'success' && "bg-green-500/20 text-green-500 border-green-500/30",
                            log.status === 'failed' && "bg-red-500/20 text-red-500 border-red-500/30",
                            log.status === 'in-progress' && "bg-primary/20 text-primary border-primary/30"
                          )}
                        >
                          {log.status}
                        </Badge>
                        <button
                          className="ml-2 p-1 rounded hover:bg-zinc-800 transition-colors"
                          title="View Log Trace"
                          onClick={() => {
                            setActiveLogTrace(log.trace);
                            setActiveLogUser(log.user);
                            setActiveLogTimestamp(log.timestamp.toLocaleString());
                            setShowLogModal(true);
                          }}
                        >
                          <Terminal className="h-5 w-5 text-primary" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Log Trace Modal */}
                {showLogModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="relative bg-zinc-900 border-2 border-primary rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                      <button
                        className="absolute top-4 right-4 text-zinc-400 hover:text-primary"
                        onClick={() => setShowLogModal(false)}
                        title="Close"
                      >
                        <X className="h-6 w-6" />
                      </button>
                      <div className="p-6 pb-2 border-b border-zinc-800 flex items-center gap-3">
                        <Terminal className="h-6 w-6 text-primary" />
                        <span className="font-semibold text-lg text-primary">Log Trace</span>
                        <span className="ml-auto mr-6 text-xs text-muted-foreground">{activeLogUser} &middot; {activeLogTimestamp}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 bg-black text-green-400 font-mono text-sm rounded-b-lg shadow-inner" style={{minHeight: '200px'}}>
                        {activeLogTrace && activeLogTrace.length > 0 ? (
                          <pre className="whitespace-pre-wrap">{activeLogTrace.join('\n')}</pre>
                        ) : (
                          <span className="text-muted-foreground">No log trace available.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Alice Chatbot */}
        <AliceChatBot
          onDeploy={(branch: string, environment: string) => {
            setSelectedBranch(branch);
            setSelectedEnvironment(environment);
            setActiveTab('deploy');
          }}
        />
      </div>
    </div>
  );
};

export default DeploymentInterface;

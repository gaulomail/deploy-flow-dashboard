
import React, { useState } from 'react';
import { DeploymentForm } from '@/components/DeploymentForm';
import { DeploymentProgress } from '@/components/DeploymentProgress';
import { DeploymentHistory } from '@/components/DeploymentHistory';

const Index = () => {
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = (formData: any) => {
    console.log('Deploying with data:', formData);
    setIsDeploying(true);
    setDeploymentLogs(['Starting deployment...']);
    
    // Simulate deployment progress
    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Connecting to staging server...']);
    }, 1000);
    
    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Pulling latest code from repository...']);
    }, 2000);
    
    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Running migrations...']);
    }, 3000);
    
    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Deployment completed successfully!']);
      setIsDeploying(false);
    }, 4000);
  };

  const handleReleaseLock = () => {
    console.log('Releasing deployment lock...');
    setDeploymentLogs(prev => [...prev, 'Deployment lock released.']);
  };

  return (
    <div className="min-h-screen bg-deploy-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Deployment Dashboard
          </h1>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Deployment Form */}
          <div className="space-y-8">
            <DeploymentForm 
              onDeploy={handleDeploy}
              onReleaseLock={handleReleaseLock}
              isDeploying={isDeploying}
            />
          </div>

          {/* Right Column - Progress and History */}
          <div className="space-y-8">
            <DeploymentProgress logs={deploymentLogs} />
            <DeploymentHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

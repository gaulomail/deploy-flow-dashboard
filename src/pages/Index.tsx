
import React, { useState } from 'react';
import { DeploymentForm } from '@/components/DeploymentForm';
import { DeploymentProgress } from '@/components/DeploymentProgress';
import { DeploymentHistory } from '@/components/DeploymentHistory';
import { Badge } from '@/components/ui/badge';
import { Rocket, Shield, Zap } from 'lucide-react';

const Index = () => {
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = (formData: any) => {
    console.log('Deploying with data:', formData);
    setIsDeploying(true);
    setDeploymentLogs(['Starting deployment pipeline...']);
    
    // Simulate deployment progress with more realistic messages
    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Connecting to staging server...']);
    }, 1000);
    
    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Authenticating with GitHub...']);
    }, 1500);
    
    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Pulling latest code from repository...']);
    }, 2000);
    
    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Installing dependencies...']);
    }, 2500);
    
    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Running migrations...']);
    }, 3000);
    
    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Building application...']);
    }, 3500);
    
    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Deployment completed successfully! 🚀']);
      setIsDeploying(false);
    }, 4000);
  };

  const handleReleaseLock = () => {
    console.log('Releasing deployment lock...');
    setDeploymentLogs(prev => [...prev, 'Deployment lock released successfully.']);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 25%),
                           radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 25%)`
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-300/50">
              <Rocket className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Deployment Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Deploy your applications to staging servers with confidence and ease
            </p>
          </div>
          
          {/* Feature Badges */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="px-4 py-2 text-sm border-blue-200 bg-blue-50 text-blue-700">
              <Shield className="w-4 h-4 mr-1" />
              Secure Deployments
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm border-green-200 bg-green-50 text-green-700">
              <Zap className="w-4 h-4 mr-1" />
              Real-time Monitoring
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm border-purple-200 bg-purple-50 text-purple-700">
              <Rocket className="w-4 h-4 mr-1" />
              One-Click Deploy
            </Badge>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
        
        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            Built with modern web technologies for seamless deployment experiences
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;

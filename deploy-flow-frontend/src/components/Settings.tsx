import React, { useState } from 'react';
import { Moon, Sun, Save, Eye, EyeOff } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'react-hot-toast';
import { useSettings } from '../contexts/SettingsContext';

export function Settings() {
  const { settings, updateSettings } = useSettings();
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    updateSettings(settings);
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-primary">Settings</h2>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-4">
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  settings.theme === 'dark'
                    ? 'bg-primary text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
              <button
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  settings.theme === 'light'
                    ? 'bg-primary text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <div className="space-y-2">
            <Label>GitHub Token</Label>
            <div className="relative">
              <Input
                type={showGithubToken ? 'text' : 'password'}
                value={settings.githubToken}
                onChange={(e) => updateSettings({ githubToken: e.target.value })}
                placeholder="Enter your GitHub token"
                className="pr-10"
              />
              <button
                onClick={() => setShowGithubToken(!showGithubToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                {showGithubToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {import.meta.env.VITE_GITHUB_TOKEN && !settings.githubToken && (
              <p className="text-sm text-zinc-400">Using environment variable as fallback</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                placeholder="Enter your API key"
                className="pr-10"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {import.meta.env.VITE_API_KEY && !settings.apiKey && (
              <p className="text-sm text-zinc-400">Using environment variable as fallback</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Auto Deploy</Label>
            <Switch
              checked={settings.autoDeploy}
              onCheckedChange={(checked) => updateSettings({ autoDeploy: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Notifications</Label>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSettings({ notifications: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>Default Environment</Label>
            <select
              value={settings.defaultEnvironment}
              onChange={(e) => updateSettings({ defaultEnvironment: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
            {import.meta.env.VITE_DEFAULT_ENVIRONMENT && settings.defaultEnvironment === import.meta.env.VITE_DEFAULT_ENVIRONMENT && (
              <p className="text-sm text-zinc-400">Using environment variable as fallback</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
} 
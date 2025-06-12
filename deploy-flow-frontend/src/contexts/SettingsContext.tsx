import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  theme: 'dark' | 'light';
  githubToken: string;
  apiKey: string;
  autoDeploy: boolean;
  notifications: boolean;
  defaultEnvironment: string;
}

// Get environment variables as fallback values
const envSettings: Partial<Settings> = {
  githubToken: import.meta.env.VITE_GITHUB_TOKEN || '',
  apiKey: import.meta.env.VITE_API_KEY || '',
  defaultEnvironment: import.meta.env.VITE_DEFAULT_ENVIRONMENT || 'staging',
};

const defaultSettings: Settings = {
  theme: 'dark',
  githubToken: envSettings.githubToken || '',
  apiKey: envSettings.apiKey || '',
  autoDeploy: false,
  notifications: true,
  defaultEnvironment: envSettings.defaultEnvironment || 'staging',
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('deployFlowSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({
        ...defaultSettings,
        ...parsedSettings,
        githubToken: parsedSettings.githubToken || envSettings.githubToken || '',
        apiKey: parsedSettings.apiKey || envSettings.apiKey || '',
        defaultEnvironment: parsedSettings.defaultEnvironment || envSettings.defaultEnvironment || 'staging',
      });
    }
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('deployFlowSettings', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('deployFlowSettings');
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 
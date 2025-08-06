import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Settings, Database, Wifi, WifiOff, RefreshCw, 
  Activity, AlertCircle, CheckCircle, Code, ChevronUp, Power, PowerOff
} from 'lucide-react';
import { 
  getConnectionStatus, enableAPI, disableAPI, forceReconnect, 
  getLastSyncTime, getSyncQueueLength, isAPIEnabled
} from '../utils/api';

interface DevUtilsProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export function DevUtils({ isVisible = false, onToggle }: DevUtilsProps) {
  const [connectionStatus, setConnectionStatus] = useState<string>(getConnectionStatus());
  const [apiEnabled, setApiEnabled] = useState<boolean>(isAPIEnabled());
  const [isChecking, setIsChecking] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Update status every few seconds
  useEffect(() => {
    const updateStatus = () => {
      setConnectionStatus(getConnectionStatus());
      setApiEnabled(isAPIEnabled());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleApiHealthCheck = async () => {
    if (!apiEnabled) {
      console.log('📴 Cannot perform health check - API calls are disabled');
      return;
    }

    setIsChecking(true);
    try {
      // Only import and call checkApiHealth if API is enabled
      const { checkApiHealth } = await import('../utils/api');
      const isHealthy = await checkApiHealth();
      console.log('🔍 API Health Check Result:', isHealthy);
      setConnectionStatus(getConnectionStatus());
    } catch (error) {
      console.error('❌ Health check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleToggleAPI = async () => {
    setIsToggling(true);
    try {
      if (apiEnabled) {
        disableAPI();
        console.log('⏹️ API disabled');
      } else {
        enableAPI();
        console.log('🚀 API enabled');
      }
      
      // Wait a moment for status to update
      setTimeout(() => {
        setApiEnabled(isAPIEnabled());
        setConnectionStatus(getConnectionStatus());
      }, 100);
    } catch (error) {
      console.error('❌ Failed to toggle API:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleForceReconnect = () => {
    if (!apiEnabled) {
      console.log('📴 Cannot reconnect - API calls are disabled');
      return;
    }

    try {
      forceReconnect();
      console.log('🔄 Force reconnect initiated');
      setConnectionStatus(getConnectionStatus());
    } catch (error) {
      console.error('❌ Failed to force reconnect:', error);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);

    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'online':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Online',
          color: 'bg-green-100 text-green-800 border-green-200',
          description: 'Connected to backend server'
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: 'Syncing',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'Synchronizing data with server'
        };
      case 'checking':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: 'Checking',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          description: 'Checking server connection'
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Offline',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          description: apiEnabled ? 'Server not available' : 'API calls disabled'
        };
    }
  };

  const status = getStatusConfig();

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={onToggle}
          className="shadow-lg backdrop-blur-sm bg-white/90 border-gray-200 hover:bg-white"
        >
          <Code className="w-4 h-4 mr-2" />
          Dev Tools
          <div className={`ml-2 w-2 h-2 rounded-full ${
            apiEnabled 
              ? (connectionStatus === 'online' ? 'bg-green-500' : 'bg-yellow-500')
              : 'bg-gray-400'
          }`} />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-xl backdrop-blur-sm bg-white/95 border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-sm">
              <Settings className="w-4 h-4 mr-2" />
              Developer Utils
              <div className={`ml-2 w-2 h-2 rounded-full animate-pulse ${
                apiEnabled 
                  ? (connectionStatus === 'online' ? 'bg-green-500' : 'bg-yellow-500')
                  : 'bg-gray-400'
              }`} />
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={onToggle}>
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* API Status Toggle */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">API Control</h4>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                {apiEnabled ? (
                  <Power className="w-4 h-4 text-green-600" />
                ) : (
                  <PowerOff className="w-4 h-4 text-gray-500" />
                )}
                <div>
                  <span className="text-sm font-medium">
                    {apiEnabled ? 'API Enabled' : 'API Disabled'}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {apiEnabled ? 'Backend calls allowed' : 'Offline mode only'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={apiEnabled ? "destructive" : "default"}
                onClick={handleToggleAPI}
                disabled={isToggling}
                className="text-xs"
              >
                {isToggling ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : apiEnabled ? (
                  "Disable"
                ) : (
                  "Enable"
                )}
              </Button>
            </div>
          </div>

          {/* Connection Status */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Connection Status</h4>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                {status.icon}
                <div>
                  <span className="text-sm font-medium">{status.text}</span>
                  <p className="text-xs text-muted-foreground">{status.description}</p>
                </div>
              </div>
              <Badge className={status.color}>
                {connectionStatus}
              </Badge>
            </div>
          </div>

          {/* Connection Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-muted/30 rounded">
              <div className="font-medium text-foreground">Last Sync</div>
              <div className="text-muted-foreground">{formatTimeAgo(getLastSyncTime())}</div>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <div className="font-medium text-foreground">Queue</div>
              <div className="text-muted-foreground">{getSyncQueueLength()} items</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleApiHealthCheck}
                disabled={isChecking || !apiEnabled}
                className="text-xs"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Checking
                  </>
                ) : (
                  <>
                    <Activity className="w-3 h-3 mr-1" />
                    {apiEnabled ? 'Health Check' : 'API Disabled'}
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleForceReconnect}
                disabled={connectionStatus === 'checking' || !apiEnabled}
                className="text-xs"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
                {apiEnabled ? 'Reconnect' : 'API Disabled'}
              </Button>
            </div>
          </div>

          {/* Status Info */}
          <Alert className={`${
            apiEnabled
              ? (connectionStatus === 'online' 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-yellow-200 bg-yellow-50')
              : 'border-blue-200 bg-blue-50'
          }`}>
            {apiEnabled ? (
              connectionStatus === 'online' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )
            ) : (
              <Database className="h-4 w-4 text-blue-600" />
            )}
            <AlertDescription className={`text-xs ${
              apiEnabled
                ? (connectionStatus === 'online' ? 'text-green-800' : 'text-yellow-800')
                : 'text-blue-800'
            }`}>
              {!apiEnabled 
                ? '🔒 Running in secure offline mode. No network requests will be made. All CMS features work locally with static data.'
                : (connectionStatus === 'online' 
                    ? '✅ Connected to backend server. Real-time sync is active.' 
                    : '⚠️ Backend server not available. Using offline mode with fallback data.')
              }
            </AlertDescription>
          </Alert>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• <strong>Enable API:</strong> Connect to backend server</div>
            <div>• <strong>Disable API:</strong> Pure offline mode (default)</div>
            <div>• <strong>Health Check:</strong> Test server connectivity (API must be enabled)</div>
            <div>• All features work offline by default - no network errors</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Wifi, WifiOff, RefreshCw, Activity, Signal, 
  Clock, Database, CheckCircle, AlertTriangle
} from 'lucide-react';
import { 
  getConnectionStatus, getLastSyncTime, getSyncQueueLength,
  addConnectionListener, removeConnectionListener, forceReconnect
} from '../utils/api';

interface RealTimeStatusIndicatorProps {
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  compact?: boolean;
  showDetails?: boolean;
}

export function RealTimeStatusIndicator({ 
  position = 'top-right', 
  compact = false, 
  showDetails = false 
}: RealTimeStatusIndicatorProps) {
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking' | 'syncing'>('checking');
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [syncQueueLength, setSyncQueueLength] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // Connection status listener
  useEffect(() => {
    const handleConnectionStatusChange = (status: string) => {
      setConnectionStatus(status as any);
      setLastSyncTime(getLastSyncTime());
      setSyncQueueLength(getSyncQueueLength());
    };

    addConnectionListener(handleConnectionStatusChange);
    
    // Initial status update
    setConnectionStatus(getConnectionStatus());
    setLastSyncTime(getLastSyncTime());
    setSyncQueueLength(getSyncQueueLength());

    // Regular status updates
    const statusInterval = setInterval(() => {
      setLastSyncTime(getLastSyncTime());
      setSyncQueueLength(getSyncQueueLength());
    }, 5000);

    return () => {
      removeConnectionListener(handleConnectionStatusChange);
      clearInterval(statusInterval);
    };
  }, []);

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
          indicator: 'bg-green-500'
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: 'Syncing',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          indicator: 'bg-blue-500'
        };
      case 'checking':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: 'Checking',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          indicator: 'bg-yellow-500'
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Offline',
          color: 'bg-red-100 text-red-800 border-red-200',
          indicator: 'bg-red-500'
        };
    }
  };

  const getPositionClasses = () => {
    const base = 'fixed z-50';
    switch (position) {
      case 'top-right':
        return `${base} top-4 right-4`;
      case 'top-left':
        return `${base} top-4 left-4`;
      case 'bottom-right':
        return `${base} bottom-4 right-4`;
      case 'bottom-left':
        return `${base} bottom-4 left-4`;
      default:
        return `${base} top-4 right-4`;
    }
  };

  const status = getStatusConfig();

  if (compact) {
    return (
      <div className={getPositionClasses()}>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-full border shadow-lg backdrop-blur-sm transition-all hover:scale-105 ${status.color}`}
          >
            <div className="relative">
              {status.icon}
              <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${status.indicator} animate-pulse`} />
            </div>
            {syncQueueLength > 0 && (
              <Badge variant="secondary" className="text-xs h-5 px-1">
                {syncQueueLength}
              </Badge>
            )}
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-border rounded-lg shadow-xl z-50">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Connection Status</span>
                  <Badge className={status.color}>
                    {status.text}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Last sync:
                    </span>
                    <span className="text-foreground">{formatTimeAgo(lastSyncTime)}</span>
                  </div>

                  {syncQueueLength > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <Database className="w-3 h-3 mr-1" />
                        Queued:
                      </span>
                      <span className="text-foreground">{syncQueueLength} items</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      forceReconnect();
                      setShowDropdown(false);
                    }}
                    className="w-full"
                  >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Force Reconnect
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Backdrop */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  if (showDetails) {
    return (
      <div className={getPositionClasses()}>
        <div className={`px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm ${status.color}`}>
          <div className="flex items-center space-x-3 mb-2">
            <div className="relative">
              {status.icon}
              <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${status.indicator} animate-pulse`} />
            </div>
            <span className="font-medium">{status.text}</span>
            {connectionStatus === 'online' && (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="opacity-75">Last sync:</span>
              <span>{formatTimeAgo(lastSyncTime)}</span>
            </div>

            {syncQueueLength > 0 && (
              <div className="flex items-center justify-between">
                <span className="opacity-75">Queued:</span>
                <Badge variant="secondary" className="text-xs h-4 px-1">
                  {syncQueueLength}
                </Badge>
              </div>
            )}

            {connectionStatus === 'offline' && (
              <div className="flex items-center mt-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                <span className="opacity-75">Changes will sync when online</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default view
  return (
    <div className={getPositionClasses()}>
      <Badge className={`${status.color} shadow-lg backdrop-blur-sm`}>
        <div className="flex items-center space-x-2">
          <div className="relative">
            {status.icon}
            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${status.indicator} animate-pulse`} />
          </div>
          <span>{status.text}</span>
          {syncQueueLength > 0 && (
            <div className="bg-white/20 rounded-full px-1.5 py-0.5 text-xs">
              {syncQueueLength}
            </div>
          )}
        </div>
      </Badge>
    </div>
  );
}
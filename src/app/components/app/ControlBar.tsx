import React from 'react';
import { Menu, Settings, X, User } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import LanguageToggle from '../language/LanguageToggle';

interface ControlBarProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onOpenAdminPanel: () => void;
  isZh: boolean;
}

export default function ControlBar({ 
  isMobileMenuOpen, 
  onToggleMobileMenu, 
  onOpenAdminPanel, 
  isZh 
}: ControlBarProps) {
  
  const { isAuthenticated, user } = useAuth();
  
  const handleAdminClick = () => {
    console.log('Admin button clicked');
    onOpenAdminPanel();
  };

  return (
    null
  );
}
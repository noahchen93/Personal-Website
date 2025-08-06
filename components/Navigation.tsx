import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from './ui/sheet';
import { Menu, Home, User, GraduationCap, Briefcase, FolderOpen, Heart, Mail, Settings } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';

const navigationItemsConfig = [
  { key: 'home', href: '#home', icon: Home },
  { key: 'about', href: '#about', icon: User },
  { key: 'education', href: '#education', icon: GraduationCap },
  { key: 'experience', href: '#experience', icon: Briefcase },
  { key: 'projects', href: '#projects', icon: FolderOpen },
  { key: 'interests', href: '#interests', icon: Heart },
  { key: 'contact', href: '#contact', icon: Mail },
];

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isAdmin?: boolean;
  onAdminToggle?: () => void;
}

export function Navigation({ activeSection, onSectionChange, isAdmin, onAdminToggle }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const handleNavClick = (href: string) => {
    onSectionChange(href.replace('#', ''));
    setIsMobileMenuOpen(false);
  };

  const NavContent = () => (
    <nav className="space-y-2">
      {navigationItemsConfig.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.href.replace('#', '');
        return (
          <button
            key={item.key}
            onClick={() => handleNavClick(item.href)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{t(`nav.${item.key}`)}</span>
          </button>
        );
      })}
      
      {onAdminToggle && (
        <div className="pt-4 border-t border-border">
          <button
            onClick={onAdminToggle}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isAdmin 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>{isAdmin ? t('nav.exit-admin') : t('nav.admin')}</span>
          </button>
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl">{t('nav.title')}</h1>
              <p className="text-muted-foreground mt-2 text-sm">{t('nav.subtitle')}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <LanguageToggle />
          </div>
        </div>
        <NavContent />
      </aside>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl">{t('nav.title')}</h1>
          <div className="flex items-center space-x-2">
            <LanguageToggle />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <h1 className="text-2xl">{t('nav.title')}</h1>
                    <p className="text-muted-foreground mt-2 text-sm">{t('nav.subtitle')}</p>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-auto">
                  <NavContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  );
}
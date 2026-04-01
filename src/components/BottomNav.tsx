import { NavLink, useLocation } from 'react-router-dom';
import { Home, Activity, Pill, Clock, Settings } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/symptoms', icon: Activity, label: 'Symptoms' },
  { to: '/medications', icon: Pill, label: 'Meds' },
  { to: '/timeline', icon: Clock, label: 'Timeline' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border md:hidden pb-[env(safe-area-inset-bottom)]" aria-label="Main navigation">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export function SideNav() {
  const location = useLocation();
  return (
    <nav className="hidden md:flex flex-col w-56 min-h-screen bg-card border-r border-border p-4 gap-1 fixed left-0 top-0" aria-label="Main navigation">
      <div className="flex items-center gap-2 px-3 py-4 mb-4">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
          C
        </div>
        <span className="font-semibold text-foreground">CareThread</span>
      </div>
      {tabs.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to;
        return (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}

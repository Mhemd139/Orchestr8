import { Home, BookOpen, Play, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/teach', icon: BookOpen, label: 'Teach' },
  { to: '/run', icon: Play, label: 'Run' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-bold text-foreground">Shadow Worker</h1>
      </div>
      
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            activeClassName="bg-card text-primary"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

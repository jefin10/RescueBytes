import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  LayoutDashboard, Map, Bell, Shield,
  Package, Users, Newspaper, MessageSquare, UserCheck, LogOut,
} from 'lucide-react';
import api_url from '../api.tsx';

const mainLinks = [
  { label: 'Dashboard', path: '/home', icon: LayoutDashboard },
  { label: 'SOS Map', path: '/sos-map', icon: Map },
  { label: 'Alerts', path: '/warnings', icon: Bell },
  { label: 'Danger Zones', path: '/danger-zones', icon: Shield },
];

const manageLinks = [
  { label: 'Inventory', path: '/ManageInventory', icon: Package },
  { label: 'User Requests', path: '/user-request', icon: Users },
  { label: 'News', path: '/newspage', icon: Newspaper },
  { label: 'Community Reports', path: '/communityReports', icon: MessageSquare },
  { label: 'Volunteers', path: '/volunteer', icon: UserCheck },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await fetch(`${api_url}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {}
    Cookies.remove('session_token');
    navigate('/login');
  };

  return (
    <div className="w-56 h-screen bg-slate-900 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-4 flex items-center gap-2.5 border-b border-white/10">
        <img src="./rescuebytes-logo.png" alt="" className="w-7 h-7" />
        <span className="text-white font-bold text-sm tracking-wide">RescueBytes</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {mainLinks.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition-colors ${
                isActive(path)
                  ? 'bg-white/12 text-white font-medium'
                  : 'text-white/55 hover:text-white/85 hover:bg-white/6'
              }`}
            >
              <Icon size={15} className="shrink-0" />
              {label}
            </button>
          ))}
        </div>

        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-3 mt-6 mb-2">
          Manage
        </p>

        <div className="space-y-0.5">
          {manageLinks.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition-colors ${
                isActive(path)
                  ? 'bg-white/12 text-white font-medium'
                  : 'text-white/55 hover:text-white/85 hover:bg-white/6'
              }`}
            >
              <Icon size={15} className="shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-2.5 py-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-white/50 hover:text-white/80 hover:bg-white/5 rounded flex items-center gap-2.5 transition-colors"
        >
          <LogOut size={15} className="shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

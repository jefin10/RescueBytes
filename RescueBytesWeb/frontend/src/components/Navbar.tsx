import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, MapPin, Clock } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import api_url from "../api.tsx";

interface SosAlert {
  _id: string;
  createdAt: string;
  location: string;
  user?: { email: string };
}

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  useEffect(() => {
    fetchRecentSOS();
  }, []);

  const fetchRecentSOS = async () => {
    try {
      const sessionId = Cookies.get('session_id');
      const response = await axios.get(`${api_url}/sos`, {
        headers: { 'Authorization': `Bearer ${sessionId}` }
      });
      const sorted = response.data
        .sort((a: SosAlert, b: SosAlert) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setSosAlerts(sorted);
    } catch {
      // silent
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${api_url}/auth/logout`, { method: "POST", credentials: "include" });
      navigate("/login");
    } catch {
      // silent
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const diffMins = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const parseLocation = (loc: string) => {
    if (typeof loc === 'string' && loc.includes(',')) {
      const [lat, lng] = loc.split(',').map(Number);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    return 'Unknown location';
  };

  const navLinks = [
    { label: 'Dashboard', path: '/home' },
    { label: 'SOS Map', path: '/sos-map' },
    { label: 'Alerts', path: '/warnings' },
    { label: 'Danger Zones', path: '/danger-zones' },
  ];

  return (
    <nav className="bg-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Left */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
              <img src="./rescuebytes-logo.png" alt="Logo" className="w-7 h-7" />
              <span className="font-semibold text-sm">RescueBytes</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((l) => (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  className={`text-sm pb-0.5 transition-colors active:opacity-70 ${
                    isActive(l.path)
                      ? 'text-white border-b border-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* SOS bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative text-white/80 hover:text-white transition-colors p-1.5 rounded hover:bg-white/10 active:bg-white/20"
                aria-label="SOS alerts"
              >
                <Bell size={18} />
                {sosAlerts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-semibold bg-red-500 rounded-full flex items-center justify-center leading-none">
                    {sosAlerts.length}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-gray-900 rounded shadow-lg border border-gray-100 z-50">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Emergency SOS</span>
                    <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{sosAlerts.length}</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {sosAlerts.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">No active SOS alerts</p>
                    ) : (
                      sosAlerts.map((sos) => (
                        <div key={sos._id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs font-semibold text-red-600">SOS Alert</p>
                            <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                              <Clock size={10} />
                              {formatTimeAgo(sos.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{sos.user?.email || 'Unknown user'}</p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <MapPin size={10} />
                            {parseLocation(sos.location)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    className="w-full py-2 text-xs text-blue-600 hover:underline"
                    onClick={() => { navigate('/sos-map'); setIsNotificationsOpen(false); }}
                  >
                    View all alerts
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="text-sm text-white/70 hover:text-white transition-colors active:opacity-60 px-1"
            >
              Logout
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-blue-700 px-4 py-3 space-y-2">
          {navLinks.map((l) => (
            <button
              key={l.path}
              onClick={() => { navigate(l.path); setIsMobileMenuOpen(false); }}
              className={`block w-full text-left text-sm py-1.5 ${
                isActive(l.path) ? 'text-white font-medium' : 'text-white/70'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

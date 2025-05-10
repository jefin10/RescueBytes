import  { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import api_url from "../api.tsx";
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  interface SosAlert {
    _id: string;
    createdAt: string;
    location: string;
    user?: {
      email: string;
    };
  }

  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location/URL
  
  // Determine if a given path is active
  const isActive = (path: string) => {
    // Use startsWith to match base paths like '/home' even if URL has additional params
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    // Fetch SOS alerts when the dropdown is opened
    
      fetchRecentSOS();
  }, []);

  const fetchRecentSOS = async () => {
    try {
      setLoading(true);
      const sessionId = Cookies.get('session_id');
      
      // Get all SOS alerts and limit to the 5 most recent
      const response = await axios.get(`${api_url}/sos`, {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });
      
      // Sort by creation date (newest first) and take the first 5
      const sortedAlerts = response.data
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      
      setSosAlerts(sortedAlerts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching SOS alerts:", error);
      setLoading(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  // ✅ Logout Function
  const handleLogout = async () => {
    try {
      const response = await fetch(`${api_url}/auth/logout`, {
        method: "POST",
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        throw new Error("Failed to log out");
      }

      // Redirect to login page after logout
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Format time difference for display
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / 1440)}d ago`;
    }
  };

  // Parse coordinates from location string
  const parseLocation = (locationStr: any) => {
    if (typeof locationStr === 'string' && locationStr.includes(',')) {
      const [lat, lng] = locationStr.split(',').map(coord => parseFloat(coord.trim()));
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
    return 'Unknown location';
  };

  return (
    <nav className="text-white bg-blue-800 shadow-lg ">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 ">
        <div className="flex justify-between h-16">
          {/* Left Section - Logo & Menu */}
          <div className="flex items-center">
            <div className="flex items-center flex-shrink-0">
              <img src="./RESCUE (4).png" alt="Logo" className="w-10 h-10 mx-2" />
              <span className="text-xl font-bold">RescueBytez</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <div 
                onClick={() => navigate('/home')} 
                className={`px-1 pt-1 text-sm font-medium border-b-2 cursor-pointer ${
                  isActive('/home') ? 'border-white' : 'border-transparent hover:border-gray-300'
                }`}
              >
                Dashboard
              </div>
              <div 
                onClick={() => navigate('/sos-map')} 
                className={`px-1 pt-1 text-sm font-medium border-b-2 cursor-pointer ${
                  isActive('/sos-map') ? 'border-white' : 'border-transparent hover:border-gray-300'
                }`}
              >
                SOS Map
              </div>
              <div 
                onClick={() => navigate('/warnings')} 
                className={`px-1 pt-1 text-sm font-medium border-b-2 cursor-pointer ${
                  isActive('/warnings') ? 'border-white' : 'border-transparent hover:border-gray-300'
                }`}
              >
                Alerts
              </div>
            </div>
          </div>

          {/* Right Section - Notifications, Profile & Logout */}
          <div className="flex items-center space-x-4">
            {/* 🔔 Bell Icon (SOS Alerts) */}
            <div className="relative z-50">
              <button 
                className="p-2 text-white rounded-full hover:bg-blue-700 focus:outline-none"
                onClick={toggleNotifications}
              >
                <span className="sr-only">View SOS alerts</span>
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {/* Notification badge */}
                {sosAlerts.length > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-600 rounded-full">
                    {sosAlerts.length}
                  </span>
                )}
              </button>
              
              {/* SOS Alerts Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 z-50 mt-2 origin-top-right bg-white rounded-md shadow-lg w-80 ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                      <span>Emergency SOS Alerts</span>
                      <span className="px-2 py-0.5 text-xs font-medium text-white bg-red-600 rounded-full">
                        {sosAlerts.length}
                      </span>
                    </div>
                    <div className="overflow-y-auto max-h-96">
                      {loading ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                        </div>
                      ) : sosAlerts.length > 0 ? (
                        sosAlerts.map((sos) => (
                          <div
                            key={sos._id}
                            className="px-4 py-3 transition-colors border-b border-gray-100 bg-red-50 hover:bg-red-100"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 text-white bg-red-600 rounded-full">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="w-full ml-3">
                                <div className="flex justify-between">
                                  <p className="text-sm font-medium text-red-800">
                                    EMERGENCY SOS ALERT
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {formatTimeAgo(sos.createdAt)}
                                  </span>
                                </div>
                                <div className="mt-1 space-y-1 text-sm text-gray-600">
                                  <p className="flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                    {sos.user?.email || 'Unknown user'}
                                  </p>
                                  <p className="flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    {parseLocation(sos.location)}
                                  </p>
                                </div>
                                <div className="flex mt-2 space-x-2">
                                  
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-sm text-center text-gray-500">
                          No active SOS alerts
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-2 text-xs text-center text-blue-600 border-t border-gray-200 hover:underline">
                      <button onClick={() => { navigate('/sos-map'); setIsNotificationsOpen(false); }}>
                        View all emergency alerts
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 🖼️ Profile Picture */}
            <div className="relative">
              <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white">
                <span className="sr-only">Open user menu</span>
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-sm font-medium">AD</span>
                </div>
              </button>
            </div>

            {/* 🚪 Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div 
              onClick={() => navigate('/home')}
              className={`block px-3 py-2 text-base font-medium rounded-md cursor-pointer ${
                isActive('/home') ? 'text-white bg-blue-900' : 'text-gray-300 hover:bg-blue-700 hover:text-white'
              }`}
            >
              Dashboard
            </div>
            <div 
              onClick={() => navigate('/sos-map')}
              className={`block px-3 py-2 text-base font-medium rounded-md cursor-pointer ${
                isActive('/sos-map') ? 'text-white bg-blue-900' : 'text-gray-300 hover:bg-blue-700 hover:text-white'
              }`}
            >
              SOS Map
            </div>
            <div 
              onClick={() => navigate('/warnings')}
              className={`block px-3 py-2 text-base font-medium rounded-md cursor-pointer ${
                isActive('/warnings') ? 'text-white bg-blue-900' : 'text-gray-300 hover:bg-blue-700 hover:text-white'
              }`}
            >
              Alerts
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
import React, { useState, useEffect } from 'react';
import { MapContainer, Marker, TileLayer, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Cookies from 'js-cookie'; // Import js-cookie library
import api_url from '../api.tsx';


// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create a custom emergency icon
const emergencyIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'emergency-marker' // You can add custom CSS for this class to make it red
});

// This component helps us update map bounds
function MapBoundsUpdater({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);
  
  return null;
}


interface UserData {
  role?: string;
  RescueCenters?: string;
}

// Custom notification component
interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification-container ${type === 'success' ? 'notification-success' : 'notification-error'}`}>
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        {type === 'success' ? (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        )}
      </div>
      <div className="ml-3 text-sm font-medium text-gray-900">
        {message}
      </div>
      <button type="button" title="Close notification" className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-900 focus:ring-2 focus:ring-gray-300" onClick={onClose}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
        </svg>
      </button>
    </div>
  );
};

const SosMap = ({ initialCenter = [9.7552, 76.6501] as [number, number], zoom = 13 }) => {
  const [mapReady, setMapReady] = useState(false);
  const [containerReady, setContainerReady] = useState(false);
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRescueCenter] = useState('all');
  // Removed unused rescueCenters state
  const [userData, setUserData] = useState<UserData | null>(null);
  // Add notification state
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Get user data from cookies
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = Cookies.get('user_id');
        const sessionId = Cookies.get('session_id');
        
        if (userId && sessionId) {
          // Fetch user data using the user_id
          const response = await axios.get(`${api_url}/users/${userId}`, {
            headers: {
              // Include session_id in headers for authentication
              'Authorization': `Bearer ${sessionId}`
            }
          });
          
          setUserData(response.data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    
    fetchUserData();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const response = await fetch(`${api_url}/deleteSOS`, {
        'method': 'POST',
        'headers': {
          'Content-Type': 'application/json'
        },
        'body': JSON.stringify({id})
      });
      
      const data = await response.json();
      console.log(data);
      
      if(response.ok) {
        // Show success notification instead of alert
        setNotification({
          message: 'SOS Alert successfully resolved!',
          type: 'success'
        });
        
        fetchSOSAlerts(); // Refresh the SOS alerts after resolving one
      } else {
        // Show error notification instead of alert
        setNotification({
          message: 'Error resolving SOS Alert!',
          type: 'error'
        });
      }
    } catch(error) {
      console.error(error);
      // Show error notification for exceptions
      setNotification({
        message: 'An error occurred while resolving the alert',
        type: 'error'
      });
    }
  };
  
  // Function to close notification
  const closeNotification = () => {
    setNotification(null);
  };
  
  // Function to fetch rescue centers
  
  
  // Fetch SOS alerts
  const fetchSOSAlerts = async () => {
    try {
      setLoading(true);
      const sessionId = Cookies.get('session_id');
      
      // Determine the endpoint based on user role and selected rescue center
      let endpoint = '/sos';
      
      if (userData?.role === 'admin' && userData?.RescueCenters && selectedRescueCenter === 'own') {
        // Admin viewing only their rescue center
        endpoint = `/emergency/sos/rescuecenter/${userData.RescueCenters}`;
      } else if (selectedRescueCenter !== 'all' && selectedRescueCenter !== 'own') {
        // Specific rescue center selected
        endpoint = `/emergency/sos/rescuecenter/${selectedRescueCenter}`;
      }
      
      const response = await axios.get(`${api_url}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });
      // Ensure we have an array
      const alerts = Array.isArray(response.data) ? response.data : [];
      
      // Add index property to each alert
      const alertsWithIndex = alerts.map((alert, index) => ({
        ...alert,
        index: `${index + 1}`
      }));
      
      setSosAlerts(alertsWithIndex);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching SOS alerts:', err);
      setError('Failed to load emergency alerts');
      setLoading(false);
      // Set to empty array in case of error
      setSosAlerts([]);
    }
  };
  
  useEffect(() => {
    // Set map as ready
    setMapReady(true);
    // Ensure the component is mounted
    setContainerReady(true);
    
    // Fetch rescue centers for filter dropdown
  
    
    // Fetch initial SOS alerts
    fetchSOSAlerts();
    
    // Poll for new SOS alerts every 30 seconds
    const interval = setInterval(fetchSOSAlerts, 300000);
    
    return () => clearInterval(interval);
  }, [userData, selectedRescueCenter]);
  
  // Parse location string to get coordinates
  const parseLocation = (locationStr: string): L.LatLngTuple => {
    if (typeof locationStr === 'string' && locationStr.includes(',')) {
      const [lat, lng] = locationStr.split(',').map(coord => parseFloat(coord.trim()));
      return [lat, lng] as L.LatLngTuple;
    }
    return initialCenter as L.LatLngTuple;
  };
  
  // Calculate map bounds to fit all markers - with improved error handling
  const getBounds = () => {
    if (!sosAlerts || sosAlerts.length === 0) return null;
    
    try {
      const positions = sosAlerts
        .filter(alert => alert.location && typeof alert.location === 'string')
        .map(alert => parseLocation(alert.location));
        
      if (positions.length === 0) return null;
      return L.latLngBounds(positions);
    } catch (err) {
      console.error('Error creating bounds:', err);
      return null;
    }
  };
  
  // Handle rescue center filter change


  // Get bounds for map
  const bounds = getBounds();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Display notification if exists */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={closeNotification} 
        />
      )}
      
      <main className="flex-grow">
        <div className="px-4 py-5 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 mr-4 text-white bg-blue-800 rounded-md">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">SOS Location Map</h3>
                </div>
                
                {/* Filter by rescue center */}
             
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-b-2 border-blue-800 rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="py-8 text-center">
                  <div className="mb-2 text-red-500">{error}</div>
                  <button 
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                    onClick={fetchSOSAlerts}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">
                      {sosAlerts.length > 0 
                        ? `${sosAlerts.length} active emergency alerts. Coordinate emergency response teams and resources efficiently.`
                        : 'No active emergency alerts at this time.'}
                    </p>
                    
                    <button 
                      className="flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                      onClick={fetchSOSAlerts}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      Refresh
                    </button>
                  </div>
                  
                  <div className="mb-4 overflow-hidden border border-gray-200 rounded-lg">
                    {mapReady && containerReady && (
                      <MapContainer 
                        center={initialCenter}
                        zoom={zoom}
                        zoomControl={false}
                        className="w-full h-96"
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          maxZoom={19}
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <ZoomControl position="bottomright" />
                        
                        {/* Add the bounds updater component */}
                        {bounds && <MapBoundsUpdater bounds={bounds} />}
                        
                        {sosAlerts.map((alert) => {
                          const position = parseLocation(alert.location);
                          const alertTime = new Date(alert.createdAt);
                          const timeAgo = Math.floor((new Date().getTime() - alertTime.getTime()) / 60000); // minutes
                          
                          return (
                            <Marker 
                              key={alert._id} 
                              position={position}
                              icon={emergencyIcon}
                            >
                              <Popup className="sos-popup">
                                <div className="p-2">
                                  <div className="px-2 py-1 mb-2 text-xs font-semibold text-red-800 bg-red-100 rounded">
                                    EMERGENCY SOS
                                  </div>
                                  
                                  <h4 className="mb-1 font-bold text-gray-900">
                                    SOS Alert {timeAgo < 60 ? `(${timeAgo}m ago)` : ''}
                                  </h4>
                                  
                                  <div className="space-y-1 text-sm">
                                    <p className="flex items-center text-gray-600">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                      </svg>
                                      {alert.user?.email || 'Unknown user'}
                                    </p>
                                    
                                    <p className="flex items-center text-gray-600">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                      </svg>
                                      {alert.rescueCenter?.location || 'Unknown center'}
                                    </p>
                                    
                                    <p className="flex items-center text-gray-600">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                      </svg>
                                      {position[0].toFixed(5)}, {position[1].toFixed(5)}
                                    </p>
                                    
                                    <p className="flex items-center text-gray-600">
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                      </svg>
                                      {alertTime.toLocaleString()}
                                    </p>
                                  </div>
                                  
                                  <div className="pt-2 mt-3 border-t border-gray-200">
                                    <div className="flex justify-between">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                        Priority: High
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        ID: {alert._id.slice(-6)}
                                      </span>
                                    </div>
                                    
                                    <div className="flex mt-2 space-x-2">
                                      <button type="button" className="flex-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                                        Dispatch Team
                                      </button>
                                      <button type="button" className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                                        Contact User
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          );
                        })}
                      </MapContainer>
                    )}
                  </div>
                  
                  {sosAlerts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-medium text-gray-900">Active Emergencies</h4>
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                ID
                              </th>
                              <th scope="col" className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                User
                              </th>
                              <th scope="col" className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Rescue Center
                              </th>
                              <th scope="col" className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Time
                              </th>
                              <th scope="col" className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {sosAlerts.map((alert) => {
                              const alertTime = new Date(alert.createdAt);
                              
                              return (
                                <tr key={alert._id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                                    {alert.index}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                                    {alert.user?.email || 'Unknown'}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                                    {alert.rescueCenter?.location || 'Unknown'}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                                    {alertTime.toLocaleString()}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                      <button className="px-2 py-1 text-xs text-red-600 hover:text-red-800" onClick={()=>handleResolve(alert._id)}>
                                        Resolve
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-auto bg-white">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between pt-4 border-t border-gray-200 md:flex-row">
            <div className="text-sm text-gray-500">
              © 2025 RescueBytez. All rights reserved.
            </div>
            <div className="flex mt-4 space-x-6 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Help Center
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SosMap;
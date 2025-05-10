import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api_url from '../api.tsx';

const Home = () => {
  const [stats, setStats] = useState({
    sosCount: 0,
    volunteerCount: 0,
    userReq: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api_url}/getStats`);
        const result=await response.data;
        console.log(result);
        setStats(result);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Error Loading Stats');
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Remove unused function
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <Navbar/>
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 right-0 flex items-center px-2 text-white pointer-events-none">
                <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Emergency Statistics Panel */}
          <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-0">
  {/* Emergency Statistics Panel */}
  <div className="px-4 py-6 mb-6 sm:px-0">
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Emergency Status</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading statistics...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-red-700 bg-red-100 rounded-md">
            {error}. Please try refreshing the page.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                title: "Active SOS",
                value: stats.sosCount,
                bgColor: "bg-red-100",
                iconBg: "bg-red-500",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                ),
              },
              {
                title: "Service Requests",
                value: stats.userReq,
                bgColor: "bg-yellow-100",
                iconBg: "bg-yellow-500",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ),
              },
              {
                title: "Available Volunteers",
                value: stats.volunteerCount,
                bgColor: "bg-green-100",
                iconBg: "bg-green-500",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                ),
              },
            ].map((stat, index) => (
              <div key={index} className={`overflow-hidden rounded-lg shadow ${stat.bgColor}`}>
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-md ${stat.iconBg}`}>
                      <svg
                        className="w-6 h-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {stat.icon}
                      </svg>
                    </div>
                    <div className="flex-1 w-0 ml-5">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                        <dd className="text-3xl font-semibold text-gray-900">{stat.value}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
</div>


          {/* Feature Grid */}
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Inventory Management */}
              <div className="overflow-hidden transition-shadow bg-white rounded-lg shadow hover:shadow-md">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-blue-800 rounded-md">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Inventory Management</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Track and manage emergency supplies, request resources from other districts, and monitor inventory levels.
                  </p>
                  <div className="mt-4">
                  <div 
                      onClick={() => navigate('/Manageinventory')}
                      className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-500"
                    >
                      Manage inventory <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Requests */}
              <div className="overflow-hidden transition-shadow bg-white rounded-lg shadow hover:shadow-md">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-blue-800 rounded-md">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">User Requests</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    View and respond to service requests from community members, prioritize needs, and assign volunteers.
                  </p>
                  <div className="mt-4">
                  <div 
                      onClick={() => navigate('/user-request')}
                      className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-500"
                    >
                      View requests <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* News Manager */}
              <div className="overflow-hidden transition-shadow bg-white rounded-lg shadow hover:shadow-md">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-blue-800 rounded-md">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">News Manager</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Publish important updates, emergency instructions, and community news to keep residents informed.
                  </p>
                  <div className="mt-4">
                  <div 
                      onClick={() => navigate('/newspage')}
                      className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-500"
                    >
                      Manage news <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SOS Map */}
              <div className="overflow-hidden transition-shadow bg-white rounded-lg shadow hover:shadow-md">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-blue-800 rounded-md">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">SOS Map</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    View and respond to emergency SOS signals on an interactive map. Coordinate response teams efficiently.
                  </p>
                  <div className="mt-4">
                  <div 
                      onClick={() => navigate('/sos-map')}
                      className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-500"
                    >
                      Open map <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Warnings */}
              <div className="overflow-hidden transition-shadow bg-white rounded-lg shadow hover:shadow-md">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-blue-800 rounded-md">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Community Reports</h3>
                  <p className="mt-2 text-sm text-gray-500">
                  Approve and broadcast community reported news and information, ensuring verified updates reach residents promptly during emergencies.
                  </p>
                  <div className="mt-4">
                  <div 
                      onClick={() => navigate('/communityReports')}
                      className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-500"
                    >
                      Approve Reports <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Allocating Volunteers */}
              <div className="overflow-hidden transition-shadow bg-white rounded-lg shadow hover:shadow-md">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-center w-12 h-12 mb-4 text-white bg-blue-800 rounded-md">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Allocating Volunteers</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Manage volunteer resources, assign tasks based on skills, and track deployment status.
                  </p>
                  <div className="mt-4">
                  <div 
                      onClick={() => navigate('/volunteer')}
                      className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-500"
                    >
                      Manage volunteers <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between pt-4 border-t border-gray-200 md:flex-row">
            <div className="text-sm text-gray-500">
              © 2025 RescueBytez. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;